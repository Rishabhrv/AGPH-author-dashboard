"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  BookOpen, CheckCircle2, PenTool, Image as ImageIcon, Barcode, Globe, FileText,
  Clock, AlertTriangle, Search, Eye, Printer, Truck, ShieldCheck, RotateCcw,
  Upload, Bell, ChevronDown, ChevronUp, Circle, X, Sparkles, ExternalLink,
  SendHorizonal, MessageSquare, LayoutGrid, ListChecks
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   TYPES & CONSTANTS
   ───────────────────────────────────────────────────────────────────────── */

type IntakePath = "author_content" | "agph_written";

const ALL_STAGES = [
  "Content Received", "ISBN Assigned", "Cover Design", "Writing",
  "Digital Proof", "Printing", "Dispatched", "Listed on Platforms"
] as const;

type Stage = typeof ALL_STAGES[number];

type StepStatus = "Not Started" | "In Progress" | "Action Needed" | "Completed";

type EnrichedStep = {
  stage: string;
  status: StepStatus;
  note: string;
  icon: React.ElementType;
};

type Correction = {
  correction_id: number;
  section: "writing" | "proofreading" | "formatting" | "cover";
  correction_start: string | null;
  correction_end: string | null;
  worker: string | null;
  notes: string | null;
  round_number: number;
  is_active: boolean;
};

const CORRECTION_SECTION_LABELS: Record<string, string> = {
  writing: "Writing Correction",
  proofreading: "Proofreading Correction",
  formatting: "Formatting Correction",
  cover: "Cover Correction",
};

const STAGE_ICONS: Record<Stage, React.ElementType> = {
  "Content Received": Upload,
  "ISBN Assigned": Barcode,
  Writing: PenTool,
  "Cover Design": ImageIcon,
  "Digital Proof": Eye,
  Printing: Printer,
  Dispatched: Truck,
  "Listed on Platforms": Globe,
};

type EnrichedBook = {
  id: string;
  title: string;
  book_id: number;
  intakePath: IntakePath;
  steps: EnrichedStep[];
  isCompleted: boolean;
  needsAction: boolean;
  completedStepsCount: number;
  totalStepsCount: number;
  // Raw backend fields
  isbn?: string;
  syllabus_path?: string;
  manuscript_path?: string;
  print_status?: number;
  writing_start?: string;
  writing_end?: string;
  cover_pdf_link?: string;
  proof_pdf_link?: string;
  delivery_date?: string;
  amazon_link?: string;
  agph_link?: string;
  flipkart_link?: string;
  google_link?: string;
  is_thesis_to_book?: boolean | number;
  is_publish_only?: boolean | number;
  digital_book_sent?: boolean | number;
  corrections: Correction[];
  approvals: string[];
};

/* ─────────────────────────────────────────────────────────────────────────
   STEP DERIVATION LOGIC (INDEPENDENT) — unchanged from your original
   ───────────────────────────────────────────────────────────────────────── */

function deriveSteps(book: any, intakePath: IntakePath, corrections: Correction[], approvals: string[]): EnrichedStep[] {
  const steps: EnrichedStep[] = [];

  // 1. Content Received (shown for all books)
  {
    let status: StepStatus = "Not Started";
    let typeName = "Syllabus";
    if (book.is_thesis_to_book) typeName = "Thesis";
    else if (book.is_publish_only) typeName = "Content";

    let note = `Waiting for ${typeName.toLowerCase()} upload.`;
    const hasContent = (book.is_thesis_to_book || book.is_publish_only) ? book.manuscript_path : book.syllabus_path;
    if (hasContent) {
      status = "Completed";
      note = `${typeName} uploaded successfully.`;
    }
    steps.push({ stage: `${typeName} Received`, status, note, icon: STAGE_ICONS["Content Received"] });
  }

  // 2. ISBN Assigned
  {
    let status: StepStatus = book.isbn ? "Completed" : "Not Started";
    let note = book.isbn ? `ISBN: ${book.isbn}` : "Pending ISBN assignment.";
    steps.push({ stage: "ISBN Assigned", status, note, icon: STAGE_ICONS["ISBN Assigned"] });
  }

  // 3. Cover Design
  {
    let status: StepStatus = "Not Started";
    let note = "Cover design pending.";

    const hasActiveCoverCorr = corrections.some(c => c.is_active && (c.section === "cover" || c.section === "formatting"));
    const isCoverApproved = approvals.includes("cover_design");
    const isDigitalProofApproved = approvals.includes("digital_proof");

    if (isCoverApproved || isDigitalProofApproved) {
      // If digital proof is approved, cover is implicitly done too
      status = "Completed";
      note = isCoverApproved ? "Cover design approved." : "Cover approved as part of digital proof.";
    } else if (hasActiveCoverCorr) {
      status = "Action Needed";
      note = "Cover correction requested.";
    } else if (book.cover_pdf_link) {
      status = "Action Needed";
      note = "Cover proof ready for approval.";
    } else if (book.writing_end || intakePath === "author_content") {
      status = "In Progress";
      note = "Design work underway.";
    }
    steps.push({ stage: "Cover Design", status, note, icon: STAGE_ICONS["Cover Design"] });
  }

  // 4. Writing (Only for agph_written, hidden for thesis/publish only)
  if (intakePath === "agph_written" && !book.is_thesis_to_book && !book.is_publish_only) {
    let status: StepStatus = "Not Started";
    let note = "Waiting for writers to start.";

    const hasActiveWritingCorr = corrections.some(c => c.is_active && (c.section === "writing" || c.section === "proofreading"));

    if (book.writing_end) {
      status = "Completed";
      note = "Writing and proofreading finished.";
    } else if (hasActiveWritingCorr) {
      status = "Action Needed";
      note = "Writing correction requested.";
    } else if (book.writing_start) {
      status = "In Progress";
      note = "Drafting currently in progress.";
    }
    steps.push({ stage: "Writing", status, note, icon: STAGE_ICONS["Writing"] });
  }

  // 5. Digital Proof
  {
    let status: StepStatus = "Not Started";
    let note = "Digital proof pending.";

    const isApproved = approvals.includes("digital_proof");
    if (isApproved) {
      status = "Completed";
      note = "Digital proof approved.";
    } else if (book.proof_pdf_link) {
      status = "Action Needed";
      note = "Digital proof ready for approval.";
    } else if (book.digital_book_sent) {
      status = "Completed";
      note = "Digital proof sent.";
    }
    steps.push({ stage: "Digital Proof", status, note, icon: STAGE_ICONS["Digital Proof"] });
  }

  // 6. Printing
  {
    let status: StepStatus = "Not Started";
    let note = "Pending print approval.";
    if (book.print_status === 1) {
      status = "Completed";
      note = "Printing finished.";
    } else if (book.print_status === 0 && approvals.includes("digital_proof")) {
      status = "In Progress";
      note = "Currently at the printing press.";
    }
    steps.push({ stage: "Printing", status, note, icon: STAGE_ICONS["Printing"] });
  }

  // 7. Dispatched
  {
    let status: StepStatus = book.delivery_date ? "Completed" : "Not Started";
    let note = book.delivery_date ? `Dispatched on ${new Date(book.delivery_date).toLocaleDateString()}` : "Awaiting dispatch.";
    steps.push({ stage: "Dispatched", status, note, icon: STAGE_ICONS["Dispatched"] });
  }

  // 8. Listed on Platforms
  {
    const hasLinks = book.amazon_link || book.agph_link || book.flipkart_link || book.google_link;
    let status: StepStatus = hasLinks ? "Completed" : "Not Started";
    let note = hasLinks ? "Available for purchase!" : "Pending platform listings.";
    steps.push({ stage: "Listed on Platforms", status, note, icon: STAGE_ICONS["Listed on Platforms"] });
  }

  return steps;
}

function mapBackendBookToEnriched(book: any): EnrichedBook {
  const corrections: Correction[] = book.corrections || [];
  const approvals: string[] = book.approvals || [];
  const intakePath: IntakePath = book.writing_start ? "agph_written" : "author_content";

  const steps = deriveSteps(book, intakePath, corrections, approvals);

  const completedStepsCount = steps.filter(s => s.status === "Completed").length;
  const totalStepsCount = steps.length;
  const needsAction = steps.some(s => s.status === "Action Needed");

  const hasStoreLinks = book.amazon_link || book.agph_link || book.flipkart_link || book.google_link;
  const isCompleted = hasStoreLinks;

  return {
    ...book,
    id: String(book.book_id),
    title: book.title || "Untitled Book",
    intakePath,
    steps,
    isCompleted,
    needsAction,
    completedStepsCount,
    totalStepsCount,
    corrections,
    approvals,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT — unchanged from your original
   ───────────────────────────────────────────────────────────────────────── */

export default function BookProgressPageCo({ initialData = [] }: { initialData?: any[] }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed">("ongoing");

  const enrichedBooks = useMemo(
    () => (initialData || []).map((book) => mapBackendBookToEnriched(book)),
    [initialData]
  );

  const filteredBooks = useMemo(() => {
    let list = enrichedBooks;
    if (activeTab === "ongoing") {
      list = list.filter(b => !b.isCompleted);
    } else {
      list = list.filter(b => b.isCompleted);
    }

    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((b) => b.title.toLowerCase().includes(q));
  }, [enrichedBooks, query, activeTab]);

  const actionBooks = enrichedBooks.filter((b) => b.needsAction && !b.isCompleted);
  const totalOngoing = enrichedBooks.filter(b => !b.isCompleted).length;
  const totalCompleted = enrichedBooks.filter(b => b.isCompleted).length;

  return (
    <div className="flex flex-col gap-8 mx-auto w-full pb-14 min-h-screen">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Book Progress
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">
            Track every independent stage of production — from manuscript to marketplace.
          </p>
        </div>
        {actionBooks.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[13px] font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-shadow">
              <Bell size={16} className="animate-pulse" />
              {actionBooks.length} book{actionBooks.length > 1 ? "s" : ""} need your attention
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs & Search ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
        <div className="flex w-full sm:w-auto bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${activeTab === "ongoing"
              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-500 hover:bg-slate-100"
              }`}
          >
            <Clock size={15} />
            Ongoing
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'ongoing' ? 'bg-slate-100' : 'bg-slate-100'}`}>
              {totalOngoing}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${activeTab === "completed"
              ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-900/5"
              : "text-slate-500 hover:text-slate-500 hover:bg-slate-100"
              }`}
          >
            <CheckCircle2 size={15} />
            Completed
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>
              {totalCompleted}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books…"
            className="w-full text-[13px] font-medium text-slate-900 bg-white border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-full p-0.5">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Book Cards ── */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white/50 border border-slate-200 rounded-xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-slate-500" />
          </div>
          <p className="text-[15px] font-bold text-slate-500">No books found</p>
          <p className="text-[13px] text-slate-500 mt-1">{query ? `Nothing matches "${query}"` : `No ${activeTab} books available.`}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isExpanded={expandedId === book.id}
              onToggle={() => setExpandedId(expandedId === book.id ? null : book.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP STATUS STYLING — shared by strip, focus cards, chips
   ───────────────────────────────────────────────────────────────────────── */

const STATUS_STYLE: Record<StepStatus, { card: string; iconBg: string; pill: string; dot: string }> = {
  "Not Started": {
    card: "bg-white border-slate-200 text-slate-500",
    iconBg: "bg-slate-100 text-slate-500",
    pill: "bg-slate-100 text-slate-500",
    dot: "bg-slate-300",
  },
  "In Progress": {
    card: "bg-blue-50/50 border-blue-200 text-blue-800 ring-1 ring-blue-500/10",
    iconBg: "bg-blue-100 text-blue-600",
    pill: "bg-blue-200/50 text-blue-700",
    dot: "bg-blue-500",
  },
  "Action Needed": {
    card: "bg-amber-50/80 border-amber-300 text-amber-900 ring-2 ring-amber-400/20 shadow-sm",
    iconBg: "bg-amber-200 text-amber-700",
    pill: "bg-amber-200/60 text-amber-800",
    dot: "bg-amber-500",
  },
  Completed: {
    card: "bg-emerald-50/40 border-emerald-200 text-emerald-800",
    iconBg: "bg-emerald-100 text-emerald-600",
    pill: "bg-emerald-200/50 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

/**
 * Buckets a step for DISPLAY purposes (separate from its raw backend `status`).
 * Content/Syllabus/Thesis Received sits at "Not Started" in your data model,
 * but it's the one thing the author actually needs to act on — so it's
 * promoted into "attention" here rather than shown as a passive upcoming tile.
 */
function getDisplayGroup(step: EnrichedStep): "attention" | "progress" | "completed" | "upcoming" {
  if (step.status === "Action Needed") return "attention";
  if (step.status === "In Progress") return "progress";
  if (step.status === "Completed") return "completed";
  if (step.stage.endsWith("Received")) return "attention";
  return "upcoming";
}

/* ─────────────────────────────────────────────────────────────────────────
   BOOK CARD
   ───────────────────────────────────────────────────────────────────────── */

function BookCard({
  book,
  isExpanded,
  onToggle,
}: {
  book: EnrichedBook;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const progressPct = Math.round((book.completedStepsCount / book.totalStepsCount) * 100) || 0;

  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [expandedCompleted, setExpandedCompleted] = useState(false);
  const stageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const grouped = useMemo(() => ({
    attention: book.steps.filter((s) => getDisplayGroup(s) === "attention"),
    progress: book.steps.filter((s) => getDisplayGroup(s) === "progress"),
    completed: book.steps.filter((s) => getDisplayGroup(s) === "completed"),
    upcoming: book.steps.filter((s) => getDisplayGroup(s) === "upcoming"),
  }), [book.steps]);

  function scrollToStage(stage: string) {
    setActiveStage(stage);
    stageRefs.current[stage]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setActiveStage((cur) => (cur === stage ? null : cur)), 1000);
  }

  return (
    <div className={`group bg-white rounded-xl transition-all duration-300 ${isExpanded
      ? "shadow-lg border-slate-200 ring-1 ring-slate-200"
      : "shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-200"
      } ${book.needsAction && !isExpanded ? "ring-2 ring-amber-400/50 border-amber-300" : ""}`}>

      {/* ── Card Header ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-5 px-6 py-5 text-left outline-none rounded-xl"
      >
        {/* Progress Ring / Cover thumb */}
        <div className="relative shrink-0 flex items-center justify-center w-14 h-14">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-ink/5" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="16" fill="none"
              className={`transition-all duration-1000 ease-out ${book.isCompleted ? 'stroke-emerald-500' : 'stroke-amber-500'}`}
              strokeWidth="3"
              strokeDasharray="100 100"
              strokeDashoffset={100 - progressPct}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-500">
            {progressPct}%
          </div>
        </div>

        {/* Title + Meta */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h3 className="text-[17px] font-extrabold text-slate-900 truncate group-hover:text-amber-600 transition-colors">{book.title}</h3>
            <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full shrink-0 shadow-sm">
              <BookOpen size={10} />
              {book.is_thesis_to_book ? "Thesis to Book" : book.is_publish_only ? "Publish Only Book" : "Writing + Publishing"}
            </span>
            {book.needsAction && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full shrink-0 shadow-sm">
                <AlertTriangle size={10} /> Action Needed
              </span>
            )}
            {book.isCompleted && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0 shadow-sm">
                <Globe size={10} /> Published
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[12px] font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <LayoutGrid size={13} />
              {book.completedStepsCount} of {book.totalStepsCount} steps completed
            </span>
            {book.isbn && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-100" />
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Barcode size={12} /> {book.isbn}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Expand icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-slate-900 text-white shadow-md rotate-180' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-900'}`}>
          <ChevronDown size={18} />
        </div>
      </button>

      {/* ── Expanded: Steps grouped by what needs you, what's moving, what's done, what's ahead ── */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-200 bg-slate-900/[0.015] rounded-b-2xl">

          {/* Signature: glanceable, clickable pipeline strip */}
          <div className="mb-6 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pipeline status</span>
              <span className="text-[11px] font-semibold text-slate-500">
                {book.completedStepsCount} of {book.totalStepsCount} stages complete
              </span>
            </div>
            <div className="flex items-center gap-1">
              {book.steps.map((s) => (
                <button
                  key={s.stage}
                  type="button"
                  title={`${s.stage} — ${s.status}`}
                  onClick={() => scrollToStage(s.stage)}
                  className={`h-2 flex-1 rounded-full transition-transform duration-300 ${STATUS_STYLE[s.status].dot} ${activeStage === s.stage ? "scale-y-150 ring-2 ring-offset-1 ring-slate-400" : "hover:scale-y-125"
                    }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {grouped.attention.length > 0 && (
              <StepSection icon={AlertTriangle} tone="amber" label="Needs your attention" count={grouped.attention.length}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {grouped.attention.map((step) => (
                    <StepFocusCard
                      key={step.stage}
                      step={step}
                      book={book}
                      refEl={(el) => (stageRefs.current[step.stage] = el)}
                    />
                  ))}
                </div>
              </StepSection>
            )}

            {grouped.progress.length > 0 && (
              <StepSection icon={Clock} tone="blue" label="In progress" count={grouped.progress.length}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {grouped.progress.map((step) => (
                    <StepFocusCard
                      key={step.stage}
                      step={step}
                      book={book}
                      refEl={(el) => (stageRefs.current[step.stage] = el)}
                    />
                  ))}
                </div>
              </StepSection>
            )}

            {(grouped.completed.length > 0 || grouped.upcoming.length > 0) && (
              <StepSection
                icon={ListChecks}
                tone="emerald"
                label="Completed & Upcoming"
                count={grouped.completed.length + grouped.upcoming.length}
                collapsible
                expanded={expandedCompleted}
                onToggle={() => setExpandedCompleted((v) => !v)}
              >
                {!expandedCompleted ? (
                  <div className="flex flex-wrap gap-2">
                    {book.steps
                      .filter(s => getDisplayGroup(s) === "completed" || getDisplayGroup(s) === "upcoming")
                      .map((step) => (
                        <StepChip
                          key={step.stage}
                          step={step}
                          book={book}
                          refEl={(el) => (stageRefs.current[step.stage] = el)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {book.steps
                      .filter(s => getDisplayGroup(s) === "completed" || getDisplayGroup(s) === "upcoming")
                      .map((step) => (
                        <StepFocusCard
                          key={step.stage}
                          step={step}
                          book={book}
                          refEl={(el) => (stageRefs.current[step.stage] = el)}
                        />
                      ))}
                  </div>
                )}
              </StepSection>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP SECTION — groups steps under a labeled, colored eyebrow
   ───────────────────────────────────────────────────────────────────────── */

type SectionTone = "amber" | "blue" | "emerald" | "slate";

function StepSection({
  icon: Icon,
  tone,
  label,
  count,
  children,
  collapsible,
  expanded,
  onToggle,
}: {
  icon: React.ElementType;
  tone: SectionTone;
  label: string;
  count: number;
  children: React.ReactNode;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const toneText: Record<SectionTone, string> = {
    amber: "text-amber-700",
    blue: "text-blue-700",
    emerald: "text-emerald-700",
    slate: "text-slate-400",
  };
  const toneBg: Record<SectionTone, string> = {
    amber: "bg-amber-100",
    blue: "bg-blue-100",
    emerald: "bg-emerald-100",
    slate: "bg-slate-100",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${toneBg[tone]} ${toneText[tone]}`}>
            <Icon size={13} strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">{label}</span>
          <span className="text-[11px] font-semibold text-slate-400">({count})</span>
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            {expanded ? "Show summary" : "Show details"}
            <ChevronDown size={13} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP FOCUS CARD — full detail, used for attention / in-progress / expanded-completed
   (This is your original StepCard, unchanged in behavior — just repositioned.)
   ───────────────────────────────────────────────────────────────────────── */

function StepFocusCard({
  step,
  book,
  refEl,
}: {
  step: EnrichedStep;
  book: EnrichedBook;
  refEl: (el: HTMLDivElement | null) => void;
}) {
  const Icon = step.icon;
  const style = STATUS_STYLE[step.status];

  return (
    <div ref={refEl} className={`flex flex-col p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${style.card}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
            {step.status === "Completed" ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <Icon size={16} strokeWidth={2} />}
          </div>
          <div>
            <h4 className="text-[14px] font-bold tracking-tight">{step.stage}</h4>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${style.pill}`}>
              {step.status}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[12px] font-medium opacity-80 mb-4 flex-1">
        {step.note}
      </p>

      <div className="mt-auto">
        <StepActions step={step} book={book} />
        {(step.stage === "Writing" || step.stage === "Cover Design") && (
          <StepCorrections stage={step.stage} corrections={book.corrections} />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP CHIP — collapsed by default; tap to reveal note + actions
   ───────────────────────────────────────────────────────────────────────── */

function StepChip({
  step,
  book,
  refEl,
}: {
  step: EnrichedStep;
  book: EnrichedBook;
  refEl: (el: HTMLDivElement | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = step.status === "Completed" ? CheckCircle2 : step.icon;

  let bgClass = "";
  if (step.status === "Completed") bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100";
  else if (step.status === "In Progress") bgClass = "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100";
  else if (step.status === "Action Needed") bgClass = "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100";
  else bgClass = "bg-white border-slate-200 text-slate-500 hover:bg-slate-50";

  return (
    <div ref={refEl} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 border text-[11px] font-bold pl-2 pr-3 py-1.5 rounded-full transition-colors ${bgClass}`}
      >
        <Icon size={13} />
        {step.stage}
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 mt-1.5 w-72 bg-white border border-slate-200 shadow-lg rounded-xl p-3">
          <p className="text-[12px] text-slate-600 leading-snug mb-2">{step.note}</p>
          <StepActions step={step} book={book} />
          {(step.stage === "Writing" || step.stage === "Cover Design") && (
            <StepCorrections stage={step.stage} corrections={book.corrections} />
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP ACTIONS — unchanged from your original
   ───────────────────────────────────────────────────────────────────────── */

function toDrivePreviewUrl(url: string): string {
  const match = url.match(/\/file\/d\/([^/?]+)/);
  if (match) return `/api/proxy-drive?fileId=${match[1]}`;
  return url;
}

function StepActions({ step, book }: { step: EnrichedStep, book: EnrichedBook }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const API_URL = process.env.API_URL || "http://localhost:5001";

  const handleApprove = async (approvalType: string) => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.book_id, approval_type: approvalType }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to submit approval.");
        setIsApproving(false);
      }
    } catch {
      alert("Network error.");
      setIsApproving(false);
    }
  };

  // Content Received
  if (step.stage.endsWith("Received")) {
    const hasContent = (book.is_thesis_to_book || book.is_publish_only) ? book.manuscript_path : book.syllabus_path;

    if (hasContent) {
      const contentUrl = hasContent.startsWith("http")
        ? hasContent
        : `${API_URL}${hasContent.startsWith('/') ? '' : '/'}${hasContent}`;

      return (
        <a href={contentUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 w-full bg-white/60 hover:bg-white text-slate-500 hover:text-slate-900 border border-slate-200 text-[11px] font-bold py-2 rounded-xl transition-all">
          <FileText size={13} /> View Content <ExternalLink size={11} />
        </a>
      );
    }
    
    return null;
  }

  // Cover Design
  if (step.stage === "Cover Design") {
    const isApproved = book.approvals.includes("cover_design") || book.approvals.includes("digital_proof");
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={() => book.cover_pdf_link && setPdfUrl(toDrivePreviewUrl(book.cover_pdf_link))}
          disabled={!book.cover_pdf_link}
          className="flex items-center justify-center gap-1.5 w-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm text-[11px] font-bold py-2 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed"
        >
          <FileText size={13} /> {book.cover_pdf_link ? "View Cover" : "No Cover Uploaded"}
        </button>
        {!isApproved && (
          <div className="flex gap-2">
            <button onClick={() => handleApprove("cover_design")} disabled={isApproving || !book.cover_pdf_link} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold py-2 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <Printer size={13} /> {isApproving ? "..." : "Approve"}
            </button>
            <button onClick={() => setShowCorrectionModal(true)} disabled={!book.cover_pdf_link} className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 text-[11px] font-bold py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <RotateCcw size={13} /> Correction
            </button>
          </div>
        )}
        {pdfUrl && <PdfModal url={pdfUrl} title="Cover Design" onClose={() => setPdfUrl(null)} />}
        {showCorrectionModal && <CorrectionRequestModal bookId={book.book_id} defaultSection="cover" onClose={() => setShowCorrectionModal(false)} />}
      </div>
    );
  }

  // Digital Proof
  if (step.stage === "Digital Proof" && book.proof_pdf_link) {
    const isApproved = book.approvals.includes("digital_proof");
    return (
      <div className="flex flex-col gap-2">
        <button onClick={() => setPdfUrl(toDrivePreviewUrl(book.proof_pdf_link!))} className="flex items-center justify-center gap-1.5 w-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm text-[11px] font-bold py-2 rounded-xl transition-all">
          <FileText size={13} /> View Proof
        </button>
        {!isApproved && (
          <div className="flex gap-2">
            <button onClick={() => handleApprove("digital_proof")} disabled={isApproving} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold py-2 rounded-xl shadow-sm transition-all disabled:opacity-50">
              <Printer size={13} /> {isApproving ? "..." : "Approve"}
            </button>
            <button onClick={() => setShowCorrectionModal(true)} className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 text-[11px] font-bold py-2 rounded-xl transition-all">
              <RotateCcw size={13} /> Correction
            </button>
          </div>
        )}
        {pdfUrl && <PdfModal url={pdfUrl} title="Digital Proof" onClose={() => setPdfUrl(null)} />}
        {showCorrectionModal && <CorrectionRequestModal bookId={book.book_id} defaultSection="writing" onClose={() => setShowCorrectionModal(false)} />}
      </div>
    );
  }

  // Listed on Platforms
  if (step.stage === "Listed on Platforms" && step.status === "Completed") {
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {book.amazon_link && (
          <a href={book.amazon_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 bg-white hover:bg-yellow-50 text-yellow-700 border border-yellow-300 text-[10px] font-bold py-1.5 rounded-lg transition-all">
            <ExternalLink size={10} /> Amazon
          </a>
        )}
        {book.flipkart_link && (
          <a href={book.flipkart_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 text-[10px] font-bold py-1.5 rounded-lg transition-all">
            <ExternalLink size={10} /> Flipkart
          </a>
        )}
        {book.agph_link && (
          <a href={book.agph_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 text-[10px] font-bold py-1.5 rounded-lg transition-all">
            <ExternalLink size={10} /> AGPH
          </a>
        )}
        {book.google_link && (
          <a href={book.google_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-300 text-[10px] font-bold py-1.5 rounded-lg transition-all">
            <ExternalLink size={10} /> Google Play
          </a>
        )}
      </div>
    );
  }

  return null;
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP CORRECTIONS — unchanged from your original
   ───────────────────────────────────────────────────────────────────────── */

function StepCorrections({ stage, corrections }: { stage: string, corrections: Correction[] }) {
  const filtered = corrections.filter((c) =>
    stage === "Writing"
      ? c.section === "writing" || c.section === "proofreading"
      : c.section === "cover" || c.section === "formatting"
  );

  if (filtered.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-black/5">
      <p className="text-[9px] font-bold uppercase tracking-wider opacity-50 mb-2 flex items-center gap-1">
        <RotateCcw size={9} /> History ({filtered.length})
      </p>
      <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
        {filtered.map((c) => (
          <div key={c.correction_id} className={`rounded-lg p-2 border ${c.is_active ? "bg-amber-100/50 border-amber-200" : "bg-white/40 border-slate-200"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.is_active ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"}`}>R{c.round_number}</span>
              <span className={`text-[9px] font-bold ${c.is_active ? "text-amber-700" : "text-emerald-700"}`}>{c.is_active ? "In Progress" : "Done"}</span>
            </div>
            {c.notes && <p className="text-[10px] leading-snug opacity-70 line-clamp-2" title={c.notes}>{c.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CORRECTION REQUEST MODAL & PDF MODAL — unchanged from your original
   ───────────────────────────────────────────────────────────────────────── */

const SECTION_OPTIONS = [
  { value: "writing", label: "Writing", description: "Factual errors, missing content, or language issues" },
  { value: "cover", label: "Cover Design", description: "Changes to front/back cover artwork or text" },
];

function CorrectionRequestModal({ bookId, defaultSection, onClose }: { bookId: number; defaultSection: string; onClose: () => void }) {
  const [section, setSection] = useState(defaultSection);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) { setErrorMsg("Please describe what needs to be corrected."); return; }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/correction-request?bookId=${bookId}&section=${section}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setErrorMsg(data.message || "Submission failed.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <MessageSquare size={14} className="text-amber-700" />
            </div>
            <span className="text-[15px] font-extrabold text-slate-900">Request Correction</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
            <X size={15} />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <p className="text-[17px] font-bold text-slate-900 mt-2">Request Submitted!</p>
            <p className="text-[13px] text-slate-500">Our team has been notified and will start working on your corrections shortly.</p>
            <button onClick={onClose} className="mt-4 text-[13px] font-bold bg-slate-900 text-white px-8 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-ink/20">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
            <div>
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-3">What needs correction?</p>
              <div className="grid grid-cols-2 gap-2">
                {SECTION_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setSection(opt.value)} className={`flex flex-col items-start text-left px-3 py-3 rounded-xl border-2 transition-all ${section === opt.value ? "border-amber-400 bg-amber-50 shadow-sm" : "border-slate-200 bg-slate-100 hover:border-slate-200 hover:bg-slate-100"}`}>
                    <span className={`text-[12px] font-bold ${section === opt.value ? "text-amber-800" : "text-slate-500"}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide block mb-3">Describe the correction</label>
              <textarea value={notes} onChange={(e) => { setNotes(e.target.value); setErrorMsg(""); }} rows={4} placeholder="e.g. On page 12, the author's name is misspelled..." className="w-full text-[13px] font-medium text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all resize-none placeholder:text-slate-500" />
              {errorMsg && <p className="text-[12px] font-medium text-red-600 mt-2 flex items-center gap-1.5"><AlertTriangle size={12} /> {errorMsg}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 text-[13px] font-bold text-slate-500 bg-slate-100 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors">Cancel</button>
              <button type="submit" disabled={status === "loading"} className="flex-1 flex items-center justify-center gap-2 text-[13px] font-bold bg-amber-500 text-white px-4 py-3 rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60">
                {status === "loading" ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</> : <><SendHorizonal size={15} /> Submit</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PdfModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <FileText size={14} className="text-white" />
          </div>
          <span className="text-[14px] font-bold text-white tracking-wide">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] font-bold text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full">
            <ExternalLink size={12} /> Open in Drive
          </a>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white/60 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-4 md:p-8">
        <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl">
          <iframe src={url} className="w-full h-full border-0" allow="autoplay" title={title} />
        </div>
      </div>
    </div>
  );
}
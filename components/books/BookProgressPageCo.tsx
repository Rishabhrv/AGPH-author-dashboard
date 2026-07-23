"use client";

import { useMemo, useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  PenTool,
  Image as ImageIcon,
  Barcode,
  Globe,
  FileText,
  Clock,
  AlertTriangle,
  Search,
  Eye,
  Printer,
  Truck,
  ShieldCheck,
  RotateCcw,
  Upload,
  Bell,
  ChevronDown,
  ChevronUp,
  Circle,
  X,
  Sparkles,
  ExternalLink,
  SendHorizonal,
  MessageSquare,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   PRODUCTION PIPELINE STAGES
   ───────────────────────────────────────────────────────────────────────── */

type IntakePath = "author_content" | "agph_written";

const ALL_STAGES = [
  "Content Received",
  "ISBN Assigned",
  "Writing",
  "Cover Design",
  "Digital Proof",
  "Print Confirmation",
  "Printing",
  "Dispatched",
  "Listed on Platforms",
] as const;

type Stage = (typeof ALL_STAGES)[number];

function stagesForPath(path: IntakePath): Stage[] {
  return path === "author_content"
    ? ALL_STAGES.filter((s) => s !== "Writing")
    : [...ALL_STAGES];
}

const STAGE_ICONS: Record<Stage, React.ElementType> = {
  "Content Received": Upload,
  "ISBN Assigned": Barcode,
  Writing: PenTool,
  "Cover Design": ImageIcon,
  "Digital Proof": Eye,
  "Print Confirmation": ShieldCheck,
  Printing: Printer,
  Dispatched: Truck,
  "Listed on Platforms": Globe,
};

const STAGE_BLURB: Record<Stage, string> = {
  "Content Received": "Your manuscript or syllabus files have been received and queued.",
  "ISBN Assigned": "Your book has been assigned an ISBN for publishing.",
  Writing: "Our editorial team is drafting the book from your syllabus.",
  "Cover Design": "Designing the front and back cover art for your book.",
  "Digital Proof": "A combined PDF proof of cover + content is ready to review.",
  "Print Confirmation": "Final approval before sending to the printing press.",
  Printing: "Your book is currently on the press.",
  Dispatched: "Your copies have been boxed and shipped to you.",
  "Listed on Platforms": "Your book is live and earning royalties on all platforms.",
};

/* ─────────────────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────────────────── */

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

type EnrichedBook = {
  id: string;
  title: string;
  book_id: number;
  stage: Stage;
  currentStageIndex: number;
  needsAction: boolean;
  actionNote?: string;
  intakePath: IntakePath;
  stages: Stage[];
  coverImage?: string;
  // raw backend fields
  isbn?: string;
  syllabus_path?: string;
  writing_start?: string;
  writing_end?: string;
  cover_pdf_link?: string;
  proof_pdf_link?: string;
  corrections: Correction[];
  approvals: string[];
  delivery_date?: string;
  amazon_link?: string;
  agph_link?: string;
  flipkart_link?: string;
  google_link?: string;
};

/* ─────────────────────────────────────────────────────────────────────────
   STAGE DERIVATION LOGIC
   ───────────────────────────────────────────────────────────────────────── */

function mapBackendBookToEnriched(book: any): EnrichedBook {
  const corrections: Correction[] = book.corrections || [];
  const approvals: string[] = book.approvals || [];
  const hasActiveCorrection = corrections.some((c) => c.is_active);
  const intakePath: IntakePath = book.writing_start ? "agph_written" : "author_content";
  const stages = stagesForPath(intakePath);

  // Waterfall: compute the furthest completed stage
  let currentStage: Stage = "Content Received";
  let needsAction = false;
  let actionNote = "Your files are logged and queued for production.";

  if (book.isbn) {
    currentStage = "ISBN Assigned";
    actionNote = "Your ISBN has been assigned.";
  }

  if (book.writing_start) {
    currentStage = "Writing";
    actionNote = "Our editorial team is drafting your book.";
  }

  if (book.writing_end) {
    currentStage = "Cover Design";
    actionNote = "Cover design is underway.";
    if (book.cover_pdf_link) {
      if (approvals.includes("cover_design")) {
        actionNote = "Cover approved. Waiting for digital proof.";
      } else {
        needsAction = true;
        actionNote = "Cover proof is ready — please review and approve.";
      }
    }
  }

  if (book.proof_pdf_link) {
    currentStage = "Digital Proof";
    if (approvals.includes("digital_proof")) {
      currentStage = "Printing";
      actionNote = "Digital proof approved. Your book is queued for the printing press.";
    } else {
      needsAction = true;
      actionNote = "Your digital proof is ready — please review before printing.";
    }
  }

  if (book.delivery_date) {
    currentStage = "Listed on Platforms";
    actionNote = `Your book copies were dispatched on ${new Date(book.delivery_date).toLocaleDateString()}.`;
  }

  const hasStoreLinks = book.amazon_link || book.agph_link || book.flipkart_link || book.google_link;
  if (hasStoreLinks) {
    currentStage = "Listed on Platforms";
    actionNote = "Your book is now live and available for purchase!";
  }

  // Active correction overrides the current stage display (adds attention)
  if (hasActiveCorrection) {
    needsAction = true;
    const activeCorrection = corrections.find((c) => c.is_active)!;
    actionNote = `Round ${activeCorrection.round_number} correction (${CORRECTION_SECTION_LABELS[activeCorrection.section] ?? activeCorrection.section}) is in progress.`;
  }

  const currentStageIndex = stages.indexOf(currentStage);

  return {
    ...book,
    id: String(book.book_id),
    title: book.title || "Untitled Book",
    stage: currentStage,
    currentStageIndex,
    needsAction,
    actionNote,
    intakePath,
    stages,
    corrections,
    approvals,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────────────────── */

export default function BookProgressPageCo({ initialData = [] }: { initialData?: any[] }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const enrichedBooks = useMemo(
    () => initialData.map((book) => mapBackendBookToEnriched(book)),
    [initialData]
  );

  const filteredBooks = useMemo(() => {
    if (!query.trim()) return enrichedBooks;
    const q = query.trim().toLowerCase();
    return enrichedBooks.filter((b) => b.title.toLowerCase().includes(q));
  }, [enrichedBooks, query]);

  const actionBooks = enrichedBooks.filter((b) => b.needsAction);
  const publishedBooks = enrichedBooks.filter((b) => b.stage === "Listed on Platforms");
  const inProgressBooks = enrichedBooks.filter((b) => b.stage !== "Listed on Platforms");

  return (
    <div className="flex flex-col gap-6 mx-auto w-full pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-ink tracking-tight">
            Book Progress
          </h1>
          <p className="text-[13px] text-muted mt-1">
            Track every stage of production — from manuscript to marketplace.
          </p>
        </div>
        {actionBooks.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-500 text-white text-[12px] font-bold px-4 py-2.5 rounded-full shrink-0 shadow-sm">
            <Bell size={13} />
            {actionBooks.length} book{actionBooks.length > 1 ? "s" : ""} need your attention
          </div>
        )}
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-panel border border-ink/5 rounded-xl p-4 flex flex-col gap-1 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-ink/8 flex items-center justify-center">
              <BookOpen size={14} className="text-ink/60" />
            </div>
            <span className="text-[11px] font-semibold text-ink/60">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-ink">{enrichedBooks.length}</p>
          <p className="text-[10px] text-ink/40">All stages</p>
        </div>
        <div className="bg-panel border border-ink/5 rounded-xl p-4 flex flex-col gap-1 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Globe size={14} className="text-emerald-600" />
            </div>
            <span className="text-[11px] font-semibold text-ink/60">Published</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{publishedBooks.length}</p>
          <p className="text-[10px] text-ink/40">Live on platforms</p>
        </div>
        <div className="bg-panel border border-ink/5 rounded-xl p-4 flex flex-col gap-1 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${actionBooks.length > 0 ? "bg-amber-500/10" : "bg-ink/8"}`}>
              <AlertTriangle size={14} className={actionBooks.length > 0 ? "text-amber-600" : "text-ink/40"} />
            </div>
            <span className="text-[11px] font-semibold text-ink/60">Action Needed</span>
          </div>
          <p className={`text-2xl font-extrabold ${actionBooks.length > 0 ? "text-amber-600" : "text-ink"}`}>{actionBooks.length}</p>
          <p className="text-[10px] text-ink/40">Awaiting review</p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books…"
          className="w-full text-[12px] font-medium text-ink bg-panel border border-ink/8 rounded-lg pl-8 pr-8 py-2 outline-none placeholder:text-ink/40 focus:border-ink/20 transition-colors"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink">
            <X size={12} />
          </button>
        )}
      </div>

      {/* ── Book Cards ── */}
      {filteredBooks.length === 0 ? (
        <div className="bg-panel border border-ink/5 rounded-xl p-12 text-center shadow-card">
          <BookOpen size={36} className="mx-auto text-ink/20 mb-3" />
          <p className="text-[13px] font-semibold text-ink/50">No books found</p>
          <p className="text-[11px] text-ink/30 mt-1">{query ? `Nothing matches "${query}"` : "No books available."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
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
   BOOK CARD — the main redesigned component
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
  const isPublished = book.stage === "Listed on Platforms";
  const progressPct = Math.round(((book.currentStageIndex + 1) / book.stages.length) * 100);

  return (
    <div className={`bg-panel border rounded-xl shadow-card overflow-hidden transition-all duration-200 ${book.needsAction ? "border-amber-300" : "border-ink/8"}`}>
      {/* ── Card Header ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-ink/2 transition-colors"
      >
        {/* Cover thumb */}
        <div className="w-10 h-14 rounded-md overflow-hidden shrink-0 border border-ink/10 bg-gradient-to-br from-ink/5 to-ink/10 flex items-center justify-center">
          <BookOpen size={16} className="text-ink/30" />
        </div>

        {/* Title + current status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-ink truncate">{book.title}</p>
            {book.needsAction && (
              <span className="flex items-center gap-1 text-[9px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shrink-0">
                <AlertTriangle size={8} /> Action Needed
              </span>
            )}
            {isPublished && (
              <span className="flex items-center gap-1 text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full shrink-0">
                <Globe size={8} /> Live
              </span>
            )}
          </div>

          {/* Mini progress bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-ink/8 rounded-full overflow-hidden max-w-[200px]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isPublished ? "bg-emerald-500" : book.needsAction ? "bg-amber-500" : "bg-ink"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-ink/50 shrink-0">
              {book.stage}
            </span>
          </div>
        </div>

        {/* Expand icon */}
        <div className="text-ink/30 shrink-0">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* ── Action Banner (if needsAction) ── */}
      {book.needsAction && (
        <div className="mx-5 mb-3 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-amber-800">Action required</p>
            <p className="text-[11px] text-amber-700/80 mt-0.5">{book.actionNote}</p>
          </div>
        </div>
      )}

      {/* ── Expanded: Full Pipeline Timeline ── */}
      {isExpanded && (
        <div className="border-t border-ink/6 px-5 py-5">

          {/* Book metadata pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {book.isbn && (
              <MetaPill icon={Barcode} label="ISBN" value={book.isbn} />
            )}
            {book.syllabus_path && (
              <MetaPill icon={FileText} label="Syllabus" value="Uploaded" />
            )}
            {!book.isbn && !book.writing_start && !book.syllabus_path && (
              <p className="text-[11px] text-ink/40 italic">No additional details yet.</p>
            )}
          </div>

          {/* Pipeline Timeline */}
          <div className="flex flex-col gap-0">
            {book.stages.map((stage, idx) => {
              const isDone = idx < book.currentStageIndex;
              const isCurrent = idx === book.currentStageIndex;
              const isPending = idx > book.currentStageIndex;
              const isLast = idx === book.stages.length - 1;
              const Icon = STAGE_ICONS[stage] || Circle;

              return (
                <StageRow
                  key={stage}
                  stage={stage}
                  Icon={Icon}
                  isDone={isDone}
                  isCurrent={isCurrent}
                  isPending={isPending}
                  isLast={isLast}
                  book={book}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STAGE ROW — one step in the timeline
   ───────────────────────────────────────────────────────────────────────── */

function StageRow({
  stage,
  Icon,
  isDone,
  isCurrent,
  isPending,
  isLast,
  book,
}: {
  stage: Stage;
  Icon: React.ElementType;
  isDone: boolean;
  isCurrent: boolean;
  isPending: boolean;
  isLast: boolean;
  book: EnrichedBook;
}) {
  const hasAction = isCurrent && book.needsAction;

  return (
    <div className="flex gap-3">
      {/* Left column: icon + connector line */}
      <div className="flex flex-col items-center">
        {/* Icon circle */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors
            ${isDone ? "bg-ink text-white" : ""}
            ${isCurrent && !hasAction ? "bg-ink text-white ring-4 ring-ink/10" : ""}
            ${isCurrent && hasAction ? "bg-amber-500 text-white ring-4 ring-amber-400/20" : ""}
            ${isPending ? "bg-ink/8 text-ink/30" : ""}
          `}
        >
          {isDone ? (
            <CheckCircle2 size={15} strokeWidth={2.5} />
          ) : (
            <Icon size={14} strokeWidth={2} />
          )}
        </div>
        {/* Connector line */}
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[24px] mt-1 mb-1 ${isDone ? "bg-ink/30" : "bg-ink/8"}`} />
        )}
      </div>

      {/* Right column: stage name, blurb, details */}
      <div className={`flex-1 pb-4 ${isLast ? "pb-0" : ""}`}>
        {/* Stage header */}
        <div className="flex items-center gap-2 mb-0.5 pt-1">
          <span
            className={`text-[13px] font-bold transition-colors
              ${isDone ? "text-ink" : ""}
              ${isCurrent && !hasAction ? "text-ink" : ""}
              ${isCurrent && hasAction ? "text-amber-700" : ""}
              ${isPending ? "text-ink/30" : ""}
            `}
          >
            {stage}
          </span>
          {isDone && (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
              Done
            </span>
          )}
          {isCurrent && !hasAction && (
            <span className="text-[9px] font-bold text-ink bg-ink/8 px-1.5 py-0.5 rounded-full">
              In Progress
            </span>
          )}
          {isCurrent && hasAction && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
              <Sparkles size={8} /> Needs Review
            </span>
          )}
        </div>

        {/* Blurb */}
        {!isPending && (
          <p className="text-[11px] text-ink/50 mb-2">{STAGE_BLURB[stage]}</p>
        )}
        {isPending && (
          <p className="text-[11px] text-ink/25">{STAGE_BLURB[stage]}</p>
        )}

        {/* Stage-specific detail cards */}
        {isCurrent && <StageDetailCard stage={stage} book={book} />}
        {isDone && <StageDoneDetail stage={stage} book={book} />}

        {/* Corrections history — shown under Writing and Cover Design stages */}
        {(stage === "Writing" || stage === "Cover Design") && !isPending && (
          <CorrectionsHistory
            corrections={book.corrections.filter((c) =>
              stage === "Writing"
                ? c.section === "writing" || c.section === "proofreading"
                : c.section === "cover" || c.section === "formatting"
            )}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STAGE-SPECIFIC CARDS (current stage actions)
   ───────────────────────────────────────────────────────────────────────── */

function toDrivePreviewUrl(url: string): string {
  // Extract the Google Drive file ID and route through our backend proxy.
  // This avoids the "You need access" page that appears when the file
  // is not publicly shared — the backend fetches it with its own OAuth credentials.
  const match = url.match(/\/file\/d\/([^/?]+)/);
  if (match) return `/api/proxy-drive?fileId=${match[1]}`;
  return url;
}

function StageDetailCard({ stage, book }: { stage: Stage; book: EnrichedBook }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

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

  if (stage === "Cover Design" && book.cover_pdf_link) {
    const isApproved = book.approvals.includes("cover_design");
    return (
      <>
        <div className="mt-1 mb-2 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPdfUrl(toDrivePreviewUrl(book.cover_pdf_link!))}
            className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Eye size={12} /> View Cover PDF
          </button>
          <button
            onClick={() => handleApprove("cover_design")}
            disabled={isApproved || isApproving}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${isApproved
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200 opacity-80 cursor-default"
                : "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
              }`}
          >
            <ShieldCheck size={12} />
            {isApproving ? "Approving..." : isApproved ? "Approved" : "Approve Cover"}
          </button>
          {!isApproved && (
            <button
              onClick={() => setShowCorrectionModal(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <RotateCcw size={12} /> Request Changes
            </button>
          )}
        </div>
        {pdfUrl && <PdfModal url={pdfUrl} title="Cover PDF" onClose={() => setPdfUrl(null)} />}
        {showCorrectionModal && (
          <CorrectionRequestModal
            bookId={book.book_id}
            defaultSection="cover"
            onClose={() => setShowCorrectionModal(false)}
          />
        )}
      </>
    );
  }

  if (stage === "Digital Proof" && book.proof_pdf_link) {
    const isApproved = book.approvals.includes("digital_proof");
    return (
      <>
        <div className="mt-1 mb-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setPdfUrl(toDrivePreviewUrl(book.proof_pdf_link!))}
              className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText size={12} /> View Digital Proof
            </button>
            <button
              onClick={() => handleApprove("digital_proof")}
              disabled={isApproved || isApproving}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${isApproved
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200 opacity-80 cursor-default"
                  : "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                }`}
            >
              <Printer size={12} />
              {isApproving ? "Approving..." : isApproved ? "Approved for Print" : "Approve for Print"}
            </button>
            {!isApproved && (
              <button
                onClick={() => setShowCorrectionModal(true)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <RotateCcw size={12} /> Request Corrections
              </button>
            )}
          </div>
        </div>
        {pdfUrl && <PdfModal url={pdfUrl} title="Digital Proof" onClose={() => setPdfUrl(null)} />}
        {showCorrectionModal && (
          <CorrectionRequestModal
            bookId={book.book_id}
            defaultSection="writing"
            onClose={() => setShowCorrectionModal(false)}
          />
        )}
      </>
    );
  }
  if (stage === "Listed on Platforms") {
    const hasLinks = book.amazon_link || book.agph_link || book.flipkart_link || book.google_link;
    if (hasLinks) {
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          {book.amazon_link && (
            <a
              href={book.amazon_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-[11px] font-bold hover:bg-yellow-100 transition-colors"
            >
              <ExternalLink size={12} /> Amazon
            </a>
          )}
          {book.flipkart_link && (
            <a
              href={book.flipkart_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition-colors"
            >
              <ExternalLink size={12} /> Flipkart
            </a>
          )}
          {book.agph_link && (
            <a
              href={book.agph_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold hover:bg-purple-100 transition-colors"
            >
              <ExternalLink size={12} /> AGPH Store
            </a>
          )}
          {book.google_link && (
            <a
              href={book.google_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-colors"
            >
              <ExternalLink size={12} /> Google Play
            </a>
          )}
        </div>
      );
    }
  }

  return null;
}

/* ─────────────────────────────────────────────────────────────────────────
   CORRECTION REQUEST MODAL
   ───────────────────────────────────────────────────────────────────────── */

const SECTION_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: "writing", label: "Writing", description: "Factual errors, missing content, or language issues" },
  { value: "proofreading", label: "Proofreading", description: "Spelling, grammar, punctuation" },
  { value: "formatting", label: "Formatting", description: "Layout, spacing, fonts, or alignment" },
  { value: "cover", label: "Cover Design", description: "Changes to front/back cover artwork or text" },
];

function CorrectionRequestModal({
  bookId,
  defaultSection,
  onClose,
}: {
  bookId: number;
  defaultSection: string;
  onClose: () => void;
}) {
  const [section, setSection] = useState(defaultSection);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Close on Escape
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/8">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-amber-600" />
            <span className="text-[14px] font-bold text-ink">Request Correction</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-ink/6 text-ink/40 hover:text-ink transition-colors">
            <X size={15} />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
            <p className="text-[15px] font-bold text-ink">Request Submitted!</p>
            <p className="text-[12px] text-ink/50">Our team has been notified and will start working on your corrections shortly.</p>
            <button onClick={onClose} className="mt-2 text-[12px] font-bold bg-ink text-white px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
            {/* Section picker */}
            <div>
              <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2">What needs correction?</p>
              <div className="grid grid-cols-2 gap-2">
                {SECTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSection(opt.value)}
                    className={`flex flex-col items-start text-left px-3 py-2.5 rounded-xl border-2 transition-all ${section === opt.value
                      ? "border-amber-400 bg-amber-50"
                      : "border-ink/8 bg-ink/3 hover:border-ink/20"
                      }`}
                  >
                    <span className={`text-[12px] font-bold ${section === opt.value ? "text-amber-800" : "text-ink/70"}`}>{opt.label}</span>
                    <span className="text-[10px] text-ink/40 mt-0.5 leading-tight">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider block mb-2">
                Describe the correction
              </label>
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setErrorMsg(""); }}
                rows={4}
                placeholder="e.g. On page 12, the author's name is misspelled. Please change 'Rahul' to 'Rohit'."
                className="w-full text-[12px] text-ink bg-ink/3 border border-ink/10 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 focus:bg-amber-50/30 transition-colors resize-none placeholder:text-ink/30"
              />
              {errorMsg && <p className="text-[11px] text-red-600 mt-1">{errorMsg}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-[12px] font-semibold text-ink/60 border border-ink/10 px-4 py-2.5 rounded-xl hover:bg-ink/4 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 flex items-center justify-center gap-2 text-[12px] font-bold bg-amber-500 text-white px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60"
              >
                {status === "loading" ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</>
                ) : (
                  <><SendHorizonal size={13} /> Submit Request</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PDF VIEWER MODAL
   ───────────────────────────────────────────────────────────────────────── */

function PdfModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal chrome */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1e] border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-white/60" />
          <span className="text-[13px] font-semibold text-white">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-white/60 hover:text-white px-2 py-1 rounded transition-colors"
          >
            <ExternalLink size={12} /> Open in Drive
          </a>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>
      {/* PDF iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={url}
          className="w-full h-full border-0"
          allow="autoplay"
          title={title}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STAGE DONE DETAILS (for completed stages, show data inline)
   ───────────────────────────────────────────────────────────────────────── */

function StageDoneDetail({ stage, book }: { stage: Stage; book: EnrichedBook }) {
  if (stage === "Content Received" && book.syllabus_path) {
    return (
      <div className="mt-1 mb-2">
        <a
          href={book.syllabus_path}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 hover:underline"
        >
          <FileText size={10} /> View uploaded syllabus / content
          <ExternalLink size={9} />
        </a>
      </div>
    );
  }

  if (stage === "ISBN Assigned" && book.isbn) {
    return (
      <div className="mt-1 mb-2 inline-flex items-center gap-1.5 bg-ink/5 border border-ink/8 rounded-lg px-2.5 py-1.5">
        <Barcode size={12} className="text-ink/50" />
        <span className="text-[11px] font-mono font-bold text-ink/70">{book.isbn}</span>
      </div>
    );
  }

  if (stage === "Writing") {
    return (
      <div className="mt-1 mb-2 flex gap-2 flex-wrap">
        {book.writing_start && !book.writing_end && (
          <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-amber-700">
            <Clock size={10} /> Pending
          </div>
        )}
        {book.writing_end && (
          <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            <CheckCircle2 size={10} /> Finished
          </div>
        )}
      </div>
    );
  }

  if (stage === "Cover Design" && book.cover_pdf_link) {
    return (
      <div className="mt-1 mb-2">
        <a
          href={toDrivePreviewUrl(book.cover_pdf_link)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 hover:underline"
        >
          <Eye size={10} /> View approved cover PDF
          <ExternalLink size={9} />
        </a>
      </div>
    );
  }

  if (stage === "Digital Proof" && book.proof_pdf_link) {
    return (
      <div className="mt-1 mb-2 flex flex-col gap-2">
        <a
          href={toDrivePreviewUrl(book.proof_pdf_link)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 hover:underline"
        >
          <FileText size={10} /> View approved digital proof
          <ExternalLink size={9} />
        </a>
      </div>
    );
  }

  if (stage === "Dispatched" && book.delivery_date) {
    return (
      <div className="mt-1 mb-2 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
        <CheckCircle2 size={12} className="text-emerald-600" />
        <span className="text-[11px] font-bold text-emerald-800">
          Dispatched on {new Date(book.delivery_date).toLocaleDateString()}
        </span>
      </div>
    );
  }

  return null;
}

/* ─────────────────────────────────────────────────────────────────────────
   CORRECTIONS HISTORY
   ───────────────────────────────────────────────────────────────────────── */

function CorrectionsHistory({ corrections }: { corrections: Correction[] }) {
  if (corrections.length === 0) return null;

  return (
    <div className="mt-2 mb-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-2 flex items-center gap-1.5">
        <RotateCcw size={9} />
        Correction Rounds ({corrections.length})
      </p>
      <div className="flex flex-col gap-1.5">
        {corrections.map((c) => (
          <div
            key={c.correction_id}
            className={`rounded-lg border px-3 py-2.5 ${c.is_active
              ? "bg-amber-50 border-amber-200"
              : "bg-ink/3 border-ink/8"
              }`}
          >
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Round badge */}
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.is_active
                    ? "bg-amber-500 text-white"
                    : "bg-ink/10 text-ink/60"
                    }`}
                >
                  R{c.round_number}
                </span>
                {/* Section label */}
                <span className={`text-[11px] font-semibold ${c.is_active ? "text-amber-800" : "text-ink/70"}`}>
                  {CORRECTION_SECTION_LABELS[c.section] ?? c.section}
                </span>
                {/* Status */}
                {c.is_active ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-200">
                    <Clock size={8} /> In Progress
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 size={8} /> Done
                  </span>
                )}
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 text-[10px] text-ink/40">
                {c.correction_start && (
                  <span>{fmtDate(c.correction_start)}</span>
                )}
                {c.correction_end && (
                  <>
                    <span>→</span>
                    <span>{fmtDate(c.correction_end)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            {c.notes && (
              <p className={`text-[11px] mt-1.5 whitespace-pre-line leading-relaxed ${c.is_active ? "text-amber-700/80" : "text-ink/50"}`}>
                {c.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   META PILL
   ───────────────────────────────────────────────────────────────────────── */

function MetaPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-ink/5 border border-ink/8 rounded-lg px-2.5 py-1.5">
      <Icon size={11} className="text-ink/50 shrink-0" />
      <span className="text-[10px] font-medium text-ink/50">{label}:</span>
      <span className="text-[11px] font-bold text-ink/80">{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────────────── */

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
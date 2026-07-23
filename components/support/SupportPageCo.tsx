"use client";

import { useState, useMemo } from "react";
import {
  HelpCircle,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Paperclip,
  Search,
  Plus,
  BookOpen,
  CreditCard,
  Truck,
  FileText,
  Settings,
  X,
  LifeBuoy,
  PhoneCall,
  Mail,
  ArrowRight,
} from "lucide-react";

// --- Ticket Categories ---
const CATEGORIES = [
  { value: "book-printing", label: "Book Printing", icon: BookOpen, color: "#FF6B6B" },
  { value: "royalty-payment", label: "Royalty & Payments", icon: CreditCard, color: "#4facfe" },
  { value: "delivery", label: "Delivery Options", icon: Truck, color: "#43e97b" },
  { value: "account", label: "Profile Setup", icon: Settings, color: "#a18cd1" },
  { value: "listing", label: "Book Listing", icon: FileText, color: "#FFE66D" },
  { value: "other", label: "Other Queries", icon: HelpCircle, color: "#fa709a" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "#43e97b" },
  { value: "medium", label: "Normal", color: "#FFE66D" },
  { value: "high", label: "Urgent", color: "#FF6B6B" },
];

type TicketStatus = "open" | "in-progress" | "resolved";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: TicketStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
  replies: { from: string; message: string; date: string }[];
}

// --- Dummy Tickets ---
const INITIAL_TICKETS: Ticket[] = [
  {
    id: "TKT-1024",
    subject: "Royalty payment not received for June",
    category: "royalty-payment",
    priority: "high",
    status: "in-progress",
    message: "I haven't received my royalty payment for June 2026. My books had significant sales but the payment dashboard shows ₹0 for that month.",
    createdAt: "2026-07-10",
    updatedAt: "2026-07-12",
    replies: [
      { from: "Support Team", message: "We're looking into this issue. The June payout cycle was delayed due to a banking update. You should receive the payment by July 15.", date: "2026-07-12" },
    ],
  },
  {
    id: "TKT-1018",
    subject: "Print quality issue on 'The Silent Echo'",
    category: "book-printing",
    priority: "medium",
    status: "open",
    message: "The last batch of printed copies had color misalignment on the cover. Some customers have complained about this. Please investigate.",
    createdAt: "2026-07-05",
    updatedAt: "2026-07-05",
    replies: [],
  },
  {
    id: "TKT-0997",
    subject: "Update my author bio and profile photo",
    category: "account",
    priority: "low",
    status: "resolved",
    message: "Could you update my author bio? I've attached the new text and a high-res photo.",
    createdAt: "2026-06-20",
    updatedAt: "2026-06-22",
    replies: [
      { from: "Support Team", message: "Your profile has been updated with the new bio and photo. Changes are now live on all platforms.", date: "2026-06-22" },
    ],
  },
];

const STATUS_CONFIG: Record<TicketStatus, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  open: { label: "Open", icon: AlertCircle, bg: "bg-amber-500/10", text: "text-amber-600" },
  "in-progress": { label: "In Progress", icon: Clock, bg: "bg-blue-500/10", text: "text-blue-600" },
  resolved: { label: "Resolved", icon: CheckCircle2, bg: "bg-emerald-500/10", text: "text-emerald-600" },
};

export default function SupportPageCo() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // New ticket form state
  const [formSubject, setFormSubject] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPriority, setFormPriority] = useState("medium");
  const [formMessage, setFormMessage] = useState("");

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (filterStatus !== "All" && t.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [tickets, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  }), [tickets]);

  const handleSubmit = () => {
    if (!formSubject.trim() || !formCategory || !formMessage.trim()) return;

    const newTicket: Ticket = {
      id: `TKT-${1025 + tickets.length}`,
      subject: formSubject,
      category: formCategory,
      priority: formPriority,
      status: "open",
      message: formMessage,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      replies: [],
    };

    setTickets([newTicket, ...tickets]);
    setFormSubject("");
    setFormCategory("");
    setFormPriority("medium");
    setFormMessage("");
    setIsFormOpen(false);
  };

  const getCategoryInfo = (val: string) => CATEGORIES.find((c) => c.value === val);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">

      {/* ── Page Header / Hero ── */}
      <div className="bg-gradient-to-r from-ink to-ink/90 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-pink/20 rounded-full blur-3xl translate-y-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full mb-4 border border-white/10">
              <LifeBuoy size={14} className="text-pink" />
              <span className="text-[11px] font-bold tracking-wide uppercase text-white/90">24/7 Author Support</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              How can we help you?
            </h1>
            <p className="text-[14px] text-white/70 max-w-lg leading-relaxed">
              Whether you have a question about royalties, need help with your book listing, or want to report a printing issue, our team is here for you.
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="group flex items-center gap-2 bg-white text-ink px-6 py-3.5 rounded-full text-[14px] font-extrabold shadow-lg hover:shadow-xl hover:scale-105 transition-all w-fit"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Raise a Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column: Tickets ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Filter & Search Bar */}
          <div className="bg-panel rounded-2xl p-3 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3 border border-ink/5">
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              {["All", "open", "in-progress", "resolved"].map((status) => {
                const isSelected = filterStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap ${isSelected
                      ? "bg-ink text-white shadow-md"
                      : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                      }`}
                  >
                    {status === "All" ? "All Tickets" : STATUS_CONFIG[status as TicketStatus].label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search subjects or IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-ink/5 focus:bg-white focus:border-ink/20 border border-transparent rounded-xl py-2 pl-9 pr-4 text-[13px] font-medium text-ink outline-none transition-all"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            </div>
          </div>

          {/* Tickets List */}
          <div className="flex flex-col gap-4">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => {
                const isExpanded = expandedTicket === ticket.id;
                const catInfo = getCategoryInfo(ticket.category);
                const CatIcon = catInfo?.icon || HelpCircle;
                const statusCfg = STATUS_CONFIG[ticket.status];
                const StatusIcon = statusCfg.icon;
                const priorityInfo = PRIORITY_OPTIONS.find((p) => p.value === ticket.priority);

                return (
                  <div
                    key={ticket.id}
                    className={`bg-panel rounded-2xl shadow-card border transition-all duration-300 ${isExpanded ? 'border-ink/20 ring-4 ring-ink/5' : 'border-ink/5 hover:shadow-md hover:border-ink/10'}`}
                  >
                    <button
                      onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                      className="w-full flex items-start sm:items-center gap-4 p-5 text-left"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                        style={{ backgroundColor: `${catInfo?.color || "#666"}15` }}
                      >
                        <CatIcon size={20} style={{ color: catInfo?.color || "#666" }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold text-ink/40 font-mono bg-ink/5 px-2 py-0.5 rounded-md">{ticket.id}</span>
                          {priorityInfo && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                              style={{ backgroundColor: `${priorityInfo.color}15`, color: priorityInfo.color === '#FFE66D' ? '#B39E00' : priorityInfo.color }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityInfo.color }} />
                              {priorityInfo.label}
                            </span>
                          )}
                        </div>
                        <h3 className="text-[15px] font-bold text-ink leading-tight pr-4">{ticket.subject}</h3>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] font-medium text-ink/50">
                          <span className="flex items-center gap-1"><Clock size={12} /> {ticket.createdAt}</span>
                          <span className="w-1 h-1 rounded-full bg-ink/20" />
                          <span>{catInfo?.label}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${statusCfg.bg}`}>
                          <StatusIcon size={14} className={statusCfg.text} />
                          <span className={`text-[11px] font-bold ${statusCfg.text}`}>{statusCfg.label}</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-ink text-white' : 'bg-ink/5 text-ink/40'}`}>
                          <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="p-5 pt-0 border-t border-ink/5 mt-2 bg-ink/[0.01]">

                          {/* Thread */}
                          <div className="flex flex-col gap-4 mt-5">
                            {/* Original Message */}
                            <div className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink to-yellow flex items-center justify-center text-white font-bold text-[12px] shrink-0 shadow-sm">
                                ME
                              </div>
                              <div className="flex-1 bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-ink/5">
                                <p className="text-[11px] font-bold text-ink/40 mb-1">You • {ticket.createdAt}</p>
                                <p className="text-[13px] text-ink/80 leading-relaxed">{ticket.message}</p>
                              </div>
                            </div>

                            {/* Replies */}
                            {ticket.replies.map((reply, i) => (
                              <div key={i} className="flex gap-4 flex-row-reverse">
                                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white shrink-0 shadow-sm">
                                  <LifeBuoy size={14} />
                                </div>
                                <div className="flex-1 bg-ink/5 rounded-2xl rounded-tr-none p-4 border border-ink/5">
                                  <p className="text-[11px] font-bold text-ink/40 mb-1 text-right">{reply.from} • {reply.date}</p>
                                  <p className="text-[13px] text-ink/80 leading-relaxed text-right">{reply.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Quick Reply Box */}
                          {ticket.status !== "resolved" && (
                            <div className="mt-6 flex gap-3">
                              <input
                                type="text"
                                placeholder="Type a reply..."
                                className="flex-1 bg-white border border-ink/10 rounded-xl px-4 text-[13px] outline-none focus:border-ink/30 transition-colors"
                              />
                              <button className="bg-ink text-white p-3 rounded-xl hover:bg-ink/90 transition-colors shadow-md">
                                <Send size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-panel rounded-3xl shadow-card border border-ink/5 border-dashed">
                <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LifeBuoy size={24} className="text-ink/30" />
                </div>
                <h3 className="text-[16px] font-extrabold text-ink mb-1">No tickets found</h3>
                <p className="text-[13px] text-ink/50 max-w-xs mx-auto">
                  {searchQuery ? "We couldn't find any tickets matching your search." : "You're all caught up! No active support tickets."}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="mt-6 text-[13px] font-bold text-ink hover:text-ink/70 flex items-center gap-1 mx-auto"
                  >
                    Raise a new ticket <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Stats & Quick Links ── */}
        <div className="flex flex-col gap-6">

          {/* Stats Summary */}
          <div className="bg-panel rounded-3xl p-6 shadow-card border border-ink/5">
            <h3 className="text-[14px] font-extrabold text-ink mb-5">Your Activity</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <AlertCircle size={14} strokeWidth={3} />
                  </div>
                  <span className="text-[13px] font-bold text-ink/70">Open</span>
                </div>
                <span className="text-[15px] font-extrabold text-ink">{stats.open}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Clock size={14} strokeWidth={3} />
                  </div>
                  <span className="text-[13px] font-bold text-ink/70">In Progress</span>
                </div>
                <span className="text-[15px] font-extrabold text-ink">{stats.inProgress}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </div>
                  <span className="text-[13px] font-bold text-ink/70">Resolved</span>
                </div>
                <span className="text-[15px] font-extrabold text-ink">{stats.resolved}</span>
              </div>

              <div className="pt-4 mt-1 border-t border-ink/5 flex items-center justify-between">
                <span className="text-[13px] font-extrabold text-ink">Total Tickets</span>
                <span className="text-[18px] font-black text-ink">{stats.total}</span>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="bg-gradient-to-br from-yellow to-yellow/50 rounded-3xl p-6 shadow-card text-ink">
            <h3 className="text-[14px] font-extrabold mb-4">Other ways to reach us</h3>

            <a href="mailto:support@agphbooks.com" className="group flex items-center gap-4 bg-white/60 hover:bg-white p-3 rounded-2xl transition-colors mb-3">
              <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">Email Support</p>
                <p className="text-[13px] font-extrabold">support@agphbooks.com</p>
              </div>
            </a>

            <div className="group flex items-center gap-4 bg-white/60 hover:bg-white p-3 rounded-2xl transition-colors">
              <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center shrink-0">
                <PhoneCall size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">Call Center</p>
                <p className="text-[13px] font-extrabold">+91 1800-AGPH-HELP</p>
              </div>
            </div>
          </div>

          {/* Quick FAQs */}
          <div className="bg-panel rounded-3xl p-6 shadow-card border border-ink/5">
            <h3 className="text-[14px] font-extrabold text-ink mb-4">Quick Answers</h3>
            <div className="flex flex-col gap-3">
              {[
                "When are royalties paid?",
                "How to request author copies?",
                "Can I update my book cover?",
                "Where is my tax document?"
              ].map((faq, i) => (
                <button key={i} className="flex items-center justify-between text-left p-3 rounded-xl hover:bg-ink/5 transition-colors group">
                  <span className="text-[12px] font-bold text-ink/70 group-hover:text-ink">{faq}</span>
                  <ChevronRight size={14} className="text-ink/30 group-hover:text-ink transition-colors" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── New Ticket Modal ── */}
      {isFormOpen && (
        <>
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsFormOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-panel rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-ink/5 bg-ink/[0.02]">
                <div>
                  <h2 className="text-[20px] font-extrabold text-ink mb-1">Create Support Ticket</h2>
                  <p className="text-[13px] font-medium text-ink/50">Please provide as much detail as possible to help us resolve your issue quickly.</p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="w-10 h-10 rounded-full bg-white shadow-sm border border-ink/5 flex items-center justify-center text-ink/50 hover:text-ink hover:scale-105 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">

                {/* Category Selection */}
                <div>
                  <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-3 block">What is this regarding?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CATEGORIES.map((cat) => {
                      const CatIcon = cat.icon;
                      const isSelected = formCategory === cat.value;
                      return (
                        <button
                          key={cat.value}
                          onClick={() => setFormCategory(cat.value)}
                          className={`flex flex-col items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left ${isSelected ? "border-ink bg-ink/5 shadow-inner" : "border-ink/5 hover:border-ink/20 hover:bg-ink/[0.01]"
                            }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat.color}20` }}
                          >
                            <CatIcon size={14} style={{ color: cat.color }} />
                          </div>
                          <span className={`text-[12px] font-bold leading-tight ${isSelected ? "text-ink" : "text-ink/60"}`}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-6">
                  {/* Subject */}
                  <div>
                    <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-2 block">Subject Line</label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="e.g. Issue with June royalty payout..."
                      className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-[13px] font-medium text-ink outline-none placeholder:text-ink/30 focus:border-ink/30 focus:ring-4 focus:ring-ink/5 transition-all shadow-sm"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-2 block">Priority Level</label>
                    <div className="flex bg-ink/5 p-1 rounded-xl">
                      {PRIORITY_OPTIONS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setFormPriority(p.value)}
                          className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${formPriority === p.value
                            ? "bg-white text-ink shadow-sm"
                            : "text-ink/50 hover:text-ink/80"
                            }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-2 block">Detailed Description</label>
                  <textarea
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Please include any relevant details, dates, or ISBNs..."
                    rows={5}
                    className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-[13px] font-medium text-ink outline-none placeholder:text-ink/30 focus:border-ink/30 focus:ring-4 focus:ring-ink/5 transition-all resize-none shadow-sm"
                  />
                </div>

                {/* Attachment */}
                <div>
                  <button className="flex items-center gap-2 text-[12px] font-bold text-ink/50 hover:text-ink transition-colors bg-ink/5 px-4 py-2.5 rounded-xl w-fit border border-ink/5 border-dashed hover:border-ink/20">
                    <Paperclip size={14} />
                    Attach Screenshots or Files (Max 5MB)
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-8 py-5 border-t border-ink/5 bg-ink/[0.02]">
                <p className="text-[11px] font-medium text-ink/40">We aim to respond to all tickets within 24 business hours.</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-full text-[13px] font-bold text-ink/60 hover:bg-ink/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formSubject.trim() || !formCategory || !formMessage.trim()}
                    className="flex items-center gap-2 bg-ink text-white px-6 py-2.5 rounded-full text-[13px] font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:transform-none disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    Submit Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

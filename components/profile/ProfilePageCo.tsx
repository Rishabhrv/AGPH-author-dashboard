"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Lock,
  MapPin,
  Mail,
  Phone,
  BookOpen,
  ExternalLink,
  Edit3,
  Settings,
  X,
  MessageCircle,
  Calendar,
  Users as UsersIcon,
  Image as ImageIcon,
  Share2,
  Bookmark,
  CheckCircle2,
  Trophy,
  Video,
  Loader2,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  Flame,
  Zap,
  Palette
} from "lucide-react";
import { DUMMY_AUTHOR_PROFILE, type AuthorProfile } from "@/lib/profile-data";
import { getAuthorProfileData, updateAuthorProfileData, uploadAuthorProfilePhoto } from "@/actions/auth";

// Signature gradient reused across the hero + primary CTAs, tying the page
// back to the community dashboard's blue-violet identity.
const BRAND_GRADIENT = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #6366f1 100%)";

const COMMUNITY_RANK = 12;

/* ---------------------------------- Posts --------------------------------- */

const MY_POSTS = [
  {
    id: 1,
    author: "You",
    authorInitials: "ME",
    avatarBg: "#4f46e5",
    role: "Author",
    timeAgo: "2 hours ago",
    type: "discussion",
    title: "Tips for marketing your first fiction novel?",
    content: "Hi everyone! I just published my first fantasy novel and I'm struggling a bit with finding the right marketing channels. Has anyone had success with Instagram ads vs Facebook ads?",
    tags: ["Marketing", "Fiction"],
    reactions: [{ emoji: "👍", count: 24 }, { emoji: "❤️", count: 9 }],
    comments: 5,
    isPinned: false,
    answered: false
  },
  {
    id: 2,
    author: "You",
    authorInitials: "ME",
    avatarBg: "#4f46e5",
    role: "Author",
    timeAgo: "1 day ago",
    type: "poll",
    title: "Which cover style resonates most for my next psychological thriller?",
    content: "Working through cover concepts with my designer and would love a gut-check from the community before we finalize anything.",
    tags: ["CoverDesign", "Thriller"],
    reactions: [{ emoji: "👍", count: 15 }],
    comments: 4,
    isPinned: false,
    answered: false,
    pollOptions: [
      { label: "Minimalist, typography-only", pct: 28 },
      { label: "Illustrated moody scene", pct: 50 },
      { label: "Photo-manipulation portrait", pct: 16 },
      { label: "Abstract color-field", pct: 6 }
    ],
    totalVotes: 122,
    daysLeft: 2
  },
  {
    id: 3,
    author: "You",
    authorInitials: "ME",
    avatarBg: "#4f46e5",
    role: "Author",
    timeAgo: "3 days ago",
    type: "showcase",
    title: "Just unboxed my first print run! 📦📘",
    content: "After eight months of edits, my debut poetry collection is finally a real, physical book. Sharing a peek at the cover and the interior layout — so surreal holding it for the first time.",
    tags: ["Poetry", "SelfPublishing", "Milestone"],
    reactions: [{ emoji: "🔥", count: 41 }, { emoji: "❤️", count: 33 }, { emoji: "🪙", count: 20 }],
    comments: 8,
    isPinned: true,
    answered: false,
    images: [
      "linear-gradient(135deg, #34d399 0%, #14b8a6 100%)",
      "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)"
    ]
  },
  {
    id: 4,
    author: "You",
    authorInitials: "ME",
    avatarBg: "#4f46e5",
    role: "Author",
    timeAgo: "5 days ago",
    type: "question",
    title: "How do I set up price-matching against Amazon on KDP?",
    content: "Trying to keep my ebook price consistent across Amazon and my direct store without manually updating both every time. Anyone found a reliable workflow?",
    tags: ["KDP", "Pricing", "Workflow"],
    reactions: [{ emoji: "👍", count: 12 }],
    comments: 6,
    isPinned: false,
    answered: true
  }
];

const POST_TYPE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  discussion: { label: "DISCUSSION", bg: "#4facfe1a", text: "#2563eb" },
  question: { label: "QUESTION", bg: "#f59e0b1a", text: "#b45309" },
  poll: { label: "POLL", bg: "#10b9811a", text: "#047857" },
  showcase: { label: "SHOWCASE", bg: "#ec48991a", text: "#be185d" },
  announcement: { label: "ANNOUNCEMENT", bg: "#4f46e51a", text: "#4338ca" }
};

/* ---------------------------------- Events --------------------------------- */

const MY_EVENTS = [
  {
    id: 1,
    title: "Mastering Amazon Ads",
    date: "July 18, 2026",
    time: "2:00 PM EST",
    type: "Webinar",
    icon: Video,
    color: "#4facfe",
    going: true,
    attendees: 340
  },
  {
    id: 2,
    title: "Author Meet & Greet",
    date: "July 22, 2026",
    time: "6:00 PM EST",
    type: "Meetup",
    icon: UsersIcon,
    color: "#ec4899",
    going: true,
    attendees: 128
  },
  {
    id: 3,
    title: "Cover Design Trends",
    date: "Aug 05, 2026",
    time: "1:00 PM EST",
    type: "Workshop",
    icon: Palette,
    color: "#a855f7",
    going: false,
    attendees: 96
  },
  {
    id: 4,
    title: "Weekend Writing Sprint",
    date: "Every Saturday",
    time: "10:00 AM EST",
    type: "Recurring",
    icon: Zap,
    color: "#f59e0b",
    going: true,
    attendees: 54
  }
];

/* -------------------------------- Communities ------------------------------- */

const MY_COMMUNITIES = [
  {
    id: 1,
    name: "Fantasy Writers Group",
    members: 1204,
    description: "A place for fantasy writers to share tips and get feedback.",
    iconBg: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
    activityLabel: "Active daily"
  },
  {
    id: 2,
    name: "Indie Authors Hub",
    members: 3421,
    description: "Self-publishing strategy, KDP tips, and cover critiques from indie authors.",
    iconBg: "linear-gradient(135deg, #34d399 0%, #0ea5e9 100%)",
    activityLabel: "12 posts today"
  },
  {
    id: 3,
    name: "Poetry & Prose Circle",
    members: 642,
    description: "A quieter corner for poets and short-fiction writers to workshop drafts.",
    iconBg: "linear-gradient(135deg, #fb923c 0%, #ec4899 100%)",
    activityLabel: "Active weekly"
  }
];

/* ------------------------------- Achievements ------------------------------- */

const ACHIEVEMENTS = [
  { label: "Bestseller", description: "Reached #1 in a category chart", icon: Trophy, color: "#f59e0b", earned: true },
  { label: "Verified Author", description: "Identity confirmed by AGPH", icon: CheckCircle2, color: "#4f46e5", earned: true },
  { label: "5-Star Streak", description: "Maintained a 4.5+ average rating", icon: Star, color: "#10b981", earned: true },
  { label: "1K Club", description: "Sold 1,000+ copies across platforms", icon: Flame, color: "#ef4444", earned: false, progress: 84 },
  { label: "Top Reviewer", description: "Left 25+ helpful community reviews", icon: Award, color: "#ec4899", earned: false, progress: 40 },
  { label: "Community Leader", description: "Started 3 threads with 50+ replies", icon: UsersIcon, color: "#0ea5e9", earned: false, progress: 15 }
];

/* --------------------------------- Sales data -------------------------------- */

const PLATFORM_SALES = [
  { platform: "Amazon", color: "#FF9900", units: 842, trendPct: 12 },
  { platform: "Flipkart", color: "#2874F0", units: 356, trendPct: -4 },
  { platform: "AGPH Store", color: "#4f46e5", units: 210, trendPct: 8 }
];

const RATING_BREAKDOWN = [
  { stars: 5, pct: 68 },
  { stars: 4, pct: 21 },
  { stars: 3, pct: 7 },
  { stars: 2, pct: 3 },
  { stars: 1, pct: 1 }
];

export default function ProfilePageCo() {
  const [activeTab, setActiveTab] = useState<"posts" | "events" | "communities" | "achievements">("posts");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState<AuthorProfile | null>(null);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadAuthorProfilePhoto(formData);
      if (result.success && result.file_url) {
        setProfileData(prev => prev ? { ...prev, profileImageUrl: result.file_url } : null);
      } else {
        alert(result.message || "Failed to upload photo");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while uploading");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  useEffect(() => {
    getAuthorProfileData().then(data => {
      if (data) {
        setProfileData(data as AuthorProfile);
      } else {
        setProfileData(DUMMY_AUTHOR_PROFILE); // Fallback
      }
    });
  }, []);

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#4f46e5]" size={32} />
      </div>
    );
  }

  const profile = profileData;
  const bioWords = (profile?.bio || "").split(/\s+/);
  const isLongBio = bioWords.length > 50;
  const bioToShow = showFullBio || !isLongBio ? profile?.bio : bioWords.slice(0, 50).join(" ") + "...";

  const avgRating = profile.books && profile.books.length > 0
    ? (profile.books.reduce((sum, b: any) => sum + (Number(b.rating) || 0), 0) / profile.books.length).toFixed(1)
    : null;

  const topBook = profile.books && profile.books.length > 0
    ? [...profile.books].sort((a: any, b: any) => (Number(b.rating) || 0) - (Number(a.rating) || 0))[0]
    : null;

  const totalUnitsSold = PLATFORM_SALES.reduce((sum, p) => sum + p.units, 0);
  const earnedAchievementsCount = ACHIEVEMENTS.filter(a => a.earned).length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ============ MAIN COLUMN ============ */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-6">

          {/* Header / Hero */}
          <div
            className="bg-gradient-to-r from-ink to-ink/90 rounded-3xl shadow-card p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden text-white"

          >
            {/* Decorative glow accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-pink/20 rounded-full blur-3xl translate-y-1/2" />

            {/* Top-right action buttons */}
            <div className="hidden md:flex absolute top-6 right-6 items-center gap-2 z-20">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-colors px-3.5 py-2 rounded-full"
              >
                <Settings size={13} /> Settings
              </button>
              <button
                onClick={async () => {
                  if (isEditingHeader) {
                    setIsSavingHeader(true);
                    try {
                      await updateAuthorProfileData({
                        authorName: profile.authorName,
                        bio: profile.bio
                      });
                    } finally {
                      setIsSavingHeader(false);
                      setIsEditingHeader(false);
                    }
                  } else {
                    setIsEditingHeader(true);
                  }
                }}
                disabled={isSavingHeader}
                className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#4f46e5] bg-white hover:bg-white/90 transition-colors px-3.5 py-2 rounded-full disabled:opacity-60 shadow-sm"
              >
                {isSavingHeader ? <Loader2 size={13} className="animate-spin" /> : <Edit3 size={13} />}
                {isEditingHeader ? (isSavingHeader ? "Saving..." : "Save Profile") : "Edit Profile"}
              </button>
            </div>

            <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-full bg-white/10 ring-4 ring-white/30 p-1 shadow-md relative group z-10">
              <div
                className={`w-full h-full bg-white/10 backdrop-blur rounded-full flex items-center justify-center overflow-hidden relative ${isEditingHeader ? "cursor-pointer" : ""}`}
                onClick={() => isEditingHeader && fileInputRef.current?.click()}
              >
                {isUploadingPhoto ? (
                  <Loader2 size={32} className="animate-spin text-white/70" />
                ) : profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={profile.authorName} className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-white/50" />
                )}

                {isEditingHeader && !isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 size={20} className="text-white mb-1" />
                    <span className="text-white text-[10px] font-bold">Change</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
                accept="image/*"
              />
            </div>

            <div className="flex-1 text-center md:text-left z-10 w-full">
              <span className="hidden md:inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full mb-3">
                <User size={11} /> Author Profile
              </span>

              {isEditingHeader ? (
                <input
                  value={profile.authorName}
                  onChange={e => setProfileData({ ...profile, authorName: e.target.value })}
                  className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 bg-white/10 text-white placeholder-white/50 border border-white/25 outline-none w-full max-w-sm rounded-lg px-3 py-1.5"
                />
              ) : (
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 flex items-center justify-center md:justify-start gap-2">
                  {profile.authorName}
                  <CheckCircle2 size={20} className="text-white/80" />
                </h1>
              )}

              {isEditingHeader ? (
                <textarea
                  value={profile.bio}
                  onChange={e => setProfileData({ ...profile, bio: e.target.value })}
                  className="text-[13px] w-full max-w-2xl leading-relaxed mb-4 bg-white/10 text-white placeholder-white/50 border border-white/25 rounded-lg px-3 py-2 outline-none resize-none"
                  rows={3}
                />
              ) : (
                <div className="mb-4 max-w-2xl">
                  <p className="text-[13px] text-white/80 leading-relaxed">
                    {bioToShow}
                    {isLongBio && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="text-[12px] text-white font-bold hover:underline ml-1 inline-block"
                      >
                        {showFullBio ? "See less" : "See more"}
                      </button>
                    )}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="text-[11px] font-bold bg-white/15 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <BookOpen size={13} /> {profile.totalBooks} Published Books
                </span>
                <span className="text-[11px] font-bold bg-white/15 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Calendar size={13} /> Member since {profile.memberSince}
                </span>
                {avgRating && (
                  <span className="text-[11px] font-bold bg-white/15 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Trophy size={13} /> {avgRating} Avg. Rating
                  </span>
                )}
                <span className="text-[11px] font-bold bg-white/15 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Award size={13} /> Rank #{COMMUNITY_RANK} this month
                </span>
              </div>

              {/* Mobile action buttons */}
              <div className="flex md:hidden items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-white/15 border border-white/20 px-3.5 py-2 rounded-full"
                >
                  <Settings size={13} /> Settings
                </button>
                <button
                  onClick={async () => {
                    if (isEditingHeader) {
                      setIsSavingHeader(true);
                      try {
                        await updateAuthorProfileData({ authorName: profile.authorName, bio: profile.bio });
                      } finally {
                        setIsSavingHeader(false);
                        setIsEditingHeader(false);
                      }
                    } else {
                      setIsEditingHeader(true);
                    }
                  }}
                  disabled={isSavingHeader}
                  className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#4f46e5] bg-white px-3.5 py-2 rounded-full disabled:opacity-60"
                >
                  {isSavingHeader ? <Loader2 size={13} className="animate-spin" /> : <Edit3 size={13} />}
                  {isEditingHeader ? (isSavingHeader ? "Saving..." : "Save") : "Edit Profile"}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-full transition-colors ${activeTab === "posts" ? "text-white shadow-sm" : "text-ink/60 bg-ink/5 hover:bg-ink/10"
                }`}
              style={activeTab === "posts" ? { background: BRAND_GRADIENT } : undefined}
            >
              <MessageCircle size={16} /> My Posts
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-full transition-colors ${activeTab === "events" ? "text-white shadow-sm" : "text-ink/60 bg-ink/5 hover:bg-ink/10"
                }`}
              style={activeTab === "events" ? { background: BRAND_GRADIENT } : undefined}
            >
              <Calendar size={16} /> My Events
            </button>
            <button
              onClick={() => setActiveTab("communities")}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-full transition-colors ${activeTab === "communities" ? "text-white shadow-sm" : "text-ink/60 bg-ink/5 hover:bg-ink/10"
                }`}
              style={activeTab === "communities" ? { background: BRAND_GRADIENT } : undefined}
            >
              <UsersIcon size={16} /> Communities
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-full transition-colors ${activeTab === "achievements" ? "text-white shadow-sm" : "text-ink/60 bg-ink/5 hover:bg-ink/10"
                }`}
              style={activeTab === "achievements" ? { background: BRAND_GRADIENT } : undefined}
            >
              <Trophy size={16} /> Achievements
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === "achievements" ? "bg-white/20" : "bg-ink/10"}`}>
                {earnedAchievementsCount}/{ACHIEVEMENTS.length}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "posts" && (
              <div className="flex flex-col gap-4">
                {MY_POSTS.map(post => {
                  const badge = POST_TYPE_STYLES[post.type] ?? POST_TYPE_STYLES.discussion;
                  return (
                    <div key={post.id} className="bg-panel rounded-3xl p-6 shadow-card border border-ink/5 hover:shadow-md transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] shadow-sm" style={{ background: post.avatarBg }}>
                            {post.authorInitials}
                          </div>
                          <div>
                            <h4 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
                              {post.author}
                              {post.isPinned && (
                                <span className="text-[10px] font-extrabold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md">📌 PINNED</span>
                              )}
                            </h4>
                            <p className="text-[11px] font-medium text-ink/50">{post.role} • {post.timeAgo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {post.answered && (
                            <span className="hidden sm:flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                              <CheckCircle2 size={11} /> ANSWERED
                            </span>
                          )}
                          <span
                            className="text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide whitespace-nowrap"
                            style={{ backgroundColor: badge.bg, color: badge.text }}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-[17px] font-extrabold text-ink mb-2 leading-tight">{post.title}</h3>
                      <p className="text-[14px] text-ink/75 leading-relaxed mb-4">{post.content}</p>

                      {post.type === "poll" && post.pollOptions && (
                        <div className="flex flex-col gap-2 mb-4">
                          {post.pollOptions.map((opt, i) => (
                            <div key={i} className="relative rounded-xl border border-ink/10 overflow-hidden h-10">
                              <div className="absolute inset-y-0 left-0 bg-emerald-500/10" style={{ width: `${opt.pct}%` }} />
                              <div className="relative h-full flex items-center justify-between px-3.5">
                                <span className="text-[12.5px] font-bold text-ink">{opt.label}</span>
                                <span className="text-[12.5px] font-extrabold text-ink/70">{opt.pct}%</span>
                              </div>
                            </div>
                          ))}
                          <p className="text-[11px] font-medium text-ink/40 mt-0.5">{post.totalVotes} votes • {post.daysLeft} days left</p>
                        </div>
                      )}

                      {post.type === "showcase" && post.images && (
                        <div className="flex gap-3 mb-4">
                          {post.images.map((grad, i) => (
                            <div key={i} className="w-24 h-24 rounded-2xl shrink-0 shadow-sm" style={{ background: grad }} />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-5 flex-wrap">
                        {post.tags.map(tag => (
                          <span key={tag} className="bg-ink/5 text-ink/60 text-[11px] font-bold px-2.5 py-1 rounded-lg">#{tag}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-ink/5">
                        <div className="flex items-center gap-2">
                          {post.reactions.map(r => (
                            <span key={r.emoji} className="flex items-center gap-1 text-[12px] font-bold text-ink/60 bg-ink/5 rounded-full px-2.5 py-1">
                              {r.emoji} {r.count}
                            </span>
                          ))}
                          <span className="flex items-center gap-1.5 text-ink/60 text-[12px] font-bold bg-ink/5 rounded-full px-2.5 py-1 ml-1">
                            <MessageCircle size={14} /> {post.comments}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-ink/40">
                          <Bookmark size={16} className="hover:text-ink/70 transition-colors cursor-pointer" />
                          <span className="flex items-center gap-1 text-[12px] font-bold hover:text-ink/70 transition-colors cursor-pointer">
                            <Share2 size={15} /> Share
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "events" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MY_EVENTS.map(event => {
                  const EventIcon = event.icon;
                  return (
                    <div key={event.id} className="bg-panel rounded-3xl p-6 shadow-card border border-ink/5 flex gap-4 hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${event.color}18`, color: event.color }}>
                        <EventIcon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-[14px] font-bold text-ink leading-snug">{event.title}</h4>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${event.going ? "bg-emerald-500/10 text-emerald-600" : "bg-ink/5 text-ink/60"
                              }`}
                          >
                            {event.going ? "Going ✓" : "RSVP"}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-ink/50 mt-1">{event.date} • {event.time}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-ink/40">{event.type}</span>
                          <span className="text-ink/20">•</span>
                          <span className="text-[10px] font-bold text-ink/40">{event.attendees} attending</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "communities" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MY_COMMUNITIES.map(comm => (
                  <div key={comm.id} className="bg-panel rounded-3xl p-6 shadow-card border border-ink/5 flex flex-col gap-3 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ background: comm.iconBg }}>
                        <UsersIcon size={20} />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-ink">{comm.name}</h4>
                        <p className="text-[11px] font-medium text-ink/50">{comm.members.toLocaleString()} members • {comm.activityLabel}</p>
                      </div>
                    </div>
                    <p className="text-[13px] text-ink/70 leading-relaxed">{comm.description}</p>
                    <button
                      className="mt-2 text-white transition-opacity hover:opacity-90 py-2 rounded-xl text-[13px] font-bold w-full shadow-sm"
                      style={{ background: BRAND_GRADIENT }}
                    >
                      Visit Community
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((ach, idx) => {
                  const AchIcon = ach.icon;
                  return (
                    <div key={idx} className={`bg-panel rounded-3xl p-5 shadow-card border border-ink/5 flex gap-4 ${!ach.earned ? "opacity-80" : ""}`}>
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={ach.earned ? { backgroundColor: `${ach.color}18`, color: ach.color } : {}}
                      >
                        {ach.earned ? <AchIcon size={20} /> : <Lock size={18} className="text-ink/25" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-[14px] font-bold ${ach.earned ? "text-ink" : "text-ink/50"}`}>{ach.label}</h4>
                          {ach.earned && <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />}
                        </div>
                        <p className="text-[12px] text-ink/50 leading-snug mt-1">{ach.description}</p>
                        {!ach.earned && typeof ach.progress === "number" && (
                          <div className="mt-3">
                            <div className="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${ach.progress}%`, backgroundColor: ach.color }} />
                            </div>
                            <p className="text-[10px] font-bold text-ink/40 mt-1">{ach.progress}% complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ============ SIDEBAR ============ */}
        <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-5">

          {/* Author Snapshot */}
          <div className="bg-panel rounded-2xl shadow-card border border-ink/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5]">
                <Trophy size={16} />
              </div>
              <h3 className="text-[14px] font-extrabold text-ink">Author Snapshot</h3>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5] shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-ink/60">Published Books</span>
                  <span className="text-[14px] font-extrabold text-ink">{profile.totalBooks}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#ec4899]/10 text-[#ec4899] shrink-0">
                  <Award size={16} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-ink/60">Community Rank</span>
                  <span className="text-[14px] font-extrabold text-ink">#{COMMUNITY_RANK}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 shrink-0">
                  <Calendar size={16} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-ink/60">Member Since</span>
                  <span className="text-[14px] font-extrabold text-ink">{profile.memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Snapshot */}
          <div className="bg-panel rounded-2xl shadow-card border border-ink/5 p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FF9900]/10 text-[#FF9900]">
                  <TrendingUp size={16} />
                </div>
                <h3 className="text-[14px] font-extrabold text-ink">Sales Snapshot</h3>
              </div>
            </div>
            <p className="text-[26px] font-extrabold text-ink leading-tight mt-2">{totalUnitsSold.toLocaleString()}</p>
            <p className="text-[11px] font-semibold text-ink/40 mb-4">Total units sold, all platforms</p>

            <div className="flex flex-col gap-3">
              {PLATFORM_SALES.map(p => (
                <div key={p.platform} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[12.5px] font-bold text-ink flex-1">{p.platform}</span>
                  <span className="text-[12.5px] font-extrabold text-ink">{p.units.toLocaleString()}</span>
                  <span
                    className={`flex items-center gap-0.5 text-[10.5px] font-extrabold px-1.5 py-0.5 rounded-md ${p.trendPct >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      }`}
                  >
                    {p.trendPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {Math.abs(p.trendPct)}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-bold text-[#4f46e5] mt-4 cursor-pointer hover:underline">View full report on Sales & Royalty →</p>
          </div>

          {/* Published Books */}
          <div className="bg-panel rounded-2xl shadow-card border border-ink/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#ec4899]/10 text-[#ec4899]">
                <BookOpen size={16} />
              </div>
              <h3 className="text-[14px] font-extrabold text-ink">Published Books</h3>
            </div>
            {profile.books && profile.books.length > 0 ? (
              <div className="flex flex-col gap-1">
                {profile.books.map((book, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 -mx-1 px-1 rounded-xl hover:bg-ink/5 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl shrink-0 shadow-sm" style={{ background: book.coverGradient }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-ink truncate flex items-center gap-1.5">
                        {book.title}
                        {book === topBook && <span className="text-[9px] font-extrabold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md shrink-0">🏆 TOP</span>}
                      </p>
                      <p className="text-[11px] font-medium text-ink/50">★ {book.rating} · {book.reviews} reviews</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-2 py-6">
                <ImageIcon size={22} className="text-ink/20" />
                <p className="text-[12px] text-ink/50 font-medium">No published books yet.</p>
              </div>
            )}
          </div>

          {/* Ratings Breakdown */}
          {avgRating && (
            <div className="bg-panel rounded-2xl shadow-card border border-ink/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600">
                  <Star size={16} />
                </div>
                <h3 className="text-[14px] font-extrabold text-ink">Ratings Breakdown</h3>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-[28px] font-extrabold text-ink leading-none">{avgRating}</span>
                <span className="text-[11px] font-semibold text-ink/40 mb-1">average across all books</span>
              </div>
              <div className="flex flex-col gap-2">
                {RATING_BREAKDOWN.map(r => (
                  <div key={r.stars} className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-ink/50 w-8 shrink-0">{r.stars}★</span>
                    <div className="flex-1 h-2 rounded-full bg-ink/5 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-ink/40 w-8 text-right shrink-0">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Socials & Links */}
          <div className="bg-panel rounded-2xl shadow-card border border-ink/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sky-500/10 text-sky-600">
                <ExternalLink size={16} />
              </div>
              <h3 className="text-[14px] font-extrabold text-ink">Socials & Links</h3>
            </div>
            <div className="flex flex-col gap-2">
              {profile.socials.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group p-3 rounded-xl bg-ink/5 hover:bg-ink/10 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-ink">{social.platform}</span>
                    <span className="text-[11px] font-medium text-ink/50">{social.handle}</span>
                  </div>
                  <ExternalLink size={14} className="text-ink/30 group-hover:text-ink transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Overlay & Panel (Personal Details) */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-panel shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex items-center justify-between border-b border-ink/5 sticky top-0 bg-panel z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5]">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-ink leading-tight">Personal Details</h2>
              <p className="text-[11px] font-medium text-ink/40">Only visible to you</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 rounded-full bg-ink/5 hover:bg-ink/10 flex items-center justify-center text-ink/60 hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-extrabold text-ink/70 uppercase tracking-wide">Account Information</h3>
              <button
                onClick={async () => {
                  if (isEditingPersonal) {
                    setIsSavingPersonal(true);
                    try {
                      await updateAuthorProfileData({
                        legalName: profile.legalName,
                        email: profile.email,
                        phone: profile.phone,
                        address: profile.address
                      });
                    } finally {
                      setIsSavingPersonal(false);
                      setIsEditingPersonal(false);
                    }
                  } else {
                    setIsEditingPersonal(true);
                  }
                }}
                disabled={isSavingPersonal}
                className={`text-[11px] font-bold transition-colors disabled:opacity-50 flex items-center gap-1 px-3 py-1.5 rounded-full ${isEditingPersonal ? "text-white" : "text-ink/60 bg-ink/5 hover:bg-ink/10"
                  }`}
                style={isEditingPersonal ? { background: BRAND_GRADIENT } : undefined}
              >
                {isSavingPersonal && <Loader2 size={12} className="animate-spin" />}
                {isEditingPersonal ? (isSavingPersonal ? "Saving..." : "Save") : "Edit"}
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-1">
              <div>
                <p className="text-[10px] font-bold text-ink/50 uppercase tracking-wider mb-1.5">Legal Name</p>
                {isEditingPersonal ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5] shrink-0">
                      <User size={14} />
                    </div>
                    <input
                      value={profile.legalName}
                      onChange={e => setProfileData({ ...profile, legalName: e.target.value })}
                      className="text-[13px] font-semibold text-ink bg-ink/5 border border-ink/10 rounded-lg px-3 py-2 outline-none w-full"
                    />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-ink flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5] shrink-0"><User size={14} /></span>
                    {profile.legalName}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink/50 uppercase tracking-wider mb-1.5">Email Address</p>
                {isEditingPersonal ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-500/10 text-sky-600 shrink-0">
                      <Mail size={14} />
                    </div>
                    <input
                      value={profile.email}
                      onChange={e => setProfileData({ ...profile, email: e.target.value })}
                      className="text-[13px] font-semibold text-ink bg-ink/5 border border-ink/10 rounded-lg px-3 py-2 outline-none w-full"
                    />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-ink flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-500/10 text-sky-600 shrink-0"><Mail size={14} /></span>
                    {profile.email}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink/50 uppercase tracking-wider mb-1.5">Phone Number</p>
                {isEditingPersonal ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 shrink-0">
                      <Phone size={14} />
                    </div>
                    <input
                      value={profile.phone}
                      onChange={e => setProfileData({ ...profile, phone: e.target.value })}
                      className="text-[13px] font-semibold text-ink bg-ink/5 border border-ink/10 rounded-lg px-3 py-2 outline-none w-full"
                    />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-ink flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 shrink-0"><Phone size={14} /></span>
                    {profile.phone}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink/50 uppercase tracking-wider mb-1.5">Residential Address</p>
                {isEditingPersonal ? (
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f59e0b]/10 text-[#f59e0b] shrink-0 mt-0.5">
                      <MapPin size={14} />
                    </div>
                    <textarea
                      value={profile.address}
                      onChange={e => setProfileData({ ...profile, address: e.target.value })}
                      className="text-[13px] font-semibold text-ink bg-ink/5 border border-ink/10 rounded-lg px-3 py-2 outline-none w-full resize-none"
                      rows={2}
                    />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-ink flex items-start gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f59e0b]/10 text-[#f59e0b] shrink-0"><MapPin size={14} /></span>
                    <span className="leading-snug mt-1.5">{profile.address}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-ink/5 rounded-xl p-3.5 mt-2">
            <Lock size={14} className="text-ink/40 mt-0.5 shrink-0" />
            <p className="text-[11px] font-medium text-ink/50 leading-relaxed">
              Your personal details are private and are never shown on your public author profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
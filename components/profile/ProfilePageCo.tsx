"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import { calculateStats } from "./BadgeSystemCo";
// Signature gradient reused across the hero + primary CTAs, tying the page
// back to the community dashboard's blue-violet identity.
// back to the community dashboard's blue-violet identity.
const BRAND_GRADIENT = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #6366f1 100%)";

export default function ProfilePageCo({ initialProfileData, salesData, reviewsData, storeUrl = "http://localhost:5000" }: { initialProfileData: any, salesData: any, reviewsData: any, storeUrl?: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState<AuthorProfile | null>(initialProfileData);
  const [isPhotoUpdated, setIsPhotoUpdated] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const stats = useMemo(() => calculateStats(profileData, salesData, reviewsData), [profileData, salesData, reviewsData]);
  const TierIcon = stats.currentTier.icon;
  const [isEditing, setIsEditing] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  // Compute actual rating and reviews from live reviewsData
  const bookStats: Record<string, { totalRating: number; count: number; reviewCount: number }> = {};
  if (reviewsData && reviewsData.reviews) {
    reviewsData.reviews.forEach((r: any) => {
      const title = r.book;
      if (title) {
        if (!bookStats[title]) bookStats[title] = { totalRating: 0, count: 0, reviewCount: 0 };
        bookStats[title].reviewCount += 1;
        const rVal = Number(r.rating);
        if (!isNaN(rVal) && rVal > 0) {
          bookStats[title].totalRating += rVal;
          bookStats[title].count += 1;
        }
      }
    });
  }

  const booksWithLiveStats = (profile.books || []).map((b: any) => {
    const stats = bookStats[b.title];
    const liveRating = stats && stats.count > 0 ? (stats.totalRating / stats.count).toFixed(1) : "0.0";
    const liveReviews = stats ? stats.reviewCount : (b.reviews || 0);

    // Find cover image and sales from reviewsData or salesData
    const coverFromReviews = reviewsData?.books?.find((rb: any) => rb.title === b.title)?.coverImage;
    const salesBook = salesData?.books?.find((sb: any) => sb.title === b.title);

    return {
      ...b,
      coverImage: coverFromReviews || salesBook?.coverImage || null,
      rating: liveRating,
      reviews: liveReviews,
      sales: salesBook?.unitsSold || 0
    };
  });

  const sortedBooks = booksWithLiveStats.sort((a: any, b: any) => {
    const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (Number(b.reviews) || 0) - (Number(a.reviews) || 0);
  });

  const topBook = sortedBooks.length > 0 ? sortedBooks[0] : null;
  const top5Books = sortedBooks.slice(0, 5);

  // Compute platform sales
  const platformMap: Record<string, number> = {};
  if (salesData && salesData.transactions) {
    salesData.transactions.forEach((t: any) => {
      const platform = t.platform || "Other";
      platformMap[platform] = (platformMap[platform] || 0) + (t.units || 1);
    });
  }

  const PLATFORM_SALES = Object.keys(platformMap).map(platform => ({
    platform,
    color: platform.toLowerCase() === "amazon" ? "#FF9900" : platform.toLowerCase() === "flipkart" ? "#2874F0" : "#4f46e5",
    units: platformMap[platform],
    trendPct: 0
  }));
  const totalUnitsSold = PLATFORM_SALES.reduce((sum, p) => sum + p.units, 0);

  // Compute ratings breakdown
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalReviews = 0;
  if (reviewsData && reviewsData.reviews) {
    reviewsData.reviews.forEach((r: any) => {
      const rating = Math.round(Number(r.rating) || 5);
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating as keyof typeof ratingCounts]++;
        totalReviews++;
      }
    });
  }
  const RATING_BREAKDOWN = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    pct: totalReviews > 0 ? Math.round((ratingCounts[stars as keyof typeof ratingCounts] / totalReviews) * 100) : 0
  }));


  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ============ MAIN COLUMN ============ */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-6">

          {/* Header / Hero */}
          <div
            className="bg-slate-900 rounded-xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden text-white"

          >
            {/* Decorative glow accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-pink/20 rounded-full blur-3xl translate-y-1/2" />

            {/* Top-right action buttons */}
            <div className="hidden md:flex absolute top-6 right-6 items-center gap-2 z-20">
              <button
                onClick={() => { setIsSidebarOpen(true); setIsEditing(true); }}
                className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#4f46e5] bg-white hover:bg-white/90 transition-colors px-3.5 py-2 rounded-full shadow-sm"
              >
                <Edit3 size={13} /> Edit Profile
              </button>
            </div>

            <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 relative group z-10">
              {/* Outer Progress Ring */}
              <div
                className="absolute -inset-1.5 rounded-full"
                style={{
                  background: `conic-gradient(rgba(255,255,255,0.9) ${stats.progress}%, rgba(255,255,255,0.15) ${stats.progress}%)`
                }}
              />

              {/* Inner container to mask and show image */}
              <div className="absolute inset-0 bg-slate-900 rounded-full p-1">
                <div
                  className="w-full h-full bg-white/10 backdrop-blur rounded-full flex items-center justify-center overflow-hidden relative cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingPhoto ? (
                    <Loader2 size={32} className="animate-spin text-white/70" />
                  ) : profile.profileImageUrl ? (
                    <img src={profile.profileImageUrl.startsWith('http') ? profile.profileImageUrl : `${storeUrl}${profile.profileImageUrl}`} alt={profile.authorName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-white/50" />
                  )}

                  {!isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 size={20} className="text-white mb-1" />
                      <span className="text-white text-[10px] font-bold">Change</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Badge Icon overlay */}
              <div
                className={`absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${stats.currentTier.color} border-2 border-slate-300 shadow-lg flex items-center justify-center text-white z-20 hover:scale-110 transition-transform cursor-help`}
                title={`${stats.currentTier.name} • ${stats.totalPoints} XP`}
              >
                <TierIcon size={18} strokeWidth={2.5} />
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

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 flex items-center justify-center md:justify-start gap-2">
                {profile.authorName}
                <CheckCircle2 size={20} className="text-white/80" />
              </h1>

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

              {/* Mobile action buttons */}
              <div className="flex md:hidden items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => { setIsSidebarOpen(true); setIsEditing(true); }}
                  className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#4f46e5] bg-white px-3.5 py-2 rounded-full"
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8">
          </div>

        </div>

        {/* ============ SIDEBAR ============ */}
        <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-5">

          {/* Author Snapshot */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5]">
                <Trophy size={16} />
              </div>
              <h3 className="text-[14px] font-extrabold text-slate-900">Author Snapshot</h3>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5] shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-slate-500">Published Books</span>
                  <span className="text-[14px] font-extrabold text-slate-900">{profile.totalBooks}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 shrink-0">
                  <Calendar size={16} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-slate-500">Member Since</span>
                  <span className="text-[14px] font-extrabold text-slate-900">{profile.memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Snapshot */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FF9900]/10 text-[#FF9900]">
                  <TrendingUp size={16} />
                </div>
                <h3 className="text-[14px] font-extrabold text-slate-900">Sales Snapshot</h3>
              </div>
            </div>
            <p className="text-[26px] font-extrabold text-slate-900 leading-tight mt-2">{totalUnitsSold.toLocaleString()}</p>
            <p className="text-[11px] font-semibold text-slate-500 mb-4">Total units sold, all platforms</p>

            <div className="flex flex-col gap-3">
              {PLATFORM_SALES.map(p => (
                <div key={p.platform} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[12.5px] font-bold text-slate-900 flex-1">{p.platform}</span>
                  <span className="text-[12.5px] font-extrabold text-slate-900">{p.units.toLocaleString()}</span>
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#ec4899]/10 text-[#ec4899]">
                <BookOpen size={16} />
              </div>
              <h3 className="text-[14px] font-extrabold text-slate-900">Published Books</h3>
            </div>
            {top5Books.length > 0 ? (
              <div className="flex flex-col gap-1">
                {top5Books.map((book: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 py-2 -mx-1 px-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    {book.coverImage ? (
                      <img src={book.coverImage.startsWith('http') ? book.coverImage : `${storeUrl}${book.coverImage.startsWith('/') ? '' : '/'}${book.coverImage}`} alt={book.title} className="w-10 h-17 rounded-sm shrink-0 shadow-sm object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl shrink-0 shadow-sm" style={{ background: book.coverGradient }} />
                    )}
                    <div className="flex-1 min-w-0 mb-auto">
                      <p className="text-[13px] font-bold text-slate-900 truncate flex items-center gap-1.5">
                        {book.title}
                        {book === topBook && <span className="text-[9px] font-extrabold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md shrink-0">🏆 TOP</span>}
                      </p>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <Star size={12} className="fill-amber-400 text-amber-500" />
                          <span className="text-slate-500">{book.rating}</span>
                          <span className="text-slate-500 font-normal ml-0.5">({book.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 w-fit px-1.5 py-0.5 rounded flex-shrink-0">
                          <TrendingUp size={10} strokeWidth={3} />
                          {book.sales} sales
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-2 py-6">
                <ImageIcon size={22} className="text-slate-500" />
                <p className="text-[12px] text-slate-500 font-medium">No published books yet.</p>
              </div>
            )}
          </div>

          {/* Ratings Breakdown */}
          {avgRating && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600">
                  <Star size={16} />
                </div>
                <h3 className="text-[14px] font-extrabold text-slate-900">Ratings Breakdown</h3>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-[28px] font-extrabold text-slate-900 leading-none">{avgRating}</span>
                <span className="text-[11px] font-semibold text-slate-500 mb-1">average across all books</span>
              </div>
              <div className="flex flex-col gap-2">
                {RATING_BREAKDOWN.map(r => (
                  <div key={r.stars} className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 w-8 shrink-0">{r.stars}★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 w-8 text-right shrink-0">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Socials & Links */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#275697]/10 text-[#275697]">
                <ExternalLink size={16} />
              </div>
              <h3 className="text-[14px] font-extrabold text-slate-900">Socials & Links</h3>
            </div>
            <div className="flex flex-col gap-2">
              {profile.socials.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group p-3 rounded-xl bg-slate-100 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-900">{social.platform}</span>
                    <span className="text-[11px] font-medium text-slate-500">{social.handle}</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-500 group-hover:text-slate-900 transition-colors" />
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
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5]">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-slate-900 leading-tight">Personal Details</h2>
              <p className="text-[11px] font-medium text-slate-500">Only visible to you</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-extrabold text-slate-500 uppercase tracking-wide">Account Information</h3>
              <button
                onClick={async () => {
                  if (isEditing) {
                    setIsSaving(true);
                    try {
                      await updateAuthorProfileData({
                        authorName: profile.authorName,
                        bio: profile.bio,
                        legalName: profile.legalName,
                        email: profile.email,
                        phone: profile.phone,
                        address: profile.address
                      });
                    } finally {
                      setIsSaving(false);
                      setIsEditing(false);
                    }
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={isSaving}
                className={`text-[11px] font-bold transition-colors disabled:opacity-50 flex items-center gap-1 px-3 py-1.5 rounded-full ${isEditing ? "text-white" : "text-slate-500 bg-slate-100 hover:bg-slate-100"
                  }`}
                style={isEditing ? { background: BRAND_GRADIENT } : undefined}
              >
                {isSaving && <Loader2 size={12} className="animate-spin" />}
                {isEditing ? (isSaving ? "Saving..." : "Save") : "Edit"}
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-1">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Public Author Name</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5] shrink-0">
                      <User size={14} />
                    </div>
                    <input
                      value={profile.authorName}
                      onChange={e => setProfileData({ ...profile, authorName: e.target.value })}
                      className="text-[13px] font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 outline-none w-full"
                    />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-slate-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5] shrink-0"><User size={14} /></span>
                    {profile.authorName}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Public Bio</p>
                {isEditing ? (
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5] shrink-0 mt-0.5">
                      <BookOpen size={14} />
                    </div>
                    <textarea
                      value={profile.bio}
                      onChange={e => setProfileData({ ...profile, bio: e.target.value })}
                      className="text-[13px] font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 outline-none w-full resize-none"
                      rows={3}
                    />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-slate-900 flex items-start gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5] shrink-0"><BookOpen size={14} /></span>
                    <span className="leading-snug mt-1.5 line-clamp-3">{profile.bio}</span>
                  </p>
                )}
              </div>

              <div className="h-px bg-slate-100 my-1" />

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Private Legal Name</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5] shrink-0">
                      <User size={14} />
                    </div>
                    <input
                      value={profile.legalName}
                      onChange={e => setProfileData({ ...profile, legalName: e.target.value })}
                      className="text-[13px] font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 outline-none w-full"
                    />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-slate-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#4f46e5]/10 text-[#4f46e5] shrink-0"><User size={14} /></span>
                    {profile.legalName}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#275697]/10 text-[#275697] shrink-0">
                      <Mail size={14} />
                    </div>
                    <input
                      value={profile.email}
                      onChange={e => setProfileData({ ...profile, email: e.target.value })}
                      className="text-[13px] font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 outline-none w-full"
                    />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-slate-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#275697]/10 text-[#275697] shrink-0"><Mail size={14} /></span>
                    {profile.email}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 shrink-0">
                      <Phone size={14} />
                    </div>
                    <input
                      value={profile.phone}
                      onChange={e => setProfileData({ ...profile, phone: e.target.value })}
                      className="text-[13px] font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 outline-none w-full"
                    />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-slate-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 shrink-0"><Phone size={14} /></span>
                    {profile.phone}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Residential Address</p>
                {isEditing ? (
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f59e0b]/10 text-[#f59e0b] shrink-0 mt-0.5">
                      <MapPin size={14} />
                    </div>
                    <textarea
                      value={profile.address}
                      onChange={e => setProfileData({ ...profile, address: e.target.value })}
                      className="text-[13px] font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 outline-none w-full resize-none"
                      rows={2}
                    />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-slate-900 flex items-start gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f59e0b]/10 text-[#f59e0b] shrink-0"><MapPin size={14} /></span>
                    <span className="leading-snug mt-1.5">{profile.address}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-100 rounded-xl p-3.5 mt-2">
            <Lock size={14} className="text-slate-500 mt-0.5 shrink-0" />
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
              Your personal details are private and are never shown on your public author profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
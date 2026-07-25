"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import {
  Shield, Star, BookOpen, TrendingUp, Medal, Crown, Zap, Flame, Target, X, CheckCircle,
  Sparkles, UserCheck, Feather, Palette, Printer, Rocket, Layers, Trophy, Gem, Heart,
  Award, Wallet, IndianRupee, Coins, Edit3, ThumbsUp, MessageSquare, Hash, Share2, MessageCircle,
  Clock, Gift, Eye, Users, Globe, Megaphone, BookMarked, FileText, PenTool, Lightbulb,
  Headphones, Camera, Video, Mic, Radio, BarChart3, PieChart, Activity, Compass,
  Flag, MapPin, Calendar, Briefcase, GraduationCap, BadgeCheck, Infinity, Swords,
  CircleDot, Podcast, Newspaper, ScrollText, Bookmark, Pencil, Wand2, Clapperboard,
  PartyPopper, Handshake, HeartHandshake, TreePine, Mountain, Sun, Moon, CloudLightning,
} from "lucide-react";
import { syncAuthorBadges, getAuthorProfileData, getAuthorSalesData, getAuthorReviewsData, getAuthorLeaderboard } from "@/actions/auth";

export const TIERS = [
  { name: "Bronze League", minPoints: 0, color: "from-amber-700 to-amber-900", textColor: "text-amber-800", icon: Shield },
  { name: "Silver League", minPoints: 100, color: "from-slate-300 to-slate-500", textColor: "text-slate-600", icon: Shield },
  { name: "Gold League", minPoints: 300, color: "from-yellow-400 to-yellow-600", textColor: "text-yellow-600", icon: Medal },
  { name: "Crystal League", minPoints: 600, color: "from-fuchsia-400 to-purple-600", textColor: "text-fuchsia-600", icon: Zap },
  { name: "Master League", minPoints: 1000, color: "from-rose-500 to-red-700", textColor: "text-rose-600", icon: Flame },
  { name: "Legend League", minPoints: 1500, color: "from-indigo-500 via-purple-500 to-pink-500", textColor: "text-indigo-600", icon: Crown },
];

// Badge categories
const CATEGORIES = [
  "Getting Started",
  "Publishing Journey",
  "Sales Milestones",
  "Reviews & Reputation",
  "Royalty Earnings",
  "Community & Engagement",
  "Author Branding",
  "Consistency & Streaks",
  "Special Achievements",
  "Event & Seasonal",
];

// Book production stages
const BOOK_STAGE_ORDER = [
  "draft",
  "manuscript_submitted",
  "editing",
  "cover_design",
  "printing",
  "published",
];

function getBookStageIndex(book: any) {
  const raw = (book?.stage || book?.status || "draft")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "_");
  const idx = BOOK_STAGE_ORDER.indexOf(raw);
  return idx === -1 ? 0 : idx;
}

export function calculateStats(profile: any, salesData: any, reviewsData: any) {
  const stageIdx = (stage: string) => BOOK_STAGE_ORDER.indexOf(stage);

  // ---- Sales ----
  let totalSales = 0;
  if (salesData && salesData.books) {
    totalSales = salesData.books.reduce((acc: number, b: any) => acc + (b.unitsSold || 0), 0);
  }

  // ---- Reviews ----
  let totalReviews = 0;
  let fiveStarReviews = 0;
  let avgRating = 0;
  if (reviewsData && reviewsData.reviews) {
    totalReviews = reviewsData.reviews.length;
    fiveStarReviews = reviewsData.reviews.filter((r: any) => Math.round(Number(r.rating)) === 5).length;
    if (totalReviews > 0) {
      avgRating = reviewsData.reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0) / totalReviews;
    }
  }

  // ---- Books & production stages ----
  const books = profile?.books || [];
  const booksCount = books.length;
  const manuscriptSubmitted = books.some((b: any) => getBookStageIndex(b) >= stageIdx("manuscript_submitted"));
  const inEditing = books.some((b: any) => getBookStageIndex(b) >= stageIdx("editing"));
  const coverDesigned = books.some((b: any) => getBookStageIndex(b) >= stageIdx("cover_design"));
  const sentToPrint = books.some((b: any) => getBookStageIndex(b) >= stageIdx("printing"));
  const publishedBooksCount = books.filter((b: any) => getBookStageIndex(b) >= stageIdx("published")).length;

  // ---- Royalty ----
  const royalty = profile?.royalty || {};
  const totalRoyaltyEarned = royalty.totalEarned ?? profile?.totalRoyaltyEarned ?? 0;
  const royaltyPayoutsCount = royalty.payoutsCount ?? royalty.payouts?.length ?? 0;

  // ---- Community ----
  const community = profile?.community || {};
  const communityPosts = community.posts || [];
  const postsCount = community.postsCount ?? communityPosts.length ?? 0;
  const maxPostLikes = community.maxPostLikes ?? (communityPosts.length ? Math.max(...communityPosts.map((p: any) => p.likes || 0)) : 0);
  const commentsCount = community.commentsCount ?? 0;
  const totalLikesReceived = community.totalLikesReceived ?? communityPosts.reduce((acc: number, p: any) => acc + (p.likes || 0), 0);
  const hashtagsUsedByOthers = community.hashtagsUsedByOthers ?? community.trendingHashtagsCreated ?? 0;
  const followersCount = community.followersCount ?? 0;
  const followingCount = community.followingCount ?? 0;
  const sharedPostsCount = community.sharedPostsCount ?? 0;

  // ---- Profile completeness ----
  const isProfileComplete = Boolean(profile?.profileComplete) || Boolean(profile?.bio && (profile?.avatarUrl || profile?.profileImageUrl));
  const hasSocialLinks = Boolean(profile?.socials && profile.socials.length > 0);
  const hasWebsite = Boolean(profile?.website || profile?.socials?.some((s: any) => s.platform === 'website'));

  // ---- Streaks & consistency ----
  const streaks = profile?.streaks || {};
  const loginStreak = streaks.loginStreak ?? 0;
  const weeklyActiveWeeks = streaks.weeklyActiveWeeks ?? 0;
  const monthlyActiveMonths = streaks.monthlyActiveMonths ?? 0;

  // ---- Events ----
  const events = profile?.events || {};
  const eventsAttended = events.attended ?? 0;
  const workshopsCompleted = events.workshopsCompleted ?? 0;
  const webinarsHosted = events.webinarsHosted ?? 0;

  // ---- Author branding ----
  const branding = profile?.branding || {};
  const hasAuthorVideo = Boolean(branding.hasVideo || profile?.authorVideoUrl);
  const hasAudioIntro = Boolean(branding.hasAudio || profile?.audioIntroUrl);
  const hasBrandKit = Boolean(branding.hasBrandKit);
  const customBannerSet = Boolean(branding.customBanner || profile?.bannerUrl);
  const hasNewsletterSignup = Boolean(branding.newsletter);

  const achievements = [
    // ═══════════════════════════════════════════
    // GETTING STARTED (15 badges)
    // ═══════════════════════════════════════════
    { id: "login", category: "Getting Started", tier: 0, title: "First Login", points: 5, achieved: true, icon: Sparkles, description: "Joined the author platform" },
    { id: "profile_complete", category: "Getting Started", tier: 0, title: "Profile Complete", points: 10, achieved: isProfileComplete, icon: UserCheck, description: "Filled out your author bio & photo" },
    { id: "first_book_draft", category: "Getting Started", tier: 0, title: "First Book Started", points: 10, achieved: booksCount >= 1, icon: BookOpen, description: "Started your first book project" },
    { id: "social_links_added", category: "Getting Started", tier: 0, title: "Social Butterfly", points: 5, achieved: hasSocialLinks, icon: Share2, description: "Added social media links to profile" },
    { id: "website_linked", category: "Getting Started", tier: 0, title: "Web Presence", points: 5, achieved: hasWebsite, icon: Globe, description: "Linked your author website" },
    { id: "first_dashboard_visit", category: "Getting Started", tier: 0, title: "Dashboard Explorer", points: 3, achieved: true, icon: Compass, description: "Visited the dashboard for the first time" },
    { id: "profile_photo_set", category: "Getting Started", tier: 0, title: "Face of the Author", points: 5, achieved: Boolean(profile?.profileImageUrl), icon: Camera, description: "Uploaded a profile photo" },
    { id: "bio_written", category: "Getting Started", tier: 0, title: "Wordsmith Intro", points: 5, achieved: Boolean(profile?.bio && profile.bio.length > 20), icon: PenTool, description: "Wrote an author bio (20+ chars)" },
    { id: "two_books_started", category: "Getting Started", tier: 0, title: "Double Starter", points: 8, achieved: booksCount >= 2, icon: BookMarked, description: "Started 2 book projects" },
    { id: "five_books_started", category: "Getting Started", tier: 1, title: "Multi-Author", points: 12, achieved: booksCount >= 5, icon: Layers, description: "Started 5 book projects" },
    { id: "ten_books_started", category: "Getting Started", tier: 2, title: "Prolific Planner", points: 18, achieved: booksCount >= 10, icon: FileText, description: "Started 10 book projects" },
    { id: "first_week_active", category: "Getting Started", tier: 0, title: "Week One Done", points: 5, achieved: weeklyActiveWeeks >= 1, icon: Calendar, description: "Active for your first full week" },
    { id: "first_month_active", category: "Getting Started", tier: 1, title: "Month One Done", points: 10, achieved: monthlyActiveMonths >= 1, icon: Clock, description: "Active for your first full month" },
    { id: "settings_customized", category: "Getting Started", tier: 0, title: "Personalized", points: 3, achieved: Boolean(profile?.settingsCustomized), icon: Wand2, description: "Customized your dashboard settings" },
    { id: "help_docs_read", category: "Getting Started", tier: 0, title: "Knowledge Seeker", points: 3, achieved: Boolean(profile?.helpDocsRead), icon: Lightbulb, description: "Read the help documentation" },

    // ═══════════════════════════════════════════
    // PUBLISHING JOURNEY (14 badges)
    // ═══════════════════════════════════════════
    { id: "manuscript_submitted", category: "Publishing Journey", tier: 1, title: "Manuscript Submitted", points: 10, achieved: manuscriptSubmitted, icon: Feather, description: "Submitted a manuscript for review" },
    { id: "editing_started", category: "Publishing Journey", tier: 1, title: "Editing Phase", points: 8, achieved: inEditing, icon: Pencil, description: "A book entered the editing phase" },
    { id: "cover_designed", category: "Publishing Journey", tier: 2, title: "Cover Designed", points: 15, achieved: coverDesigned, icon: Palette, description: "Finalized a book cover design" },
    { id: "sent_to_print", category: "Publishing Journey", tier: 2, title: "Sent to Print", points: 20, achieved: sentToPrint, icon: Printer, description: "Sent a book to the printing press" },
    { id: "first_book_published", category: "Publishing Journey", tier: 2, title: "Published Author", points: 25, achieved: publishedBooksCount >= 1, icon: Rocket, description: "Published your first book" },
    { id: "two_books_published", category: "Publishing Journey", tier: 2, title: "Sequel Creator", points: 20, achieved: publishedBooksCount >= 2, icon: BookMarked, description: "Published 2 books" },
    { id: "three_books_published", category: "Publishing Journey", tier: 3, title: "Trilogy Complete", points: 25, achieved: publishedBooksCount >= 3, icon: Layers, description: "Published 3 books" },
    { id: "five_books_published", category: "Publishing Journey", tier: 3, title: "Library Builder", points: 35, achieved: publishedBooksCount >= 5, icon: BookOpen, description: "Published 5 books" },
    { id: "seven_books_published", category: "Publishing Journey", tier: 4, title: "Master Crafter", points: 45, achieved: publishedBooksCount >= 7, icon: Award, description: "Published 7 books" },
    { id: "ten_books_published", category: "Publishing Journey", tier: 4, title: "Prolific Author", points: 55, achieved: publishedBooksCount >= 10, icon: Trophy, description: "Published 10 books" },
    { id: "fifteen_books_published", category: "Publishing Journey", tier: 5, title: "Publishing Machine", points: 70, achieved: publishedBooksCount >= 15, icon: Infinity, description: "Published 15 books" },
    { id: "twenty_books_published", category: "Publishing Journey", tier: 5, title: "Literary Legend", points: 90, achieved: publishedBooksCount >= 20, icon: Crown, description: "Published 20 books" },
    { id: "fastest_publish", category: "Publishing Journey", tier: 3, title: "Speed Publisher", points: 20, achieved: Boolean(profile?.fastestPublish), icon: Zap, description: "Published a book within 30 days" },
    { id: "multi_genre", category: "Publishing Journey", tier: 3, title: "Genre Explorer", points: 25, achieved: Boolean(profile?.multiGenre), icon: Compass, description: "Published books in 3+ genres" },

    // ═══════════════════════════════════════════
    // SALES MILESTONES (16 badges)
    // ═══════════════════════════════════════════
    { id: "first_sale", category: "Sales Milestones", tier: 0, title: "First Sale", points: 10, achieved: totalSales >= 1, icon: TrendingUp, description: "Sold your first book" },
    { id: "ten_sales", category: "Sales Milestones", tier: 0, title: "10 Sales", points: 8, achieved: totalSales >= 10, icon: BarChart3, description: "Sold 10 books" },
    { id: "twenty_five_sales", category: "Sales Milestones", tier: 1, title: "25 Sales", points: 12, achieved: totalSales >= 25, icon: Target, description: "Sold 25 books" },
    { id: "fifty_sales", category: "Sales Milestones", tier: 1, title: "50 Sales", points: 15, achieved: totalSales >= 50, icon: Activity, description: "Sold 50 books" },
    { id: "hundred_sales", category: "Sales Milestones", tier: 1, title: "100 Sales", points: 20, achieved: totalSales >= 100, icon: Target, description: "Sold 100 books" },
    { id: "two_fifty_sales", category: "Sales Milestones", tier: 2, title: "250 Sales", points: 25, achieved: totalSales >= 250, icon: PieChart, description: "Sold 250 books" },
    { id: "five_hundred_sales", category: "Sales Milestones", tier: 2, title: "500 Sales", points: 30, achieved: totalSales >= 500, icon: Flame, description: "Sold 500 books" },
    { id: "thousand_sales", category: "Sales Milestones", tier: 3, title: "1,000 Sales", points: 40, achieved: totalSales >= 1000, icon: Zap, description: "Sold 1,000 books" },
    { id: "two_k_sales", category: "Sales Milestones", tier: 3, title: "2,000 Sales", points: 45, achieved: totalSales >= 2000, icon: Swords, description: "Sold 2,000 books" },
    { id: "three_k_sales", category: "Sales Milestones", tier: 3, title: "3,000 Sales", points: 50, achieved: totalSales >= 3000, icon: Mountain, description: "Sold 3,000 books" },
    { id: "five_k_sales", category: "Sales Milestones", tier: 4, title: "5,000 Sales", points: 60, achieved: totalSales >= 5000, icon: Flag, description: "Sold 5,000 books" },
    { id: "seven_k_sales", category: "Sales Milestones", tier: 4, title: "7,500 Sales", points: 70, achieved: totalSales >= 7500, icon: CloudLightning, description: "Sold 7,500 books" },
    { id: "ten_k_sales", category: "Sales Milestones", tier: 5, title: "10,000 Sales", points: 85, achieved: totalSales >= 10000, icon: Gem, description: "Sold 10,000 books" },
    { id: "twenty_five_k_sales", category: "Sales Milestones", tier: 5, title: "25,000 Sales", points: 100, achieved: totalSales >= 25000, icon: Sun, description: "Sold 25,000 books" },
    { id: "fifty_k_sales", category: "Sales Milestones", tier: 5, title: "50,000 Sales", points: 120, achieved: totalSales >= 50000, icon: Moon, description: "Sold 50,000 books" },
    { id: "hundred_k_sales", category: "Sales Milestones", tier: 5, title: "100,000 Sales", points: 150, achieved: totalSales >= 100000, icon: Crown, description: "Sold 100,000 books" },

    // ═══════════════════════════════════════════
    // REVIEWS & REPUTATION (14 badges)
    // ═══════════════════════════════════════════
    { id: "first_review", category: "Reviews & Reputation", tier: 0, title: "First Review", points: 10, achieved: totalReviews >= 1, icon: Star, description: "Received your first review" },
    { id: "five_reviews", category: "Reviews & Reputation", tier: 0, title: "5 Reviews", points: 8, achieved: totalReviews >= 5, icon: MessageCircle, description: "Received 5 reviews" },
    { id: "ten_reviews", category: "Reviews & Reputation", tier: 1, title: "10 Reviews", points: 15, achieved: totalReviews >= 10, icon: MessageCircle, description: "Received 10 reviews" },
    { id: "twenty_five_reviews", category: "Reviews & Reputation", tier: 2, title: "25 Reviews", points: 20, achieved: totalReviews >= 25, icon: Heart, description: "Received 25 reviews" },
    { id: "fifty_reviews", category: "Reviews & Reputation", tier: 3, title: "50 Reviews", points: 35, achieved: totalReviews >= 50, icon: Heart, description: "Received 50 reviews" },
    { id: "hundred_reviews", category: "Reviews & Reputation", tier: 4, title: "100 Reviews", points: 55, achieved: totalReviews >= 100, icon: Award, description: "Received 100 reviews" },
    { id: "two_fifty_reviews", category: "Reviews & Reputation", tier: 5, title: "250 Reviews", points: 75, achieved: totalReviews >= 250, icon: Trophy, description: "Received 250 reviews" },
    { id: "five_hundred_reviews", category: "Reviews & Reputation", tier: 5, title: "500 Reviews", points: 100, achieved: totalReviews >= 500, icon: Crown, description: "Received 500 reviews" },
    { id: "first_five_star", category: "Reviews & Reputation", tier: 0, title: "Perfect Score", points: 10, achieved: fiveStarReviews >= 1, icon: Sparkles, description: "Received your first 5-star review" },
    { id: "ten_five_star", category: "Reviews & Reputation", tier: 2, title: "10 Five-Stars", points: 25, achieved: fiveStarReviews >= 10, icon: Gem, description: "Received 10 five-star reviews" },
    { id: "fifty_five_star", category: "Reviews & Reputation", tier: 4, title: "50 Five-Stars", points: 50, achieved: fiveStarReviews >= 50, icon: BadgeCheck, description: "Received 50 five-star reviews" },
    { id: "avg_rating_4", category: "Reviews & Reputation", tier: 2, title: "Highly Rated", points: 20, achieved: avgRating >= 4 && totalReviews >= 5, icon: Star, description: "Maintain 4+ avg rating (5+ reviews)" },
    { id: "avg_rating_4_5", category: "Reviews & Reputation", tier: 3, title: "Near Perfect", points: 35, achieved: avgRating >= 4.5 && totalReviews >= 10, icon: Star, description: "Maintain 4.5+ avg rating (10+ reviews)" },
    { id: "avg_rating_4_8", category: "Reviews & Reputation", tier: 5, title: "Flawless Author", points: 60, achieved: avgRating >= 4.8 && totalReviews >= 25, icon: Crown, description: "Maintain 4.8+ avg rating (25+ reviews)" },

    // ═══════════════════════════════════════════
    // ROYALTY EARNINGS (12 badges)
    // ═══════════════════════════════════════════
    { id: "first_royalty", category: "Royalty Earnings", tier: 1, title: "First Payout", points: 10, achieved: royaltyPayoutsCount >= 1 || totalRoyaltyEarned > 0, icon: Wallet, description: "Received your first royalty payout" },
    { id: "royalty_5k", category: "Royalty Earnings", tier: 1, title: "₹5,000 Earned", points: 10, achieved: totalRoyaltyEarned >= 5000, icon: IndianRupee, description: "Crossed ₹5,000 in royalties" },
    { id: "royalty_10k", category: "Royalty Earnings", tier: 1, title: "₹10,000 Earned", points: 15, achieved: totalRoyaltyEarned >= 10000, icon: IndianRupee, description: "Crossed ₹10,000 in royalties" },
    { id: "royalty_25k", category: "Royalty Earnings", tier: 2, title: "₹25,000 Earned", points: 20, achieved: totalRoyaltyEarned >= 25000, icon: Coins, description: "Crossed ₹25,000 in royalties" },
    { id: "royalty_50k", category: "Royalty Earnings", tier: 2, title: "₹50,000 Earned", points: 25, achieved: totalRoyaltyEarned >= 50000, icon: IndianRupee, description: "Crossed ₹50,000 in royalties" },
    { id: "royalty_1l", category: "Royalty Earnings", tier: 3, title: "₹1 Lakh Earned", points: 35, achieved: totalRoyaltyEarned >= 100000, icon: Coins, description: "Crossed ₹1,00,000 in royalties" },
    { id: "royalty_2_5l", category: "Royalty Earnings", tier: 3, title: "₹2.5 Lakh Earned", points: 45, achieved: totalRoyaltyEarned >= 250000, icon: Coins, description: "Crossed ₹2,50,000 in royalties" },
    { id: "royalty_5l", category: "Royalty Earnings", tier: 4, title: "₹5 Lakh Earned", points: 60, achieved: totalRoyaltyEarned >= 500000, icon: Gem, description: "Crossed ₹5,00,000 in royalties" },
    { id: "royalty_10l", category: "Royalty Earnings", tier: 5, title: "₹10 Lakh Earned", points: 80, achieved: totalRoyaltyEarned >= 1000000, icon: Crown, description: "Crossed ₹10,00,000 in royalties" },
    { id: "royalty_25l", category: "Royalty Earnings", tier: 5, title: "₹25 Lakh Earned", points: 100, achieved: totalRoyaltyEarned >= 2500000, icon: Crown, description: "Crossed ₹25,00,000 in royalties" },
    { id: "three_payouts", category: "Royalty Earnings", tier: 2, title: "Triple Payout", points: 15, achieved: royaltyPayoutsCount >= 3, icon: Wallet, description: "Received 3 royalty payouts" },
    { id: "twelve_payouts", category: "Royalty Earnings", tier: 4, title: "Annual Earner", points: 45, achieved: royaltyPayoutsCount >= 12, icon: Briefcase, description: "Received 12 royalty payouts" },

    // ═══════════════════════════════════════════
    // COMMUNITY & ENGAGEMENT (14 badges)
    // ═══════════════════════════════════════════
    { id: "first_post", category: "Community & Engagement", tier: 1, title: "First Post", points: 8, achieved: postsCount >= 1, icon: Edit3, description: "Shared your first community post" },
    { id: "five_posts", category: "Community & Engagement", tier: 1, title: "Active Poster", points: 12, achieved: postsCount >= 5, icon: Newspaper, description: "Published 5 community posts" },
    { id: "twenty_posts", category: "Community & Engagement", tier: 2, title: "Content Creator", points: 20, achieved: postsCount >= 20, icon: ScrollText, description: "Published 20 community posts" },
    { id: "fifty_posts", category: "Community & Engagement", tier: 3, title: "Thought Leader", points: 35, achieved: postsCount >= 50, icon: Megaphone, description: "Published 50 community posts" },
    { id: "popular_post", category: "Community & Engagement", tier: 2, title: "Popular Post", points: 20, achieved: maxPostLikes >= 50, icon: ThumbsUp, description: "A post crossed 50 likes" },
    { id: "viral_post", category: "Community & Engagement", tier: 4, title: "Viral Post", points: 45, achieved: maxPostLikes >= 500, icon: Flame, description: "A post crossed 500 likes" },
    { id: "first_comment", category: "Community & Engagement", tier: 0, title: "First Comment", points: 5, achieved: commentsCount >= 1, icon: MessageSquare, description: "Left your first comment" },
    { id: "conversationalist", category: "Community & Engagement", tier: 3, title: "Conversationalist", points: 25, achieved: commentsCount >= 50, icon: MessageSquare, description: "Made 50+ comments" },
    { id: "trendsetter", category: "Community & Engagement", tier: 3, title: "Trendsetter", points: 30, achieved: hashtagsUsedByOthers >= 1, icon: Hash, description: "Created a hashtag other authors used" },
    { id: "community_pillar", category: "Community & Engagement", tier: 4, title: "Community Pillar", points: 45, achieved: totalLikesReceived >= 250, icon: HeartHandshake, description: "Earned 250+ total likes" },
    { id: "fifty_followers", category: "Community & Engagement", tier: 2, title: "Growing Audience", points: 15, achieved: followersCount >= 50, icon: Users, description: "Gained 50 followers" },
    { id: "two_fifty_followers", category: "Community & Engagement", tier: 3, title: "Influencer", points: 35, achieved: followersCount >= 250, icon: Users, description: "Gained 250 followers" },
    { id: "thousand_followers", category: "Community & Engagement", tier: 5, title: "Author Celebrity", points: 70, achieved: followersCount >= 1000, icon: Crown, description: "Gained 1,000 followers" },
    { id: "shared_10_posts", category: "Community & Engagement", tier: 2, title: "Generous Sharer", points: 15, achieved: sharedPostsCount >= 10, icon: Share2, description: "Shared 10 posts from other authors" },

    // ═══════════════════════════════════════════
    // AUTHOR BRANDING (10 badges)
    // ═══════════════════════════════════════════
    { id: "author_video", category: "Author Branding", tier: 2, title: "Video Intro", points: 15, achieved: hasAuthorVideo, icon: Video, description: "Uploaded an author introduction video" },
    { id: "audio_intro", category: "Author Branding", tier: 2, title: "Audio Intro", points: 15, achieved: hasAudioIntro, icon: Mic, description: "Recorded an author audio intro" },
    { id: "brand_kit", category: "Author Branding", tier: 3, title: "Brand Kit Ready", points: 25, achieved: hasBrandKit, icon: Palette, description: "Created your complete brand kit" },
    { id: "custom_banner", category: "Author Branding", tier: 1, title: "Custom Banner", points: 10, achieved: customBannerSet, icon: Clapperboard, description: "Set a custom profile banner" },
    { id: "newsletter_setup", category: "Author Branding", tier: 2, title: "Newsletter Author", points: 15, achieved: hasNewsletterSignup, icon: Newspaper, description: "Set up newsletter signup" },
    { id: "podcast_guest", category: "Author Branding", tier: 3, title: "Podcast Guest", points: 25, achieved: Boolean(profile?.podcastAppearance), icon: Podcast, description: "Appeared on a podcast" },
    { id: "media_mention", category: "Author Branding", tier: 3, title: "Media Mention", points: 30, achieved: Boolean(profile?.mediaMention), icon: Radio, description: "Got mentioned in media/press" },
    { id: "bookstore_listed", category: "Author Branding", tier: 2, title: "Store Listed", points: 15, achieved: Boolean(profile?.bookstoreListed), icon: MapPin, description: "Books available in a physical store" },
    { id: "author_page_views_1k", category: "Author Branding", tier: 2, title: "1K Profile Views", points: 15, achieved: (profile?.profileViews ?? 0) >= 1000, icon: Eye, description: "Author profile viewed 1,000 times" },
    { id: "author_page_views_10k", category: "Author Branding", tier: 4, title: "10K Profile Views", points: 40, achieved: (profile?.profileViews ?? 0) >= 10000, icon: Eye, description: "Author profile viewed 10,000 times" },

    // ═══════════════════════════════════════════
    // CONSISTENCY & STREAKS (10 badges)
    // ═══════════════════════════════════════════
    { id: "three_day_streak", category: "Consistency & Streaks", tier: 0, title: "3-Day Streak", points: 5, achieved: loginStreak >= 3, icon: Flame, description: "Logged in 3 days in a row" },
    { id: "seven_day_streak", category: "Consistency & Streaks", tier: 1, title: "7-Day Streak", points: 10, achieved: loginStreak >= 7, icon: Flame, description: "Logged in 7 days in a row" },
    { id: "fourteen_day_streak", category: "Consistency & Streaks", tier: 2, title: "14-Day Streak", points: 18, achieved: loginStreak >= 14, icon: Zap, description: "Logged in 14 days in a row" },
    { id: "thirty_day_streak", category: "Consistency & Streaks", tier: 3, title: "30-Day Streak", points: 30, achieved: loginStreak >= 30, icon: Target, description: "Logged in 30 days in a row" },
    { id: "sixty_day_streak", category: "Consistency & Streaks", tier: 4, title: "60-Day Streak", points: 45, achieved: loginStreak >= 60, icon: Mountain, description: "Logged in 60 days in a row" },
    { id: "hundred_day_streak", category: "Consistency & Streaks", tier: 5, title: "100-Day Streak", points: 65, achieved: loginStreak >= 100, icon: Crown, description: "Logged in 100 days in a row" },
    { id: "four_week_active", category: "Consistency & Streaks", tier: 1, title: "Monthly Regular", points: 12, achieved: weeklyActiveWeeks >= 4, icon: Calendar, description: "Active for 4 consecutive weeks" },
    { id: "twelve_week_active", category: "Consistency & Streaks", tier: 3, title: "Quarter Champion", points: 30, achieved: weeklyActiveWeeks >= 12, icon: Calendar, description: "Active for 12 consecutive weeks" },
    { id: "six_month_active", category: "Consistency & Streaks", tier: 4, title: "Half-Year Hero", points: 50, achieved: monthlyActiveMonths >= 6, icon: TreePine, description: "Active for 6 consecutive months" },
    { id: "one_year_active", category: "Consistency & Streaks", tier: 5, title: "Anniversary Author", points: 75, achieved: monthlyActiveMonths >= 12, icon: PartyPopper, description: "Active for a full year" },

    // ═══════════════════════════════════════════
    // SPECIAL ACHIEVEMENTS (5 badges)
    // ═══════════════════════════════════════════
    { id: "all_getting_started", category: "Special Achievements", tier: 2, title: "Fully Onboarded", points: 25, achieved: false, icon: BadgeCheck, description: "Unlocked all Getting Started badges" },
    { id: "all_sales_badges", category: "Special Achievements", tier: 5, title: "Sales Grandmaster", points: 100, achieved: false, icon: Crown, description: "Unlocked all Sales Milestone badges" },
    { id: "all_review_badges", category: "Special Achievements", tier: 5, title: "Review Legend", points: 100, achieved: false, icon: Crown, description: "Unlocked all Reviews badges" },
    { id: "fifty_badges_total", category: "Special Achievements", tier: 4, title: "Badge Collector", points: 60, achieved: false, icon: Gem, description: "Unlocked 50 total badges" },
    { id: "hundred_badges_total", category: "Special Achievements", tier: 5, title: "Badge Master", points: 100, achieved: false, icon: Trophy, description: "Unlocked all 100 badges" },

    // ═══════════════════════════════════════════
    // EVENT & SEASONAL (5 badges)
    // ═══════════════════════════════════════════
    { id: "first_event", category: "Event & Seasonal", tier: 1, title: "Event Attendee", points: 10, achieved: eventsAttended >= 1, icon: Flag, description: "Attended your first author event" },
    { id: "five_events", category: "Event & Seasonal", tier: 3, title: "Event Regular", points: 30, achieved: eventsAttended >= 5, icon: MapPin, description: "Attended 5 author events" },
    { id: "workshop_complete", category: "Event & Seasonal", tier: 2, title: "Workshop Graduate", points: 20, achieved: workshopsCompleted >= 1, icon: GraduationCap, description: "Completed an author workshop" },
    { id: "webinar_host", category: "Event & Seasonal", tier: 3, title: "Webinar Host", points: 30, achieved: webinarsHosted >= 1, icon: Headphones, description: "Hosted an author webinar" },
    { id: "mentor", category: "Event & Seasonal", tier: 4, title: "Author Mentor", points: 50, achieved: Boolean(profile?.isMentor), icon: Handshake, description: "Became a mentor for new authors" },
  ];

  // Compute special meta-badges
  const gettingStartedAll = achievements.filter(a => a.category === "Getting Started" && a.id !== "all_getting_started").every(a => a.achieved);
  const salesAll = achievements.filter(a => a.category === "Sales Milestones" && a.id !== "all_sales_badges").every(a => a.achieved);
  const reviewAll = achievements.filter(a => a.category === "Reviews & Reputation" && a.id !== "all_review_badges").every(a => a.achieved);
  const totalUnlocked = achievements.filter(a => a.achieved).length;

  // Update special badge achieved status
  const updatedAchievements = achievements.map(a => {
    if (a.id === "all_getting_started") return { ...a, achieved: gettingStartedAll };
    if (a.id === "all_sales_badges") return { ...a, achieved: salesAll };
    if (a.id === "all_review_badges") return { ...a, achieved: reviewAll };
    if (a.id === "fifty_badges_total") return { ...a, achieved: totalUnlocked >= 50 };
    if (a.id === "hundred_badges_total") return { ...a, achieved: totalUnlocked >= 100 };
    return a;
  });

  const totalPoints = updatedAchievements.reduce((acc, a) => acc + (a.achieved ? a.points : 0), 0);

  let currentTierIdx = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (totalPoints >= TIERS[i].minPoints) {
      currentTierIdx = i;
      break;
    }
  }

  const currentTier = TIERS[currentTierIdx];
  const nextTier = currentTierIdx < TIERS.length - 1 ? TIERS[currentTierIdx + 1] : null;
  const progress = nextTier
    ? Math.min(100, ((totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100)
    : 100;

  return { achievements: updatedAchievements, totalPoints, currentTier, currentTierIdx, nextTier, progress };
}

export default function BadgeSystemCo({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      Promise.all([
        getAuthorProfileData(),
        getAuthorSalesData(),
        getAuthorReviewsData(),
        getAuthorLeaderboard()
      ]).then(([pData, sData, rData, lbData]) => {
        setProfile(pData);
        setSalesData(sData);
        setReviewsData(rData);
        setLeaderboard(lbData);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  const stats = useMemo(() => {
    return calculateStats(profile, salesData, reviewsData);
  }, [profile, salesData, reviewsData]);

  useEffect(() => {
    if (!isLoading && stats.totalPoints >= 0) {
      syncAuthorBadges({
        total_points: stats.totalPoints,
        current_tier: stats.currentTier.name,
        unlocked_badges: stats.achievements.filter(a => a.achieved).map(a => a.id)
      }).catch(console.error);
    }
  }, [isLoading, stats.totalPoints, stats.currentTier.name, stats.achievements]);

  if (!isOpen) return null;

  const { achievements, totalPoints, currentTier, currentTierIdx, nextTier, progress } = stats;
  const tierBadgeCounts = TIERS.map((_, idx) => {
    const badgesForTier = achievements.filter(a => a.tier === idx);
    return { total: badgesForTier.length, unlocked: badgesForTier.filter(a => a.achieved).length };
  });

  // Group achievements by category for stacked layout
  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    badges: achievements.filter(a => a.category === cat),
  })).filter(g => g.badges.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="bg-panel w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative border border-ink/5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink transition-colors z-10"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-ink mb-2">Author Badges & Ranks</h2>
            <p className="text-ink/60 text-[13px] font-medium max-w-lg mx-auto">
              Unlock badges by publishing books, getting sales, and earning reviews. Earn XP to climb the ranks!
            </p>
            <p className="text-ink/40 text-[12px] font-semibold mt-1">
              {achievements.filter(a => a.achieved).length} / {achievements.length} badges unlocked
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Section: Overview */}
              <div className={`p-6 rounded-3xl bg-gradient-to-br ${currentTier.color} text-white relative overflow-hidden shadow-xl`}>
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none scale-150 transform translate-x-4 -translate-y-4">
                  <currentTier.icon size={120} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
                      <currentTier.icon size={32} strokeWidth={2} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black">{currentTier.name}</h3>
                      <p className="text-white/80 text-[13px] font-semibold">{totalPoints} Total XP Earned</p>
                    </div>
                    {leaderboard && leaderboard.my_rank && (
                      <div className="flex flex-col items-center bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20">
                        <span className="text-3xl font-black leading-none">#{leaderboard.my_rank}</span>
                        <span className="text-[10px] font-bold text-white/80 mt-1">of {leaderboard.total_authors}</span>
                      </div>
                    )}
                  </div>

                  {nextTier ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-white/80">Next: {nextTier.name}</span>
                        <span className="text-[11px] font-bold text-white/80">{Math.max(0, nextTier.minPoints - totalPoints)} XP to go</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold">
                      <Crown size={13} strokeWidth={2.5} />
                      Max Rank Achieved
                    </div>
                  )}
                </div>
              </div>

              {/* Ranks Section */}
              <div>
                <h3 className="text-[15px] font-bold text-ink mb-4">All Leagues</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TIERS.map((tier, idx) => {
                    const isUnlocked = totalPoints >= tier.minPoints;
                    const isCurrent = currentTierIdx === idx;
                    const TierIcon = tier.icon;
                    const counts = tierBadgeCounts[idx];

                    return (
                      <div
                        key={tier.name}
                        className={`p-4 rounded-2xl border transition-all relative ${
                          isUnlocked
                            ? isCurrent
                              ? 'border-ink/20 bg-gradient-to-br from-white to-ink/[0.02] shadow-md ring-2 ring-ink/5'
                              : 'border-ink/10 bg-white shadow-sm'
                            : 'border-ink/5 bg-ink/[0.02] opacity-60 grayscale'
                        }`}
                      >
                        {isCurrent && (
                          <div className="absolute top-3 right-3 text-emerald-500">
                            <CheckCircle size={16} strokeWidth={2.5} />
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isUnlocked ? `bg-gradient-to-br ${tier.color} text-white shadow-md` : 'bg-ink/10 text-ink/40'
                          }`}>
                          <TierIcon size={18} strokeWidth={isUnlocked ? 2.5 : 2} />
                        </div>
                        <h4 className={`text-[13px] font-bold mb-1 ${isUnlocked ? tier.textColor : 'text-ink/50'}`}>{tier.name}</h4>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wide ${isUnlocked ? 'bg-ink/5 text-ink/60' : 'bg-ink/5 text-ink/40'}`}>
                            {tier.minPoints} XP
                          </div>
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wide bg-ink/5 text-ink/60">
                            {counts.unlocked}/{counts.total}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              {/* Leaderboard Section */}
              {leaderboard && leaderboard.leaderboard && leaderboard.leaderboard.length > 0 && (
                <div>
                  <h3 className="text-[15px] font-bold text-ink mb-4">Author Leaderboard</h3>
                  <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
                    {leaderboard.leaderboard.slice(0, 10).map((entry: any, idx: number) => {
                      const isMe = entry.rank === leaderboard.my_rank;
                      const tier = TIERS.find(t => t.name === entry.current_tier) || TIERS[0];
                      const TierIcon = tier.icon;
                      const rankColors = idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-ink/40';
                      return (
                        <div
                          key={entry.author_id}
                          className={`flex items-center gap-3 px-4 py-3 border-b border-ink/5 last:border-b-0 transition-colors ${
                            isMe ? 'bg-indigo-50/70' : 'hover:bg-ink/[0.02]'
                          }`}
                        >
                          <span className={`text-[18px] font-black w-8 text-center ${rankColors}`}>
                            {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
                          </span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${tier.color} text-white shadow-sm`}>
                            <TierIcon size={14} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-bold truncate ${isMe ? 'text-indigo-700' : 'text-ink'}`}>
                              {entry.author_name} {isMe && <span className="text-[10px] font-extrabold text-indigo-500 ml-1">(You)</span>}
                            </p>
                            <p className="text-[11px] font-medium text-ink/40">{entry.current_tier}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[13px] font-extrabold text-ink">{entry.total_points}</p>
                            <p className="text-[10px] font-semibold text-ink/40">XP</p>
                          </div>
                        </div>
                      );
                    })}
                    {leaderboard.my_rank && leaderboard.my_rank > 10 && (
                      <>
                        <div className="flex items-center justify-center py-2 text-ink/30 text-[11px] font-bold">
                          ···
                        </div>
                        {leaderboard.leaderboard.filter((e: any) => e.rank === leaderboard.my_rank).map((entry: any) => {
                          const tier = TIERS.find(t => t.name === entry.current_tier) || TIERS[0];
                          const TierIcon = tier.icon;
                          return (
                            <div
                              key={`me-${entry.author_id}`}
                              className="flex items-center gap-3 px-4 py-3 bg-indigo-50/70"
                            >
                              <span className="text-[18px] font-black w-8 text-center text-indigo-500">#{entry.rank}</span>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${tier.color} text-white shadow-sm`}>
                                <TierIcon size={14} strokeWidth={2.5} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold truncate text-indigo-700">
                                  {entry.author_name} <span className="text-[10px] font-extrabold text-indigo-500 ml-1">(You)</span>
                                </p>
                                <p className="text-[11px] font-medium text-ink/40">{entry.current_tier}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[13px] font-extrabold text-ink">{entry.total_points}</p>
                                <p className="text-[10px] font-semibold text-ink/40">XP</p>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              )}
              </div>

              {/* Badges Section - Category by Category */}
              {grouped.map((group) => {
                const unlockedCount = group.badges.filter(a => a.achieved).length;
                return (
                  <div key={group.category}>
                    {/* Category Label */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[15px] font-bold text-ink">{group.category}</h3>
                      <span className="text-[12px] font-semibold text-ink/50 bg-ink/5 px-2 py-1 rounded-md">
                        {unlockedCount} / {group.badges.length}
                      </span>
                    </div>

                    {/* Badge Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {group.badges.map((a) => {
                        const AchIcon = a.icon;
                        return (
                          <div
                            key={a.id}
                            className={`p-4 rounded-2xl border transition-all ${a.achieved
                                ? 'border-ink/10 bg-gradient-to-br from-white to-ink/[0.02] shadow-sm'
                                : 'border-ink/5 bg-ink/[0.01] opacity-60 grayscale'
                              }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-inner ${a.achieved ? `bg-gradient-to-br ${TIERS[a.tier].color} text-white` : 'bg-ink/10 text-ink/40'
                              }`}>
                              <AchIcon size={18} strokeWidth={a.achieved ? 2.5 : 2} />
                            </div>
                            <h4 className={`text-[12px] font-bold mb-1 ${a.achieved ? 'text-ink' : 'text-ink/50'}`}>{a.title}</h4>
                            <p className="text-[10px] font-medium text-ink/40 leading-tight mb-3 min-h-[24px]">{a.description}</p>

                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-[9px] font-extrabold uppercase tracking-wide ${a.achieved ? TIERS[a.tier].textColor : 'text-ink/30'}`}>
                                {TIERS[a.tier].name.replace(' League', '')}
                              </span>
                              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wide ${a.achieved ? 'bg-emerald-500/10 text-emerald-600' : 'bg-ink/5 text-ink/40'
                                }`}>
                                +{a.points} XP
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
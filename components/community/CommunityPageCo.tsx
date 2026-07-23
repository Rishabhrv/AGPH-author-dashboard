"use client";

import { useEffect, useRef, useState } from "react";
import {
  Trophy,
  MessageCircle,
  ThumbsUp,
  Share2,
  Calendar,
  Users,
  Search,
  Plus,
  TrendingUp,
  Award,
  Video,
  ArrowLeft,
  Hash,
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  MoreVertical,
  Clock,
  MapPin,
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  Type,
  Bookmark,
  ArrowRight,
  Pin,
  Bell,
  X,
  Reply,
  Upload,
  Globe,
  Building2,
  Repeat,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  BarChart3,
  Zap,
  Palette,
  Circle,
  Crown,
  Flag,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type PostType = "discussion" | "question" | "showcase" | "poll";
type FeedTab = "all" | "trending" | "unanswered";
type EventMode = "online" | "in-person";
type Recurring = "none" | "weekly" | "monthly";
type BookScope = "state" | "national" | "global";

interface ReactionState {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface CommentItem {
  id: number;
  author: string;
  initials: string;
  avatarBg: string;
  content: string;
  timeAgo: string;
  likes: number;
  liked: boolean;
  isBestAnswer?: boolean;
  replies: CommentItem[];
}

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

interface PostItem {
  id: number;
  author: string;
  authorInitials: string;
  avatarBg: string;
  role: string;
  timeAgo: string;
  type: PostType;
  category: string;
  title: string;
  content: string;
  tags: string[];
  reactions: ReactionState[];
  comments: CommentItem[];
  isTrending: boolean;
  isPinned: boolean;
  isAnswered: boolean;
  bookmarked: boolean;
  images: string[];
  poll?: {
    options: PollOption[];
    endsIn: string;
    votedOptionId: string | null;
  };
}

interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
  icon: any;
  color: string;
  mode: EventMode;
  location: string;
  hosts: string[];
  capacity: number | null;
  attendees: number;
  recurring: Recurring;
  going: boolean;
  description: string;
}

interface ChatMessageItem {
  id: string;
  author: string;
  initials: string;
  avatarBg: string;
  content: string;
  time: string;
  self: boolean;
  reactions: ReactionState[];
  threadReplies: number;
  attachment: { type: "image" | "file"; name: string } | null;
}

interface ChannelItem {
  id: string;
  name: string;
  unread: number;
  locked?: boolean;
}

interface DMItem {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  lastMessage: string;
  unread: number;
  online: boolean;
}

interface TopBookItem {
  rank: number;
  title: string;
  author: string;
  category: string;
  metric: string;
  trend: "up" | "down" | "same";
  trendValue: string;
  coverGradient: string;
  bookmarked: boolean;
}

// ============================================================================
// CONSTANTS / SEED DATA
// ============================================================================

const POST_TYPE_META: Record<PostType, { label: string; icon: any; color: string }> = {
  discussion: { label: "Discussion", icon: MessageCircle, color: "#4f7cff" },
  question: { label: "Question", icon: HelpCircle, color: "#f59e0b" },
  showcase: { label: "Showcase", icon: Sparkles, color: "#ec4899" },
  poll: { label: "Poll", icon: BarChart3, color: "#22c55e" },
};

const FEED_CATEGORIES = ["All", "Marketing", "Writing Craft", "Publishing", "Announcements", "Showcase"];

const QUICK_EMOJIS = ["👍", "❤️", "🔥", "👏"];

const HOST_OPTIONS = [
  { name: "AGPH Team", initials: "AG", avatarBg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Sarah Jenkins", initials: "SJ", avatarBg: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)" },
  { name: "David Chen", initials: "DC", avatarBg: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)" },
  { name: "Amanda Cole", initials: "AC", avatarBg: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)" },
];

const BOOK_SCOPE_META: Record<BookScope, { label: string; icon: any; description: string }> = {
  state: { label: "Your State", icon: MapPin, description: "Top sellers among readers in your state" },
  national: { label: "National", icon: Flag, description: "Top sellers across the country this week" },
  global: { label: "Global", icon: Globe, description: "Top sellers across the entire platform worldwide" },
};

const TOP_BOOKS: Record<BookScope, TopBookItem[]> = {
  state: [
    {
      rank: 1,
      title: "The Silent Monsoon",
      author: "Amanda Cole",
      category: "Poetry",
      metric: "3,120 copies sold",
      trend: "up",
      trendValue: "2",
      coverGradient: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
      bookmarked: false,
    },
    {
      rank: 2,
      title: "Whispers in the Byline",
      author: "James Wu",
      category: "Non-Fiction",
      metric: "2,845 copies sold",
      trend: "same",
      trendValue: "0",
      coverGradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      bookmarked: false,
    },
    {
      rank: 3,
      title: "Echoes of the Ghats",
      author: "Sarah Jenkins",
      category: "Fiction",
      metric: "2,410 copies sold",
      trend: "up",
      trendValue: "5",
      coverGradient: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
      bookmarked: false,
    },
    {
      rank: 4,
      title: "The Last Manuscript",
      author: "David Chen",
      category: "Thriller",
      metric: "1,980 copies sold",
      trend: "down",
      trendValue: "1",
      coverGradient: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
      bookmarked: false,
    },
    {
      rank: 5,
      title: "Ink & Almonds",
      author: "Priya Nair",
      category: "Memoir",
      metric: "1,640 copies sold",
      trend: "up",
      trendValue: "3",
      coverGradient: "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)",
      bookmarked: false,
    },
  ],
  national: [
    {
      rank: 1,
      title: "The Last Manuscript",
      author: "David Chen",
      category: "Thriller",
      metric: "48,200 copies sold",
      trend: "up",
      trendValue: "1",
      coverGradient: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
      bookmarked: false,
    },
    {
      rank: 2,
      title: "The Silent Monsoon",
      author: "Amanda Cole",
      category: "Poetry",
      metric: "39,750 copies sold",
      trend: "up",
      trendValue: "4",
      coverGradient: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
      bookmarked: false,
    },
    {
      rank: 3,
      title: "Ledger of Small Gods",
      author: "Rohit Malhotra",
      category: "Fantasy",
      metric: "36,110 copies sold",
      trend: "down",
      trendValue: "2",
      coverGradient: "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)",
      bookmarked: false,
    },
    {
      rank: 4,
      title: "Echoes of the Ghats",
      author: "Sarah Jenkins",
      category: "Fiction",
      metric: "29,900 copies sold",
      trend: "same",
      trendValue: "0",
      coverGradient: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
      bookmarked: false,
    },
    {
      rank: 5,
      title: "Whispers in the Byline",
      author: "James Wu",
      category: "Non-Fiction",
      metric: "24,330 copies sold",
      trend: "up",
      trendValue: "2",
      coverGradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      bookmarked: false,
    },
    {
      rank: 6,
      title: "Ink & Almonds",
      author: "Priya Nair",
      category: "Memoir",
      metric: "18,470 copies sold",
      trend: "down",
      trendValue: "1",
      coverGradient: "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)",
      bookmarked: false,
    },
  ],
  global: [
    {
      rank: 1,
      title: "Ledger of Small Gods",
      author: "Rohit Malhotra",
      category: "Fantasy",
      metric: "612,400 copies sold",
      trend: "up",
      trendValue: "3",
      coverGradient: "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)",
      bookmarked: false,
    },
    {
      rank: 2,
      title: "The Last Manuscript",
      author: "David Chen",
      category: "Thriller",
      metric: "588,900 copies sold",
      trend: "same",
      trendValue: "0",
      coverGradient: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
      bookmarked: false,
    },
    {
      rank: 3,
      title: "Nine Tides of Osaka",
      author: "Mika Tanaka",
      category: "Fiction",
      metric: "471,250 copies sold",
      trend: "up",
      trendValue: "6",
      coverGradient: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
      bookmarked: false,
    },
    {
      rank: 4,
      title: "The Silent Monsoon",
      author: "Amanda Cole",
      category: "Poetry",
      metric: "402,010 copies sold",
      trend: "up",
      trendValue: "2",
      coverGradient: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
      bookmarked: false,
    },
    {
      rank: 5,
      title: "Borrowed Constellations",
      author: "Elena Vasquez",
      category: "Sci-Fi",
      metric: "365,870 copies sold",
      trend: "down",
      trendValue: "1",
      coverGradient: "linear-gradient(135deg, #0ea5e9 0%, #a78bfa 100%)",
      bookmarked: false,
    },
    {
      rank: 6,
      title: "Echoes of the Ghats",
      author: "Sarah Jenkins",
      category: "Fiction",
      metric: "298,540 copies sold",
      trend: "down",
      trendValue: "2",
      coverGradient: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
      bookmarked: false,
    },
  ],
};

const INITIAL_POSTS: PostItem[] = [
  {
    id: 1,
    author: "AGPH Team",
    authorInitials: "AG",
    avatarBg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    role: "Official",
    timeAgo: "5 hours ago",
    type: "discussion",
    category: "Announcements",
    title: "🎉 Announcing the Summer Writing Contest!",
    content:
      "We're thrilled to announce our annual Summer Writing Contest. Submit your short stories by August 15th for a chance to win a free publishing package and cash prizes. Check out the full guidelines in the link below.",
    tags: ["Announcement", "Contest", "Events"],
    reactions: [
      { emoji: "👍", count: 98, reacted: false },
      { emoji: "🔥", count: 58, reacted: false },
      { emoji: "👏", count: 23, reacted: false },
    ],
    comments: [
      {
        id: 101,
        author: "Sarah Jenkins",
        initials: "SJ",
        avatarBg: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
        content: "This is amazing, definitely submitting something this year!",
        timeAgo: "4h",
        likes: 6,
        liked: false,
        replies: [],
      },
      {
        id: 102,
        author: "David Chen",
        initials: "DC",
        avatarBg: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
        content: "Is there a word count limit for the short stories?",
        timeAgo: "3h",
        likes: 2,
        liked: false,
        replies: [
          {
            id: 103,
            author: "AGPH Team",
            initials: "AG",
            avatarBg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            content: "Yes — 3,000 words max. Full details are in the guidelines doc!",
            timeAgo: "2h",
            likes: 4,
            liked: false,
            replies: [],
          },
        ],
      },
    ],
    isTrending: true,
    isPinned: true,
    isAnswered: false,
    bookmarked: false,
    images: [],
  },
  {
    id: 2,
    author: "Sarah Jenkins",
    authorInitials: "SJ",
    avatarBg: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
    role: "Bestselling Author",
    timeAgo: "2 hours ago",
    type: "question",
    category: "Marketing",
    title: "Tips for marketing your first fiction novel?",
    content:
      "Hi everyone! I just published my first fantasy novel and I'm struggling a bit with finding the right marketing channels. Has anyone had success with Instagram ads vs Facebook ads? Would love to hear your experiences!",
    tags: ["Marketing", "Fiction", "Social Media"],
    reactions: [
      { emoji: "👍", count: 24, reacted: false },
      { emoji: "❤️", count: 9, reacted: false },
    ],
    comments: [
      {
        id: 201,
        author: "Michael R.",
        initials: "MR",
        avatarBg: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
        content: "Instagram worked much better for me, especially Reels with the cover reveal.",
        timeAgo: "1h",
        likes: 5,
        liked: false,
        replies: [],
      },
    ],
    isTrending: true,
    isPinned: false,
    isAnswered: false,
    bookmarked: false,
    images: [],
  },
  {
    id: 3,
    author: "David Chen",
    authorInitials: "DC",
    avatarBg: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
    role: "Expert",
    timeAgo: "8 hours ago",
    type: "poll",
    category: "Writing Craft",
    title: "Which cover style resonates most for a psychological thriller?",
    content:
      "Working through cover concepts with my designer and would love a gut-check from the community before we finalize anything.",
    tags: ["CoverDesign", "Thriller", "Feedback"],
    reactions: [{ emoji: "👍", count: 15, reacted: false }],
    comments: [
      {
        id: 301,
        author: "Amanda Cole",
        initials: "AC",
        avatarBg: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
        content: "Illustrated moody scenes tend to outsell in that genre — voted accordingly!",
        timeAgo: "5h",
        likes: 3,
        liked: false,
        replies: [],
      },
    ],
    isTrending: false,
    isPinned: false,
    isAnswered: false,
    bookmarked: false,
    images: [],
    poll: {
      endsIn: "2 days left",
      votedOptionId: null,
      options: [
        { id: "a", label: "Minimalist, typography-only", votes: 34 },
        { id: "b", label: "Illustrated moody scene", votes: 61 },
        { id: "c", label: "Photo-manipulation portrait", votes: 19 },
        { id: "d", label: "Abstract color-field", votes: 8 },
      ],
    },
  },
  {
    id: 4,
    author: "Amanda Cole",
    authorInitials: "AC",
    avatarBg: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
    role: "Helper",
    timeAgo: "1 day ago",
    type: "showcase",
    category: "Showcase",
    title: "Just unboxed my first print run! 📦📚",
    content:
      "After eight months of edits, my debut poetry collection is finally a real, physical book. Sharing a peek at the cover and the interior layout — so surreal holding it for the first time.",
    tags: ["Poetry", "SelfPublishing", "Milestone"],
    reactions: [
      { emoji: "🔥", count: 41, reacted: false },
      { emoji: "❤️", count: 33, reacted: false },
      { emoji: "👏", count: 20, reacted: false },
    ],
    comments: [
      {
        id: 401,
        author: "Sarah Jenkins",
        initials: "SJ",
        avatarBg: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
        content: "Congratulations! The cover treatment looks gorgeous.",
        timeAgo: "20h",
        likes: 7,
        liked: false,
        replies: [],
      },
      {
        id: 402,
        author: "James Wu",
        initials: "JW",
        avatarBg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
        content: "What printer did you go with for the interior stock?",
        timeAgo: "18h",
        likes: 1,
        liked: false,
        replies: [],
      },
    ],
    isTrending: false,
    isPinned: false,
    isAnswered: false,
    bookmarked: false,
    images: ["cover", "interior"],
  },
  {
    id: 5,
    author: "James Wu",
    authorInitials: "JW",
    avatarBg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    role: "Author",
    timeAgo: "2 days ago",
    type: "question",
    category: "Publishing",
    title: "How do I set up price-matching against Amazon on KDP?",
    content:
      "Trying to keep my ebook price consistent across Amazon and my direct store without manually updating both every time. Anyone found a reliable workflow?",
    tags: ["KDP", "Pricing", "Workflow"],
    reactions: [{ emoji: "👍", count: 12, reacted: false }],
    comments: [
      {
        id: 501,
        author: "David Chen",
        initials: "DC",
        avatarBg: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
        content:
          "KDP checks competing prices periodically — set your direct-store price first, then match it manually once and KDP's crawler will pick it up within a few days.",
        timeAgo: "1d",
        likes: 14,
        liked: false,
        isBestAnswer: true,
        replies: [],
      },
    ],
    isTrending: false,
    isPinned: false,
    isAnswered: true,
    bookmarked: false,
    images: [],
  },
];

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Mastering Amazon Ads",
    date: "July 18, 2026",
    time: "2:00 PM EST",
    type: "Webinar",
    icon: Video,
    color: "#4facfe",
    mode: "online",
    location: "zoom.us/j/agph-ads-webinar",
    hosts: ["David Chen"],
    capacity: 200,
    attendees: 142,
    recurring: "none",
    going: false,
    description: "A practical walkthrough of Amazon Ads campaign structure for backlist and new releases.",
  },
  {
    id: 2,
    title: "Author Meet & Greet",
    date: "July 22, 2026",
    time: "6:00 PM EST",
    type: "Networking",
    icon: Users,
    color: "#fa709a",
    mode: "in-person",
    location: "The Reading Room, Austin TX",
    hosts: ["AGPH Team", "Sarah Jenkins"],
    capacity: 60,
    attendees: 47,
    recurring: "none",
    going: true,
    description: "An informal evening to connect with fellow authors over coffee and readings.",
  },
  {
    id: 3,
    title: "Cover Design Trends",
    date: "Aug 05, 2026",
    time: "1:00 PM EST",
    type: "Workshop",
    icon: Palette,
    color: "#FFE66D",
    mode: "online",
    location: "Link shared after RSVP",
    hosts: ["Amanda Cole"],
    capacity: null,
    attendees: 89,
    recurring: "monthly",
    going: false,
    description: "A look at what's working in genre cover design this year, with live critique.",
  },
  {
    id: 4,
    title: "Weekend Writing Sprint",
    date: "Every Saturday",
    time: "10:00 AM EST",
    type: "Writing Sprint",
    icon: Zap,
    color: "#8b5cf6",
    mode: "online",
    location: "Discord voice channel",
    hosts: ["Community"],
    capacity: null,
    attendees: 210,
    recurring: "weekly",
    going: false,
    description: "Drop in, mute up, and knock out a focused sprint alongside other authors.",
  },
];

const TOP_CONTRIBUTORS = [
  { name: "David Chen", initials: "DC", score: 1250, badge: "Expert" },
  { name: "Sarah Jenkins", initials: "SJ", score: 980, badge: "Rising Star" },
  { name: "Amanda Cole", initials: "AC", score: 845, badge: "Helper" },
];

const CHANNELS: ChannelItem[] = [
  { id: "general", name: "general-discussion", unread: 0 },
  { id: "marketing", name: "marketing-tips", unread: 3 },
  { id: "critique", name: "writing-critique", unread: 0 },
  { id: "showcase", name: "book-showcase", unread: 12 },
  { id: "announcements", name: "announcements", unread: 1, locked: true },
];

const DMS: DMItem[] = [
  {
    id: "dm-michael",
    name: "Michael R.",
    initials: "MR",
    avatarBg: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
    lastMessage: "Thanks for the tip on Reels!",
    unread: 2,
    online: true,
  },
  {
    id: "dm-amanda",
    name: "Amanda Cole",
    initials: "AC",
    avatarBg: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
    lastMessage: "Sent you the draft cover",
    unread: 0,
    online: false,
  },
];

const ONLINE_MEMBERS = [
  { name: "Sarah Jenkins", initials: "SJ", avatarBg: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)" },
  { name: "Michael R.", initials: "MR", avatarBg: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)" },
  { name: "David Chen", initials: "DC", avatarBg: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)" },
  { name: "You", initials: "ME", avatarBg: "#4f46e5" },
];

const OFFLINE_MEMBERS = [
  { name: "Amanda Cole", initials: "AC", avatarBg: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)" },
  { name: "James Wu", initials: "JW", avatarBg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" },
  { name: "Lisa Park", initials: "LP", avatarBg: "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)" },
];

const NOTIFICATIONS = [
  { id: 1, text: "Sarah Jenkins liked your post", time: "10m ago", read: false },
  { id: 2, text: "David Chen replied to your comment", time: "1h ago", read: false },
  { id: 3, text: "New event: Cover Design Trends", time: "3h ago", read: false },
  { id: 4, text: "Your question was marked as answered", time: "1d ago", read: true },
];

const CANNED_REPLIES: Record<string, { author: string; initials: string; avatarBg: string; lines: string[] }> = {
  general: {
    author: "Sarah Jenkins",
    initials: "SJ",
    avatarBg: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
    lines: [
      "Good point — hadn't thought of it that way!",
      "Following this thread closely, keep the ideas coming.",
      "Same experience here, glad it's not just me.",
    ],
  },
  marketing: {
    author: "Michael R.",
    initials: "MR",
    avatarBg: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
    lines: ["That's a solid approach, I'll try it this week.", "Bookmarking this one, thank you!"],
  },
  critique: {
    author: "Amanda Cole",
    initials: "AC",
    avatarBg: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
    lines: ["Sending you a DM with detailed notes shortly.", "The pacing note is spot on."],
  },
  showcase: {
    author: "James Wu",
    initials: "JW",
    avatarBg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    lines: ["Beautiful work, congrats!", "Adding this to my inspiration folder."],
  },
  "dm-michael": {
    author: "Michael R.",
    initials: "MR",
    avatarBg: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
    lines: ["Sounds good, talk soon!", "Appreciate you, thank you!"],
  },
  "dm-amanda": {
    author: "Amanda Cole",
    initials: "AC",
    avatarBg: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
    lines: ["On it, will send it over shortly.", "Got it, thanks for the heads up!"],
  },
};

const SEED_MESSAGES: Record<string, ChatMessageItem[]> = {
  general: [
    {
      id: "g1",
      author: "Sarah Jenkins",
      initials: "SJ",
      avatarBg: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
      content: "Has anyone tried running TikTok ads for their thriller novels recently? ROI seems lower than FB for me.",
      time: "10:42 AM",
      self: false,
      reactions: [],
      threadReplies: 0,
      attachment: null,
    },
    {
      id: "g2",
      author: "Michael R.",
      initials: "MR",
      avatarBg: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
      content: "Yes! I saw a 20% bump in KU reads last week. It's all about the hook in the first 3 seconds.",
      time: "10:45 AM",
      self: false,
      reactions: [
        { emoji: "🔥", count: 5, reacted: false },
        { emoji: "👀", count: 2, reacted: false },
      ],
      threadReplies: 3,
      attachment: null,
    },
    {
      id: "g3",
      author: "You",
      initials: "ME",
      avatarBg: "#4f46e5",
      content: "That's awesome! Do you use trending audio or voiceovers? My organic TikToks do better with my own voice.",
      time: "10:48 AM",
      self: true,
      reactions: [],
      threadReplies: 0,
      attachment: null,
    },
    {
      id: "g4",
      author: "David Chen",
      initials: "DC",
      avatarBg: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
      content: "Sharing the ad copy doc we workshopped last month, might help.",
      time: "10:52 AM",
      self: false,
      reactions: [{ emoji: "👍", count: 4, reacted: false }],
      threadReplies: 0,
      attachment: { type: "file", name: "ad-copy-swipe-file.pdf" },
    },
  ],
  marketing: [
    {
      id: "m1",
      author: "Amanda Cole",
      initials: "AC",
      avatarBg: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
      content: "Anyone else seeing better CPMs on Pinterest for cozy mystery covers?",
      time: "9:12 AM",
      self: false,
      reactions: [],
      threadReplies: 0,
      attachment: null,
    },
  ],
  critique: [],
  showcase: [
    {
      id: "s1",
      author: "James Wu",
      initials: "JW",
      avatarBg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      content: "Dropping my new pre-order banner here for feedback before it goes live.",
      time: "Yesterday",
      self: false,
      reactions: [{ emoji: "❤️", count: 6, reacted: false }],
      threadReplies: 0,
      attachment: { type: "image", name: "preorder-banner.png" },
    },
  ],
  announcements: [
    {
      id: "a1",
      author: "AGPH Team",
      initials: "AG",
      avatarBg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      content: "Platform maintenance is scheduled for Sunday 2 AM–3 AM EST. Community chat may briefly disconnect.",
      time: "2 days ago",
      self: false,
      reactions: [],
      threadReplies: 0,
      attachment: null,
    },
  ],
  "dm-michael": [
    {
      id: "dm-m1",
      author: "Michael R.",
      initials: "MR",
      avatarBg: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
      content: "Hey! Thanks for the tip on Reels, tried it and it's already working well.",
      time: "Yesterday",
      self: false,
      reactions: [],
      threadReplies: 0,
      attachment: null,
    },
  ],
  "dm-amanda": [
    {
      id: "dm-a1",
      author: "Amanda Cole",
      initials: "AC",
      avatarBg: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
      content: "Sent you the draft cover — let me know your thoughts whenever you get a chance.",
      time: "2 days ago",
      self: false,
      reactions: [],
      threadReplies: 0,
      attachment: { type: "image", name: "cover-draft-v3.png" },
    },
  ],
};

const PINNED_MESSAGE: Record<string, string | null> = {
  general: "Community guidelines: be kind, be helpful, no spam or unsolicited DMs.",
  marketing: "Share results, not just tactics — context helps everyone learn faster.",
  critique: null,
  showcase: "Showcasing here? Tag the format (ebook/print/audio) so folks can react accordingly.",
  announcements: "Official updates only — reply in #general-discussion.",
  "dm-michael": null,
  "dm-amanda": null,
};

// ============================================================================
// SMALL PRESENTATIONAL HELPERS
// ============================================================================

function Avatar({ initials, bg, className }: { initials: string; bg: string; className: string }) {
  return (
    <div
      className={`${className} rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}
      style={{ background: bg }}
    >
      {initials}
    </div>
  );
}

function TypeBadge({ type }: { type: PostType }) {
  const meta = POST_TYPE_META[type];
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider"
      style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
    >
      <Icon size={11} /> {meta.label}
    </span>
  );
}

function TrendBadge({ trend, trendValue }: { trend: "up" | "down" | "same"; trendValue: string }) {
  if (trend === "up") {
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600">
        <ArrowUp size={12} /> {trendValue}
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-bold text-red-500">
        <ArrowDown size={12} /> {trendValue}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[11px] font-bold text-ink/40">
      <Minus size={12} /> steady
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CommunityPageCo() {
  const [currentView, setCurrentView] = useState<"feed" | "chat" | "post" | "event" | "books">("feed");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(message: string) {
    setToastMessage(message);
  }

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // ---- Feed state ----
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [openReplyBox, setOpenReplyBox] = useState<Record<string, boolean>>({});
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  function toggleNotifPanel() {
    setNotifOpen((v) => !v);
    if (!notifOpen) setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function toggleReaction(postId: number, emoji: string) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const existing = p.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...p,
            reactions: p.reactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted } : r
            ),
          };
        }
        return { ...p, reactions: [...p.reactions, { emoji, count: 1, reacted: true }] };
      })
    );
  }

  function toggleBookmark(postId: number) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p)));
    showToast("Saved to your bookmarks");
  }

  function votePoll(postId: number, optionId: string) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.poll) return p;
        const { votedOptionId, options } = p.poll;
        let newOptions = options;
        let newVoted: string | null = optionId;
        if (votedOptionId === optionId) {
          newOptions = options.map((o) => (o.id === optionId ? { ...o, votes: o.votes - 1 } : o));
          newVoted = null;
        } else if (votedOptionId) {
          newOptions = options.map((o) => {
            if (o.id === votedOptionId) return { ...o, votes: o.votes - 1 };
            if (o.id === optionId) return { ...o, votes: o.votes + 1 };
            return o;
          });
        } else {
          newOptions = options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o));
        }
        return { ...p, poll: { ...p.poll, options: newOptions, votedOptionId: newVoted } };
      })
    );
  }

  function addComment(postId: number) {
    const text = (replyDrafts[postId] || "").trim();
    if (!text) return;
    const newComment: CommentItem = {
      id: Date.now(),
      author: "You",
      initials: "ME",
      avatarBg: "#4f46e5",
      content: text,
      timeAgo: "now",
      likes: 0,
      liked: false,
      replies: [],
    };
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p)));
    setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
  }

  function toggleCommentLike(postId: number, commentId: number) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const updateList = (list: CommentItem[]): CommentItem[] =>
          list.map((c) => {
            if (c.id === commentId) {
              return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 };
            }
            return { ...c, replies: updateList(c.replies) };
          });
        return { ...p, comments: updateList(p.comments) };
      })
    );
  }

  const filteredPosts = posts
    .filter((p) => activeCategory === "All" || p.category === activeCategory)
    .filter((p) => {
      if (activeTab === "trending") return p.isTrending;
      if (activeTab === "unanswered") return p.type === "question" && !p.isAnswered;
      return true;
    })
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

  // ---- Events state ----
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);

  function toggleRSVP(eventId: number) {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const going = !e.going;
        showToast(going ? "You're going! Added to your calendar." : "RSVP removed.");
        return { ...e, going, attendees: going ? e.attendees + 1 : Math.max(0, e.attendees - 1) };
      })
    );
  }

  // ---- Top Books state ----
  const [bookScope, setBookScope] = useState<BookScope>("national");
  const [topBooks, setTopBooks] = useState<Record<BookScope, TopBookItem[]>>(TOP_BOOKS);

  function toggleBookBookmark(scope: BookScope, rank: number) {
    setTopBooks((prev) => ({
      ...prev,
      [scope]: prev[scope].map((b) => (b.rank === rank ? { ...b, bookmarked: !b.bookmarked } : b)),
    }));
    showToast("Saved to your reading list");
  }

  // ---- Chat state ----
  const [activeConversation, setActiveConversation] = useState<string>("general");
  const [messagesByConv, setMessagesByConv] = useState<Record<string, ChatMessageItem[]>>(SEED_MESSAGES);
  const [channelUnread, setChannelUnread] = useState<Record<string, number>>(
    Object.fromEntries(CHANNELS.map((c) => [c.id, c.unread]))
  );
  const [dmUnread, setDmUnread] = useState<Record<string, number>>(Object.fromEntries(DMS.map((d) => [d.id, d.unread])));
  const [messageInput, setMessageInput] = useState("");
  const [showMembers, setShowMembers] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState("");
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [pinnedDismissed, setPinnedDismissed] = useState<Record<string, boolean>>({});
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const activeChannelMeta = CHANNELS.find((c) => c.id === activeConversation);
  const activeDMMeta = DMS.find((d) => d.id === activeConversation);
  const currentMessages = messagesByConv[activeConversation] || [];

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentMessages.length, activeConversation, typingUser]);

  function selectConversation(id: string) {
    setActiveConversation(id);
    setChannelUnread((prev) => ({ ...prev, [id]: 0 }));
    setDmUnread((prev) => ({ ...prev, [id]: 0 }));
    setOpenThreadId(null);
  }

  function sendMessage() {
    const text = messageInput.trim();
    if (!text) return;
    const newMsg: ChatMessageItem = {
      id: `u-${Date.now()}`,
      author: "You",
      initials: "ME",
      avatarBg: "#4f46e5",
      content: text,
      time: "Just now",
      self: true,
      reactions: [],
      threadReplies: 0,
      attachment: null,
    };
    setMessagesByConv((prev) => ({ ...prev, [activeConversation]: [...(prev[activeConversation] || []), newMsg] }));
    setMessageInput("");

    const persona = CANNED_REPLIES[activeConversation];
    if (persona) {
      const convId = activeConversation;
      setTimeout(() => setTypingUser(persona.author), 1000);
      setTimeout(() => {
        setTypingUser(null);
        const line = persona.lines[Math.floor(Math.random() * persona.lines.length)];
        const reply: ChatMessageItem = {
          id: `r-${Date.now()}`,
          author: persona.author,
          initials: persona.initials,
          avatarBg: persona.avatarBg,
          content: line,
          time: "Just now",
          self: false,
          reactions: [],
          threadReplies: 0,
          attachment: null,
        };
        setMessagesByConv((prev) => ({ ...prev, [convId]: [...(prev[convId] || []), reply] }));
      }, 2400);
    }
  }

  function toggleMessageReaction(msgId: string, emoji: string) {
    setMessagesByConv((prev) => ({
      ...prev,
      [activeConversation]: (prev[activeConversation] || []).map((m) => {
        if (m.id !== msgId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: m.reactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted } : r
            ),
          };
        }
        return { ...m, reactions: [...m.reactions, { emoji, count: 1, reacted: true }] };
      }),
    }));
  }

  const pinnedText = PINNED_MESSAGE[activeConversation];
  const showPinnedBanner = pinnedText && !pinnedDismissed[activeConversation];

  // ---- Post composer state ----
  const [postType, setPostType] = useState<PostType>("discussion");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("Marketing");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState("3 days");
  const [showcaseImages, setShowcaseImages] = useState<string[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/,/g, "");
      if (clean && !tags.includes(clean) && tags.length < 6) setTags((prev) => [...prev, clean]);
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function wrapSelection(before: string, after: string = before) {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = postContent.slice(start, end) || "text";
    const newValue = postContent.slice(0, start) + before + selected + after + postContent.slice(end);
    setPostContent(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + selected.length;
    });
  }

  function insertListItem() {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const newValue = postContent.slice(0, start) + "\n- " + postContent.slice(start);
    setPostContent(newValue);
    requestAnimationFrame(() => el.focus());
  }

  function addPollOption() {
    if (pollOptions.length < 6) setPollOptions((prev) => [...prev, ""]);
  }

  function removePollOption(index: number) {
    if (pollOptions.length > 2) setPollOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePollOption(index: number, value: string) {
    setPollOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files)
      .slice(0, 3 - showcaseImages.length)
      .map((f) => URL.createObjectURL(f));
    setShowcaseImages((prev) => [...prev, ...urls].slice(0, 3));
    e.target.value = "";
  }

  function removeShowcaseImage(idx: number) {
    setShowcaseImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function resetPostForm() {
    setPostType("discussion");
    setPostTitle("");
    setPostContent("");
    setPostCategory("Marketing");
    setTags([]);
    setTagInput("");
    setPollOptions(["", ""]);
    setShowcaseImages([]);
  }

  function publishPost() {
    if (!postTitle.trim()) {
      showToast("Give your post a title first.");
      return;
    }
    const newPost: PostItem = {
      id: Date.now(),
      author: "You",
      authorInitials: "ME",
      avatarBg: "#4f46e5",
      role: "Author",
      timeAgo: "Just now",
      type: postType,
      category: postCategory,
      title: postTitle,
      content: postContent || "(No additional details provided.)",
      tags,
      reactions: [],
      comments: [],
      isTrending: false,
      isPinned: false,
      isAnswered: false,
      bookmarked: false,
      images: postType === "showcase" ? showcaseImages : [],
      poll:
        postType === "poll"
          ? {
            endsIn: pollDuration + " left",
            votedOptionId: null,
            options: pollOptions
              .filter((o) => o.trim())
              .map((label, i) => ({ id: `new-${i}`, label, votes: 0 })),
          }
          : undefined,
    };
    setPosts((prev) => [newPost, ...prev]);
    resetPostForm();
    showToast("Post published!");
    setCurrentView("feed");
  }

  // ---- Event composer state ----
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("Webinar");
  const [eventMode, setEventMode] = useState<EventMode>("online");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventCapacity, setEventCapacity] = useState("");
  const [unlimitedCapacity, setUnlimitedCapacity] = useState(true);
  const [eventRecurring, setEventRecurring] = useState<Recurring>("none");
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);

  const EVENT_TYPE_OPTIONS: { label: string; icon: any; color: string }[] = [
    { label: "Webinar", icon: Video, color: "#4facfe" },
    { label: "Workshop", icon: Palette, color: "#FFE66D" },
    { label: "Networking", icon: Users, color: "#fa709a" },
    { label: "AMA", icon: Zap, color: "#8b5cf6" },
    { label: "Writing Sprint", icon: Trophy, color: "#34d399" },
  ];

  function toggleHost(name: string) {
    setSelectedHosts((prev) => (prev.includes(name) ? prev.filter((h) => h !== name) : prev.length < 3 ? [...prev, name] : prev));
  }

  function resetEventForm() {
    setEventTitle("");
    setEventType("Webinar");
    setEventMode("online");
    setEventLocation("");
    setEventDate("");
    setEventTime("");
    setEventDescription("");
    setEventCapacity("");
    setUnlimitedCapacity(true);
    setEventRecurring("none");
    setSelectedHosts([]);
  }

  function publishEvent() {
    if (!eventTitle.trim()) {
      showToast("Give your event a title first.");
      return;
    }
    const typeMeta = EVENT_TYPE_OPTIONS.find((t) => t.label === eventType) || EVENT_TYPE_OPTIONS[0];
    const newEvent: EventItem = {
      id: Date.now(),
      title: eventTitle,
      date: eventDate || "Date TBD",
      time: eventTime || "Time TBD",
      type: eventType,
      icon: typeMeta.icon,
      color: typeMeta.color,
      mode: eventMode,
      location: eventLocation || (eventMode === "online" ? "Link shared after RSVP" : "Address shared after RSVP"),
      hosts: selectedHosts.length ? selectedHosts : ["You"],
      capacity: unlimitedCapacity ? null : Number(eventCapacity) || null,
      attendees: 1,
      recurring: eventRecurring,
      going: true,
      description: eventDescription || "No description provided yet.",
    };
    setEvents((prev) => [newEvent, ...prev]);
    resetEventForm();
    showToast("Event published!");
    setCurrentView("feed");
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10 h-full min-h-[calc(100vh-100px)] relative">
      {/* ── Toast ── */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
          }`}
      >
        <div className="bg-ink text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-[13px] font-bold">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMessage}
        </div>
      </div>

      {/* ========================================== */}
      {/* VIEW: MAIN FEED */}
      {/* ========================================== */}
      {currentView === "feed" && (
        <>
          {/* ── Hero Section ── */}
          <div className="bg-gradient-to-r from-ink to-ink/90 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-pink/20 rounded-full blur-3xl translate-y-1/2" />

            {/* Notification bell */}
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={toggleNotifPanel}
                className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors"
              >
                <Bell size={17} className="text-white" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-ink/5 overflow-hidden text-ink">
                  <div className="px-4 py-3 border-b border-ink/5">
                    <h4 className="text-[13px] font-extrabold">Notifications</h4>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`px-4 py-3 border-b border-ink/5 last:border-0 ${!n.read ? "bg-blue-50/60" : ""}`}>
                        <p className="text-[12px] font-semibold text-ink/80">{n.text}</p>
                        <p className="text-[10px] text-ink/40 mt-0.5">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full mb-4 border border-white/10">
                  <Users size={14} className="text-cyan-300" />
                  <span className="text-[11px] font-bold tracking-wide uppercase text-white/90">Author Community</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Connect, Learn & Grow</h1>
                <p className="text-[14px] text-white/80 max-w-lg leading-relaxed">
                  Join thousands of fellow authors. Share your journey, ask questions, and celebrate your milestones together.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0 mt-4 md:mt-0">
                <button
                  onClick={() => setCurrentView("chat")}
                  className="group flex items-center justify-center gap-2 bg-white text-indigo-700 px-6 py-3.5 rounded-full text-[14px] font-extrabold shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto"
                >
                  <MessageCircle size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  Chat Room
                </button>
                <button
                  onClick={() => setCurrentView("books")}
                  className="group flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3.5 rounded-full text-[14px] font-extrabold shadow-lg hover:bg-white/30 hover:scale-105 transition-all w-full sm:w-auto"
                >
                  <Trophy size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  Top Books
                </button>
                <button
                  onClick={() => setCurrentView("post")}
                  className="group flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3.5 rounded-full text-[14px] font-extrabold shadow-lg hover:bg-white/30 hover:scale-105 transition-all w-full sm:w-auto"
                >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                  Post
                </button>
                <button
                  onClick={() => setCurrentView("event")}
                  className="group flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3.5 rounded-full text-[14px] font-extrabold shadow-lg hover:bg-white/30 hover:scale-105 transition-all w-full sm:w-auto"
                >
                  <Calendar size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  Event
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left Column: Feed ── */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Filters & Search */}
              <div className="bg-panel rounded-2xl p-3 shadow-card flex flex-col gap-3 border border-ink/5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all shrink-0 ${activeTab === "all" ? "bg-ink text-white shadow-md" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                        }`}
                    >
                      Recent Posts
                    </button>
                    <button
                      onClick={() => setActiveTab("trending")}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all shrink-0 ${activeTab === "trending" ? "bg-ink text-white shadow-md" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                        }`}
                    >
                      <TrendingUp size={14} />
                      Trending
                    </button>
                    <button
                      onClick={() => setActiveTab("unanswered")}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all shrink-0 ${activeTab === "unanswered" ? "bg-ink text-white shadow-md" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                        }`}
                    >
                      <HelpCircle size={14} />
                      Unanswered
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search discussions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-ink/5 focus:bg-white focus:border-ink/20 border border-transparent rounded-xl py-2 pl-9 pr-4 text-[13px] font-medium text-ink outline-none transition-all"
                    />
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                  {FEED_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${activeCategory === cat
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-transparent text-ink/50 border-ink/10 hover:border-ink/20 hover:text-ink"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed List */}
              <div className="flex flex-col gap-4">
                {filteredPosts.length === 0 && (
                  <div className="bg-panel rounded-3xl p-10 text-center border border-ink/5 shadow-card">
                    <p className="text-[14px] font-bold text-ink/50">No posts match your filters yet.</p>
                    <p className="text-[12px] text-ink/40 mt-1">Try a different category or be the first to start this conversation.</p>
                  </div>
                )}

                {filteredPosts.map((post) => (
                  <div key={post.id} className="bg-panel rounded-3xl p-6 shadow-card border border-ink/5 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={post.authorInitials} bg={post.avatarBg} className="w-10 h-10 text-[13px]" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[14px] font-bold text-ink">{post.author}</h4>
                            {post.role === "Official" && (
                              <span className="bg-blue-500/10 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                Official
                              </span>
                            )}
                            {post.isPinned && (
                              <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-amber-400/15 text-amber-600">
                                <Pin size={9} /> Pinned
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-ink/50">
                            {post.role} • {post.timeAgo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TypeBadge type={post.type} />
                        {post.type === "question" && post.isAnswered && (
                          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider bg-emerald-500/10 text-emerald-600">
                            <CheckCircle2 size={11} /> Answered
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-[17px] font-extrabold text-ink mb-2 leading-tight group-hover:text-blue-600 transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                    <p className="text-[14px] text-ink/75 leading-relaxed mb-4">{post.content}</p>

                    {post.type === "showcase" && post.images.length > 0 && (
                      <div className="flex gap-3 mb-4">
                        {post.images.map((img, i) => (
                          <div
                            key={i}
                            className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 border border-ink/5"
                            style={{
                              background:
                                i % 2 === 0
                                  ? "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)"
                                  : "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
                            }}
                          >
                            <ImageIcon size={22} className="text-white/90" />
                          </div>
                        ))}
                      </div>
                    )}

                    {post.type === "poll" && post.poll && (
                      <div className="flex flex-col gap-2 mb-4">
                        {(() => {
                          const total = post.poll.options.reduce((sum, o) => sum + o.votes, 0) || 1;
                          return post.poll.options.map((opt) => {
                            const pct = Math.round((opt.votes / total) * 100);
                            const isVoted = post.poll!.votedOptionId === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => votePoll(post.id, opt.id)}
                                className="relative w-full text-left rounded-xl border border-ink/10 overflow-hidden hover:border-emerald-400/50 transition-colors"
                              >
                                <div
                                  className="absolute inset-y-0 left-0 bg-emerald-500/10 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                                <div className="relative flex items-center justify-between px-4 py-2.5">
                                  <span className="flex items-center gap-2 text-[13px] font-bold text-ink">
                                    {isVoted ? (
                                      <CheckCircle2 size={15} className="text-emerald-600" />
                                    ) : (
                                      <Circle size={15} className="text-ink/20" />
                                    )}
                                    {opt.label}
                                  </span>
                                  <span className="text-[12px] font-bold text-ink/50">{pct}%</span>
                                </div>
                              </button>
                            );
                          });
                        })()}
                        <p className="text-[11px] font-medium text-ink/40 mt-1">
                          {post.poll.options.reduce((s, o) => s + o.votes, 0)} votes • {post.poll.endsIn}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-ink/5 text-ink/60 text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-ink/10 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-ink/5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {post.reactions.map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => toggleReaction(post.id, r.emoji)}
                            className={`flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-lg border transition-colors ${r.reacted ? "bg-blue-500/10 border-blue-400/40 text-blue-600" : "border-ink/10 text-ink/50 hover:border-ink/20"
                              }`}
                          >
                            <span>{r.emoji}</span> {r.count}
                          </button>
                        ))}
                        {QUICK_EMOJIS.filter((e) => !post.reactions.some((r) => r.emoji === e)).length > 0 && (
                          <div className="relative group/add">
                            <button className="w-7 h-7 rounded-lg border border-dashed border-ink/15 text-ink/30 hover:text-ink/60 hover:border-ink/30 flex items-center justify-center text-[13px] transition-colors">
                              +
                            </button>
                            <div className="absolute bottom-full left-0 mb-1 hidden group-hover/add:flex bg-white shadow-lg border border-ink/10 rounded-xl p-1 gap-0.5 z-10">
                              {QUICK_EMOJIS.filter((e) => !post.reactions.some((r) => r.emoji === e)).map((e) => (
                                <button
                                  key={e}
                                  onClick={() => toggleReaction(post.id, e)}
                                  className="w-7 h-7 rounded-lg hover:bg-ink/5 flex items-center justify-center text-[14px]"
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                          className="flex items-center gap-1.5 text-ink/50 hover:text-blue-600 transition-colors text-[13px] font-bold ml-1"
                        >
                          <MessageCircle size={16} /> {post.comments.length}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleBookmark(post.id)}
                          className={`transition-colors ${post.bookmarked ? "text-amber-500" : "text-ink/40 hover:text-ink"}`}
                        >
                          <Bookmark size={16} fill={post.bookmarked ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => showToast("Link copied to clipboard")}
                          className="flex items-center gap-1.5 text-ink/40 hover:text-ink transition-colors text-[13px] font-bold"
                        >
                          <Share2 size={14} /> Share
                        </button>
                      </div>
                    </div>

                    {/* Expanded comments */}
                    {expandedPostId === post.id && (
                      <div className="mt-5 pt-5 border-t border-ink/5 flex flex-col gap-4">
                        {post.comments.map((c) => (
                          <div key={c.id} className="flex flex-col gap-2">
                            <div className="flex gap-3">
                              <Avatar initials={c.initials} bg={c.avatarBg} className="w-8 h-8 text-[11px]" />
                              <div className="flex-1">
                                <div className="bg-ink/[0.03] rounded-2xl rounded-tl-none px-4 py-2.5 inline-block max-w-full border border-ink/5">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[12.5px] font-bold text-ink">{c.author}</span>
                                    <span className="text-[10px] text-ink/40">{c.timeAgo}</span>
                                    {c.isBestAnswer && (
                                      <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 uppercase tracking-wider">
                                        <CheckCircle2 size={9} /> Best answer
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[13px] text-ink/75 leading-relaxed">{c.content}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-1 pl-1">
                                  <button
                                    onClick={() => toggleCommentLike(post.id, c.id)}
                                    className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${c.liked ? "text-blue-600" : "text-ink/40 hover:text-ink"
                                      }`}
                                  >
                                    <ThumbsUp size={12} /> {c.likes}
                                  </button>
                                  <button
                                    onClick={() => setOpenReplyBox((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                                    className="flex items-center gap-1 text-[11px] font-bold text-ink/40 hover:text-ink transition-colors"
                                  >
                                    <Reply size={12} /> Reply
                                  </button>
                                </div>

                                {/* Nested replies */}
                                {c.replies.length > 0 && (
                                  <div className="flex flex-col gap-2 mt-2 pl-4 border-l-2 border-ink/5">
                                    {c.replies.map((r) => (
                                      <div key={r.id} className="flex gap-2">
                                        <Avatar initials={r.initials} bg={r.avatarBg} className="w-6 h-6 text-[9px]" />
                                        <div className="bg-ink/[0.03] rounded-2xl rounded-tl-none px-3 py-2 border border-ink/5">
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[11.5px] font-bold text-ink">{r.author}</span>
                                            <span className="text-[9px] text-ink/40">{r.timeAgo}</span>
                                          </div>
                                          <p className="text-[12px] text-ink/75 leading-relaxed">{r.content}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {openReplyBox[c.id] && (
                                  <div className="flex items-center gap-2 mt-2 pl-1">
                                    <input
                                      type="text"
                                      placeholder={`Reply to ${c.author}...`}
                                      className="flex-1 bg-ink/5 rounded-lg px-3 py-1.5 text-[12px] outline-none focus:bg-white focus:border-ink/20 border border-transparent transition-all"
                                    />
                                    <button className="text-[11px] font-bold text-blue-600">Send</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center gap-3 pt-1">
                          <Avatar initials="ME" bg="#4f46e5" className="w-8 h-8 text-[11px]" />
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={replyDrafts[post.id] || ""}
                              onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                              placeholder="Write a comment..."
                              className="flex-1 bg-ink/5 focus:bg-white border border-transparent focus:border-ink/20 rounded-xl px-4 py-2 text-[13px] outline-none transition-all"
                            />
                            <button
                              onClick={() => addComment(post.id)}
                              className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
                            >
                              <Send size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Column: Sidebar Widgets ── */}
            <div className="flex flex-col gap-6">
              {/* Top Books teaser */}
              <div className="bg-panel rounded-3xl shadow-card border border-ink/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] font-extrabold text-ink flex items-center gap-2">
                      <Trophy size={16} className="text-amber-500" /> Bestsellers
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 mb-5">
                    {TOP_BOOKS.national.slice(0, 3).map((b) => (
                      <div key={b.rank} className="group flex items-center gap-3 bg-ink/[0.02] hover:bg-white p-3 rounded-2xl border border-transparent hover:border-ink/5 hover:shadow-sm transition-all cursor-pointer">
                        <div
                          className="w-10 h-14 rounded-xl shrink-0 flex items-end justify-center pb-1 text-white text-[11px] font-black shadow-inner relative overflow-hidden"
                          style={{ background: b.coverGradient }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <span className="relative z-10">#{b.rank}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-bold text-ink truncate group-hover:text-amber-600 transition-colors">{b.title}</h4>
                          <p className="text-[11px] font-medium text-ink/50 truncate mb-1">{b.author}</p>
                          <TrendBadge trend={b.trend} trendValue={b.trendValue} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentView("books")}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-[13px] font-bold py-3.5 rounded-xl transition-all"
                  >
                    View Global Rankings <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-panel rounded-3xl p-6 shadow-card border border-ink/5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[14px] font-extrabold text-ink">Upcoming Events</h3>
                  <Calendar size={16} className="text-ink/40" />
                </div>
                <div className="flex flex-col gap-4">
                  {events.slice(0, 4).map((event) => {
                    const EventIcon = event.icon;
                    return (
                      <div key={event.id} className="flex gap-4 group">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `${event.color}15`,
                            color: event.color === "#FFE66D" ? "#B39E00" : event.color,
                          }}
                        >
                          <EventIcon size={20} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="text-[13px] font-bold text-ink truncate group-hover:text-blue-600 transition-colors cursor-pointer">
                            {event.title}
                          </h4>
                          <p className="text-[11px] font-medium text-ink/50 mt-0.5">
                            {event.date} • {event.time}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleRSVP(event.id)}
                          className={`shrink-0 self-center text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${event.going ? "bg-emerald-500/10 text-emerald-600" : "bg-ink/5 text-ink/50 hover:bg-ink/10"
                            }`}
                        >
                          {event.going ? "Going ✓" : "RSVP"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Contributors */}
              <div className="bg-gradient-to-br from-indigo-50 to-pink-50 rounded-3xl p-6 shadow-card border border-ink/5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[14px] font-extrabold text-ink">Top Contributors</h3>
                  <Award size={16} className="text-pink/60" />
                </div>
                <div className="flex flex-col gap-3">
                  {TOP_CONTRIBUTORS.map((user, idx) => (
                    <div key={user.name} className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-6 text-center text-[12px] font-black text-ink/30">#{idx + 1}</div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-200 to-pink-200 flex items-center justify-center text-[10px] font-bold text-ink shrink-0">
                        {user.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[12px] font-bold text-ink truncate">{user.name}</h4>
                        <p className="text-[10px] font-medium text-ink/50">{user.score} pts</p>
                      </div>
                      <div className="px-2 py-1 bg-ink/5 rounded-md text-[9px] font-bold text-ink/60 uppercase tracking-wider">{user.badge}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-panel rounded-3xl p-6 shadow-card border border-ink/5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[14px] font-extrabold text-ink">Categories</h3>
                  <Hash size={16} className="text-ink/40" />
                </div>
                <div className="flex flex-col gap-1">
                  {FEED_CATEGORIES.filter((c) => c !== "All").map((cat) => {
                    const count = posts.filter((p) => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setActiveTab("all");
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-bold transition-colors ${activeCategory === cat ? "bg-ink text-white" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                          }`}
                      >
                        {cat}
                        <span className={`text-[11px] ${activeCategory === cat ? "text-white/60" : "text-ink/30"}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================== */}
      {/* VIEW: TOP BOOKS */}
      {/* ========================================== */}
      {currentView === "books" && (
        <div className="flex-1 flex flex-col bg-panel rounded-3xl shadow-card border border-ink/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-8 py-10 flex flex-col md:flex-row md:items-center justify-between text-white shrink-0 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-10 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-20 w-48 h-48 bg-yellow-300/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={() => setCurrentView("feed")}
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full mb-3 border border-white/20 shadow-sm">
                  <Trophy size={14} className="text-yellow-200" />
                  <span className="text-[11px] font-bold tracking-wide uppercase text-white">Bestsellers List</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white drop-shadow-sm">
                  Top Books
                </h2>
                <p className="text-[14px] font-medium text-white/90 max-w-md">
                  {BOOK_SCOPE_META[bookScope].description}
                </p>
              </div>
            </div>
          </div>

          {/* Scope tabs */}
          <div className="bg-white px-6 py-4 border-b border-ink/5 shrink-0 z-10 relative">
            <div className="flex items-center gap-3 max-w-2xl">
              {(Object.keys(BOOK_SCOPE_META) as BookScope[]).map((scope) => {
                const meta = BOOK_SCOPE_META[scope];
                const Icon = meta.icon;
                const active = bookScope === scope;
                return (
                  <button
                    key={scope}
                    onClick={() => setBookScope(scope)}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[14px] font-bold transition-all ${active ? "bg-ink text-white shadow-md scale-105" : "bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink"
                      }`}
                  >
                    <Icon size={16} /> {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rankings list */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-ink/[0.01]">
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
              {topBooks[bookScope].map((book) => (
                <div
                  key={book.rank}
                  className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-ink/5 flex flex-col sm:flex-row sm:items-center gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-[16px] font-black shadow-sm ${book.rank <= 3 ? "text-white" : "bg-ink/5 text-ink/40"
                        }`}
                      style={book.rank <= 3 ? { background: book.rank === 1 ? "linear-gradient(135deg, #f59e0b, #fbbf24)" : book.rank === 2 ? "linear-gradient(135deg, #94a3b8, #cbd5e1)" : "linear-gradient(135deg, #b45309, #d97706)" } : undefined}
                    >
                      {book.rank}
                    </div>

                    <div
                      className="w-20 h-28 rounded-2xl shrink-0 flex items-center justify-center shadow-md relative overflow-hidden group-hover:shadow-xl group-hover:scale-105 transition-all duration-300"
                      style={{ background: book.coverGradient }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <BookOpen size={24} className="text-white/90 relative z-10" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-[18px] font-extrabold text-ink truncate group-hover:text-amber-600 transition-colors">{book.title}</h4>
                      {book.rank === 1 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm">
                          <Crown size={12} /> #1 Bestseller
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] font-bold text-ink/60 mb-2">
                      {book.author}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-ink/5 text-ink/50 uppercase tracking-wider">
                      {book.category}
                    </span>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-ink/5 gap-3">
                    <div className="flex flex-col sm:items-end gap-1">
                      <span className="text-[16px] font-extrabold text-ink">{book.metric}</span>
                      <TrendBadge trend={book.trend} trendValue={book.trendValue} />
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBookBookmark(bookScope, book.rank); }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${book.bookmarked ? "bg-amber-50 text-amber-500" : "bg-ink/5 text-ink/30 hover:bg-ink/10 hover:text-ink"}`}
                    >
                      <Bookmark size={18} fill={book.bookmarked ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VIEW: COMMUNITY CHAT */}
      {/* ========================================== */}
      {currentView === "chat" && (
        <div className="flex-1 flex flex-col bg-panel rounded-3xl shadow-card border border-ink/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView("feed")}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-[20px] font-extrabold flex items-center gap-2">
                  {activeDMMeta ? (
                    <>
                      <Avatar initials={activeDMMeta.initials} bg={activeDMMeta.avatarBg} className="w-7 h-7 text-[11px]" />
                      {activeDMMeta.name}
                    </>
                  ) : (
                    <>
                      <Hash size={20} className="text-cyan-300" /> {activeChannelMeta?.name}
                    </>
                  )}
                </h2>
                <p className="text-[12px] font-medium text-white/70 flex items-center gap-1">
                  {activeDMMeta ? (
                    <>
                      <span className={`w-2 h-2 rounded-full ${activeDMMeta.online ? "bg-green-400" : "bg-white/30"}`} />
                      {activeDMMeta.online ? "Online" : "Offline"}
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-400" /> 1,204 members ({ONLINE_MEMBERS.length} online)
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search chat..."
                  className="bg-white/10 border border-white/20 rounded-full py-2 pl-9 pr-4 text-[13px] text-white placeholder:text-white/50 outline-none focus:bg-white/20 focus:border-white/40 transition-all w-48"
                />
              </div>
              <button
                onClick={() => setShowMembers((v) => !v)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showMembers ? "bg-white/30" : "bg-white/10 hover:bg-white/20"
                  }`}
              >
                <Users size={18} />
              </button>
            </div>
          </div>

          {showPinnedBanner && (
            <div className="bg-amber-400/10 border-b border-amber-400/20 px-6 py-2 flex items-center justify-between gap-3 shrink-0">
              <p className="text-[12px] font-semibold text-amber-700 flex items-center gap-2">
                <Pin size={13} /> {pinnedText}
              </p>
              <button
                onClick={() => setPinnedDismissed((prev) => ({ ...prev, [activeConversation]: true }))}
                className="text-amber-700/60 hover:text-amber-700"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Channels */}
            <div className="hidden md:flex flex-col w-64 bg-ink/[0.02] border-r border-ink/5 overflow-y-auto">
              <div className="p-4">
                <p className="text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-2">Channels</p>
                <div className="flex flex-col gap-1">
                  {CHANNELS.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => selectConversation(ch.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold text-[13px] transition-colors ${activeConversation === ch.id
                        ? "bg-white text-indigo-700 shadow-sm border border-ink/5"
                        : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                        }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Hash size={16} className="shrink-0" /> {ch.name}
                      </span>
                      {channelUnread[ch.id] > 0 && (
                        <span className="bg-pink text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {channelUnread[ch.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 pt-0">
                <p className="text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-2">Direct Messages</p>
                <div className="flex flex-col gap-1">
                  {DMS.map((dm) => (
                    <button
                      key={dm.id}
                      onClick={() => selectConversation(dm.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${activeConversation === dm.id ? "bg-white shadow-sm border border-ink/5" : "hover:bg-ink/5"
                        }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar initials={dm.initials} bg={dm.avatarBg} className="w-7 h-7 text-[10px]" />
                        {dm.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[12.5px] font-bold text-ink truncate">{dm.name}</p>
                        <p className="text-[10.5px] text-ink/40 truncate">{dm.lastMessage}</p>
                      </div>
                      {dmUnread[dm.id] > 0 && (
                        <span className="bg-pink text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {dmUnread[dm.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
              <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
                <div className="text-center my-4">
                  <span className="bg-ink/5 text-ink/40 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Today, July 14</span>
                </div>

                {currentMessages.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                    <Hash size={28} className="text-ink/15 mb-2" />
                    <p className="text-[13px] font-bold text-ink/40">No messages yet</p>
                    <p className="text-[12px] text-ink/30">Be the first to say something here.</p>
                  </div>
                )}

                {currentMessages
                  .filter((m) => !chatSearch || m.content.toLowerCase().includes(chatSearch.toLowerCase()))
                  .map((msg) => (
                    <div key={msg.id} className={`flex gap-4 group ${msg.self ? "flex-row-reverse" : ""}`}>
                      <Avatar initials={msg.initials} bg={msg.avatarBg} className="w-10 h-10 text-[13px]" />
                      <div className={`flex-1 flex flex-col ${msg.self ? "items-end" : ""}`}>
                        <div className={`flex items-baseline gap-2 mb-1 ${msg.self ? "flex-row-reverse" : ""}`}>
                          <span className="text-[14px] font-bold text-ink">{msg.self ? "You" : msg.author}</span>
                          <span className="text-[11px] font-medium text-ink/40">{msg.time}</span>
                        </div>
                        <div
                          className={`relative p-3 rounded-2xl inline-block max-w-[85%] border ${msg.self ? "bg-indigo-600 text-white border-transparent rounded-tr-none" : "bg-ink/[0.03] border-ink/5 rounded-tl-none"
                            }`}
                        >
                          <p className={`text-[14px] leading-relaxed ${msg.self ? "text-white" : "text-ink/80"}`}>{msg.content}</p>

                          {msg.attachment && (
                            <div
                              className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold ${msg.self ? "bg-white/15 text-white" : "bg-white border border-ink/10 text-ink/70"
                                }`}
                            >
                              {msg.attachment.type === "image" ? <ImageIcon size={14} /> : <Paperclip size={14} />}
                              {msg.attachment.name}
                            </div>
                          )}

                          {/* hover quick-reactions */}
                          <div
                            className={`absolute -top-3 ${msg.self ? "left-0 -translate-x-1/4" : "right-0 translate-x-1/4"
                              } hidden group-hover:flex bg-white shadow-md border border-ink/10 rounded-full px-1 py-0.5 gap-0.5`}
                          >
                            {QUICK_EMOJIS.map((e) => (
                              <button
                                key={e}
                                onClick={() => toggleMessageReaction(msg.id, e)}
                                className="w-6 h-6 rounded-full hover:bg-ink/5 flex items-center justify-center text-[12px]"
                              >
                                {e}
                              </button>
                            ))}
                          </div>
                        </div>

                        {msg.reactions.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {msg.reactions.map((r) => (
                              <button
                                key={r.emoji}
                                onClick={() => toggleMessageReaction(msg.id, r.emoji)}
                                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${r.reacted ? "bg-blue-500/10 border-blue-400/40 text-blue-600" : "border-ink/10 text-ink/50 hover:border-ink/20"
                                  }`}
                              >
                                {r.emoji} {r.count}
                              </button>
                            ))}
                          </div>
                        )}

                        {msg.threadReplies > 0 && (
                          <button
                            onClick={() => setOpenThreadId(openThreadId === msg.id ? null : msg.id)}
                            className="flex items-center gap-1.5 mt-1.5 text-[11.5px] font-bold text-blue-600 hover:text-blue-700"
                          >
                            <Reply size={12} /> {msg.threadReplies} replies
                          </button>
                        )}

                        {openThreadId === msg.id && (
                          <div className="mt-2 pl-4 border-l-2 border-ink/5 flex flex-col gap-2 max-w-[85%]">
                            <div className="bg-ink/[0.03] rounded-xl px-3 py-2 border border-ink/5">
                              <p className="text-[11.5px] font-bold text-ink">Sarah Jenkins</p>
                              <p className="text-[12px] text-ink/70">Same, curious about this too!</p>
                            </div>
                            <div className="bg-ink/[0.03] rounded-xl px-3 py-2 border border-ink/5">
                              <p className="text-[11.5px] font-bold text-ink">David Chen</p>
                              <p className="text-[12px] text-ink/70">Following — let us know how it goes.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {typingUser && (
                  <div className="flex items-center gap-2 pl-14 -mt-2">
                    <span className="text-[12px] font-medium text-ink/40 italic">{typingUser} is typing</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-ink/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-1 rounded-full bg-ink/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-1 rounded-full bg-ink/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-ink/[0.02] border-t border-ink/5">
                <div className="bg-white rounded-2xl border border-ink/10 shadow-sm flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-ink/5 bg-ink/[0.01]">
                    <button className="p-1.5 text-ink/40 hover:text-ink/80 hover:bg-ink/5 rounded-lg transition-colors">
                      <Bold size={14} />
                    </button>
                    <button className="p-1.5 text-ink/40 hover:text-ink/80 hover:bg-ink/5 rounded-lg transition-colors">
                      <Italic size={14} />
                    </button>
                    <button className="p-1.5 text-ink/40 hover:text-ink/80 hover:bg-ink/5 rounded-lg transition-colors">
                      <List size={14} />
                    </button>
                    <div className="w-px h-4 bg-ink/10 mx-1" />
                    <button className="p-1.5 text-ink/40 hover:text-ink/80 hover:bg-ink/5 rounded-lg transition-colors">
                      <Paperclip size={14} />
                    </button>
                  </div>
                  <div className="flex items-end gap-2 p-2">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={`Message ${activeDMMeta ? activeDMMeta.name : "#" + activeChannelMeta?.name}...`}
                      className="flex-1 bg-transparent px-3 py-2 text-[14px] outline-none text-ink placeholder:text-ink/40 resize-none max-h-32"
                      rows={2}
                    />
                    <div className="flex items-center gap-2 pb-1 pr-1">
                      <button className="p-2 text-ink/40 hover:text-ink/80 hover:bg-ink/5 rounded-xl transition-colors">
                        <Smile size={18} />
                      </button>
                      <button
                        onClick={sendMessage}
                        className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Sidebar */}
            {showMembers && !activeDMMeta && (
              <div className="hidden lg:flex flex-col w-56 bg-ink/[0.02] border-l border-ink/5 overflow-y-auto p-4">
                <p className="text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-2">Online — {ONLINE_MEMBERS.length}</p>
                <div className="flex flex-col gap-2 mb-5">
                  {ONLINE_MEMBERS.map((m) => (
                    <div key={m.name} className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar initials={m.initials} bg={m.avatarBg} className="w-7 h-7 text-[10px]" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
                      </div>
                      <span className="text-[12.5px] font-bold text-ink truncate">{m.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-2">Offline — {OFFLINE_MEMBERS.length}</p>
                <div className="flex flex-col gap-2">
                  {OFFLINE_MEMBERS.map((m) => (
                    <div key={m.name} className="flex items-center gap-2 opacity-50">
                      <Avatar initials={m.initials} bg={m.avatarBg} className="w-7 h-7 text-[10px]" />
                      <span className="text-[12.5px] font-bold text-ink truncate">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VIEW: ADD POST */}
      {/* ========================================== */}
      {currentView === "post" && (
        <div className="flex-1 flex flex-col bg-panel rounded-3xl shadow-card border border-ink/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-ink/5 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView("feed")}
                className="w-10 h-10 rounded-full bg-ink/5 hover:bg-ink/10 flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-[20px] font-extrabold text-ink">Create New Discussion</h2>
                <p className="text-[13px] text-ink/50">Share your thoughts with the community</p>
              </div>
            </div>
            <button
              onClick={publishPost}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-[13px] font-bold shadow-lg hover:bg-indigo-700 transition-all"
            >
              Publish Post
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-ink/[0.01]">
            {/* Editor Area */}
            <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto border-r border-ink/5 custom-scrollbar">
              <div className="flex flex-col gap-8 max-w-xl mx-auto">
                {/* Post type selector */}
                <div>
                  <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-3 block">Post Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(POST_TYPE_META) as PostType[]).map((t) => {
                      const meta = POST_TYPE_META[t];
                      const Icon = meta.icon;
                      const active = postType === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setPostType(t)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${active ? "border-current shadow-sm" : "border-ink/10 hover:border-ink/20"
                            }`}
                          style={active ? { color: meta.color, backgroundColor: `${meta.color}0d` } : undefined}
                        >
                          <Icon size={18} className={active ? "" : "text-ink/40"} />
                          <span className={`text-[11px] font-bold ${active ? "" : "text-ink/50"}`}>{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-3 block">
                    {postType === "question" ? "Your Question" : postType === "poll" ? "Poll Question" : "Discussion Title"}
                  </label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="E.g. What's your editing process like?"
                    className="w-full bg-white border border-ink/10 rounded-2xl px-5 py-4 text-[18px] font-bold text-ink outline-none placeholder:text-ink/30 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-3 block">Category</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-[14px] font-bold text-ink outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                  >
                    {FEED_CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {postType === "poll" ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider block">Poll Options</label>
                      <select
                        value={pollDuration}
                        onChange={(e) => setPollDuration(e.target.value)}
                        className="bg-white border border-ink/10 rounded-lg px-2 py-1 text-[11px] font-bold text-ink/60 outline-none"
                      >
                        <option>1 day</option>
                        <option>3 days</option>
                        <option>1 week</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      {pollOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updatePollOption(i, e.target.value)}
                            placeholder={`Option ${i + 1}`}
                            className="flex-1 bg-white border border-ink/10 rounded-xl px-4 py-2.5 text-[13px] font-medium text-ink outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                          />
                          {pollOptions.length > 2 && (
                            <button onClick={() => removePollOption(i)} className="text-ink/30 hover:text-red-500 transition-colors">
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 6 && (
                        <button
                          onClick={addPollOption}
                          className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-700 mt-1 self-start"
                        >
                          <Plus size={14} /> Add option
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider block">Content</label>
                      <div className="flex gap-1">
                        <button onClick={() => wrapSelection("**")} className="w-8 h-8 rounded-lg hover:bg-ink/5 flex items-center justify-center text-ink/50">
                          <Bold size={14} />
                        </button>
                        <button onClick={() => wrapSelection("*")} className="w-8 h-8 rounded-lg hover:bg-ink/5 flex items-center justify-center text-ink/50">
                          <Italic size={14} />
                        </button>
                        <button onClick={insertListItem} className="w-8 h-8 rounded-lg hover:bg-ink/5 flex items-center justify-center text-ink/50">
                          <List size={14} />
                        </button>
                        <button className="w-8 h-8 rounded-lg hover:bg-ink/5 flex items-center justify-center text-ink/50">
                          <Type size={14} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      ref={contentRef}
                      rows={postType === "showcase" ? 6 : 12}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder={
                        postType === "question" ? "Describe your question in detail..." : "Write your post here..."
                      }
                      className="w-full bg-white border border-ink/10 rounded-2xl px-5 py-4 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink/30 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm resize-none custom-scrollbar"
                    />
                  </div>
                )}

                {postType === "showcase" && (
                  <div>
                    <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-3 block">Images (up to 3)</label>
                    <div className="flex flex-wrap gap-3">
                      {showcaseImages.map((src, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-ink/10 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`upload-${i}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeShowcaseImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                      {showcaseImages.length < 3 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-24 h-24 rounded-2xl border-2 border-dashed border-ink/15 hover:border-ink/30 flex flex-col items-center justify-center gap-1 text-ink/30 hover:text-ink/50 transition-colors"
                        >
                          <Upload size={18} />
                          <span className="text-[10px] font-bold">Upload</span>
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-3 block">Add Tags</label>
                  <div className="w-full bg-white border border-ink/10 rounded-xl px-3 py-2.5 flex items-center flex-wrap gap-2 shadow-sm focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                    {tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 bg-ink/5 text-ink/70 text-[12px] font-bold px-2.5 py-1 rounded-lg">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="text-ink/40 hover:text-red-500">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder={tags.length === 0 ? "marketing, editing, advice..." : ""}
                      className="flex-1 min-w-[100px] bg-transparent outline-none text-[13px] text-ink placeholder:text-ink/30 py-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto bg-white custom-scrollbar hidden md:block">
              <p className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-6 text-center">Live Preview</p>

              <div className="bg-panel rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-ink/5 mx-auto max-w-lg pointer-events-none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials="ME" bg="#4f46e5" className="w-10 h-10 text-[13px]" />
                    <div>
                      <h4 className="text-[14px] font-bold text-ink">You</h4>
                      <p className="text-[11px] font-medium text-ink/50">Author • Just now</p>
                    </div>
                  </div>
                  <TypeBadge type={postType} />
                </div>

                <h3 className="text-[18px] font-extrabold text-ink mb-3 leading-tight break-words">
                  {postTitle || "Your Discussion Title Will Appear Here"}
                </h3>

                {postType !== "poll" && (
                  <p className="text-[14px] text-ink/75 leading-relaxed mb-4 whitespace-pre-wrap break-words">
                    {postContent || "Start typing in the editor to see your content preview..."}
                  </p>
                )}

                {postType === "showcase" && showcaseImages.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {showcaseImages.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" className="w-16 h-16 rounded-xl object-cover border border-ink/10" />
                    ))}
                  </div>
                )}

                {postType === "poll" && (
                  <div className="flex flex-col gap-2 mb-4">
                    {pollOptions.filter((o) => o.trim()).length === 0 && (
                      <p className="text-[13px] text-ink/40 italic">Add poll options to preview them here.</p>
                    )}
                    {pollOptions
                      .filter((o) => o.trim())
                      .map((opt, i) => (
                        <div key={i} className="rounded-xl border border-ink/10 px-4 py-2.5 flex items-center justify-between">
                          <span className="text-[13px] font-bold text-ink">{opt}</span>
                          <span className="text-[12px] font-bold text-ink/30">0%</span>
                        </div>
                      ))}
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                    {tags.map((tag) => (
                      <span key={tag} className="bg-ink/5 text-ink/60 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-ink/5">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-ink/30 text-[13px] font-bold">
                      <ThumbsUp size={16} /> 0
                    </span>
                    <span className="flex items-center gap-1.5 text-ink/30 text-[13px] font-bold">
                      <MessageCircle size={16} /> 0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VIEW: ADD EVENT */}
      {/* ========================================== */}
      {currentView === "event" && (
        <div className="flex-1 flex flex-col bg-panel rounded-3xl shadow-card border border-ink/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-ink/5 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView("feed")}
                className="w-10 h-10 rounded-full bg-ink/5 hover:bg-ink/10 flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-[20px] font-extrabold text-ink">Host a Community Event</h2>
                <p className="text-[13px] text-ink/50">Schedule a meetup, webinar, or writing sprint</p>
              </div>
            </div>
            <button
              onClick={publishEvent}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-[13px] font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Calendar size={16} /> Publish Event
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-ink/[0.01]">
            <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
              <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
                {/* Event Cover / Banner */}
                <div
                  className="rounded-3xl h-48 sm:h-56 relative flex items-center justify-center group overflow-hidden shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${EVENT_TYPE_OPTIONS.find((t) => t.label === eventType)?.color || "#4facfe"
                      } 0%, #ff9966 100%)`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  <button className="relative z-10 bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-white/30 hover:scale-105 transition-all">
                    <ImageIcon size={16} /> Upload Event Banner
                  </button>
                </div>

                {/* Event type */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-ink/5">
                  <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-3 block">Event Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EVENT_TYPE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const active = eventType === opt.label;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => setEventType(opt.label)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${active ? "border-current shadow-sm" : "border-ink/10 hover:border-ink/20"
                            }`}
                          style={active ? { color: opt.color === "#FFE66D" ? "#B39E00" : opt.color, backgroundColor: `${opt.color}0d` } : undefined}
                        >
                          <Icon size={16} className={active ? "" : "text-ink/40"} />
                          <span className={`text-[12px] font-bold ${active ? "" : "text-ink/50"}`}>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-ink/5">
                  <h3 className="text-[16px] font-extrabold text-ink mb-6 border-b border-ink/5 pb-4">Event Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-2 block">Event Title</label>
                      <input
                        type="text"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="E.g. Weekend Writing Sprint"
                        className="w-full bg-ink/[0.03] border border-ink/10 rounded-xl px-4 py-3 text-[15px] font-bold text-ink outline-none focus:border-indigo-500/50 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <Clock size={14} /> Date
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-ink/[0.03] border border-ink/10 rounded-xl px-4 py-3 text-[14px] text-ink outline-none focus:border-indigo-500/50 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <Clock size={14} /> Time
                      </label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full bg-ink/[0.03] border border-ink/10 rounded-xl px-4 py-3 text-[14px] text-ink outline-none focus:border-indigo-500/50 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-2 block">Format</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEventMode("online")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-bold text-[13px] transition-all ${eventMode === "online" ? "border-indigo-500 bg-indigo-500/5 text-indigo-600" : "border-ink/10 text-ink/50 hover:border-ink/20"
                            }`}
                        >
                          <Globe size={15} /> Online
                        </button>
                        <button
                          onClick={() => setEventMode("in-person")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-bold text-[13px] transition-all ${eventMode === "in-person" ? "border-indigo-500 bg-indigo-500/5 text-indigo-600" : "border-ink/10 text-ink/50 hover:border-ink/20"
                            }`}
                        >
                          <Building2 size={15} /> In-Person
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <MapPin size={14} /> {eventMode === "online" ? "Meeting Link" : "Venue Address"}
                      </label>
                      <div className="relative">
                        <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
                        <input
                          type="text"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          placeholder={eventMode === "online" ? "Zoom link, Discord invite, etc." : "Street address or venue name"}
                          className="w-full bg-ink/[0.03] border border-ink/10 rounded-xl py-3 pl-10 pr-4 text-[14px] text-ink outline-none focus:border-indigo-500/50 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-2 block">Capacity</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={eventCapacity}
                          disabled={unlimitedCapacity}
                          onChange={(e) => setEventCapacity(e.target.value)}
                          placeholder="e.g. 100"
                          className="flex-1 bg-ink/[0.03] border border-ink/10 rounded-xl px-4 py-3 text-[14px] text-ink outline-none focus:border-indigo-500/50 focus:bg-white transition-all disabled:opacity-40"
                        />
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-ink/50 whitespace-nowrap">
                          <input type="checkbox" checked={unlimitedCapacity} onChange={(e) => setUnlimitedCapacity(e.target.checked)} />
                          Unlimited
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <Repeat size={14} /> Recurring
                      </label>
                      <select
                        value={eventRecurring}
                        onChange={(e) => setEventRecurring(e.target.value as Recurring)}
                        className="w-full bg-ink/[0.03] border border-ink/10 rounded-xl px-4 py-3 text-[14px] text-ink outline-none focus:border-indigo-500/50 focus:bg-white transition-all"
                      >
                        <option value="none">Does not repeat</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-2 block">Hosts (up to 3)</label>
                      <div className="flex flex-wrap gap-2">
                        {HOST_OPTIONS.map((h) => {
                          const active = selectedHosts.includes(h.name);
                          return (
                            <button
                              key={h.name}
                              onClick={() => toggleHost(h.name)}
                              className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border-2 transition-all ${active ? "border-indigo-500 bg-indigo-500/5" : "border-ink/10 hover:border-ink/20"
                                }`}
                            >
                              <Avatar initials={h.initials} bg={h.avatarBg} className="w-6 h-6 text-[9px]" />
                              <span className={`text-[12px] font-bold ${active ? "text-indigo-600" : "text-ink/60"}`}>{h.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="md:col-span-2 mt-2">
                      <label className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-2 block">Description</label>
                      <textarea
                        rows={4}
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        placeholder="What is this event about?"
                        className="w-full bg-ink/[0.03] border border-ink/10 rounded-xl px-4 py-3 text-[14px] text-ink outline-none focus:border-indigo-500/50 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div className="w-full lg:w-96 shrink-0 p-6 md:p-10 border-t lg:border-t-0 lg:border-l border-ink/5 overflow-y-auto bg-white custom-scrollbar">
              <p className="text-[12px] font-bold text-ink/40 uppercase tracking-wider mb-6 text-center">Live Preview</p>
              <div className="bg-panel rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-ink/5 pointer-events-none">
                <div className="flex gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${EVENT_TYPE_OPTIONS.find((t) => t.label === eventType)?.color || "#4facfe"}15`,
                      color:
                        EVENT_TYPE_OPTIONS.find((t) => t.label === eventType)?.color === "#FFE66D"
                          ? "#B39E00"
                          : EVENT_TYPE_OPTIONS.find((t) => t.label === eventType)?.color,
                    }}
                  >
                    {(() => {
                      const Icon = EVENT_TYPE_OPTIONS.find((t) => t.label === eventType)?.icon || Video;
                      return <Icon size={22} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-extrabold text-ink truncate">{eventTitle || "Your Event Title"}</h4>
                    <p className="text-[11px] font-medium text-ink/50 mt-0.5">
                      {eventDate || "Date TBD"} • {eventTime || "Time TBD"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink/60 mb-2">
                  {eventMode === "online" ? <Globe size={13} /> : <Building2 size={13} />}
                  {eventLocation || (eventMode === "online" ? "Link shared after RSVP" : "Address shared after RSVP")}
                </div>
                {eventRecurring !== "none" && (
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink/60 mb-2">
                    <Repeat size={13} /> Repeats {eventRecurring}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink/60 mb-4">
                  <Users size={13} /> {unlimitedCapacity ? "Unlimited capacity" : `${eventCapacity || 0} spots`}
                </div>
                {selectedHosts.length > 0 && (
                  <div className="flex -space-x-2 mb-4">
                    {selectedHosts.map((name) => {
                      const h = HOST_OPTIONS.find((o) => o.name === name);
                      if (!h) return null;
                      return <Avatar key={name} initials={h.initials} bg={h.avatarBg} className="w-7 h-7 text-[10px] border-2 border-white" />;
                    })}
                  </div>
                )}
                <p className="text-[13px] text-ink/70 leading-relaxed whitespace-pre-wrap break-words">
                  {eventDescription || "Your event description will appear here."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
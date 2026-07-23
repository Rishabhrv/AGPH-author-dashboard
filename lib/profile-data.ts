// lib/profile-data.ts

export interface AuthorBook {
  title: string;
  coverGradient: string;
  publishedDate: string;
  rating: number;
  reviews: number;
}

export interface SocialLink {
  platform: string;
  url: string;
  handle: string;
}

export interface AuthorProfile {
  // Public
  authorName: string;
  bio: string;
  profileImageUrl: string | null;
  memberSince: string;
  totalBooks: number;
  socials: SocialLink[];
  books: AuthorBook[];

  // Private
  legalName: string;
  email: string;
  phone: string;
  address: string;
  
  // Payout / Tax
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  panNumberMasked: string;
  tdsRate: number;
  gstin: string | null;
}

export const DUMMY_AUTHOR_PROFILE: AuthorProfile = {
  authorName: "Priyanshu",
  bio: "Bestselling author exploring the rich tapestries of Indian history and modern society. When I'm not writing, I'm usually traveling across the country looking for the next great story.",
  profileImageUrl: null,
  memberSince: "January 2023",
  totalBooks: 9,
  socials: [
    { platform: "Twitter", url: "https://twitter.com/priyanshu_writes", handle: "@priyanshu_writes" },
    { platform: "Instagram", url: "https://instagram.com/priyanshu.author", handle: "@priyanshu.author" },
    { platform: "Website", url: "https://priyanshu.com", handle: "priyanshu.com" }
  ],
  books: [
    {
      title: "The Silent Orchard",
      coverGradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      publishedDate: "12 Oct 2023",
      rating: 4.8,
      reviews: 142
    },
    {
      title: "Beyond the Ganges",
      coverGradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
      publishedDate: "05 Mar 2023",
      rating: 4.5,
      reviews: 89
    },
    {
      title: "Whispers of Malwa",
      coverGradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      publishedDate: "18 Nov 2022",
      rating: 4.9,
      reviews: 210
    }
  ],

  legalName: "Priyanshu Sharma",
  email: "priyanshu.author@example.com",
  phone: "+91 98765 43210",
  address: "Flat 4B, Shanti Enclave, Andheri West, Mumbai, Maharashtra 400053",
  
  bankName: "HDFC Bank",
  accountNumberMasked: "XXXX XXXX 5678",
  ifscCode: "HDFC0001234",
  panNumberMasked: "ABCPE****F",
  tdsRate: 10,
  gstin: null
};

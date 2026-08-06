import LoginCo from "@/components/auth/LoginCo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Author Login | AGPH Author Dashboard - Manage Your Books & Royalties",
  description:
    "Sign in to your AGPH Author Dashboard. Track book sales, monitor royalty earnings, manage your publishing pipeline, and access your author profile — all in one place.",
  keywords: [
    "AGPH author login",
    "author dashboard",
    "book publishing dashboard",
    "AGPH author portal",
    "royalty tracker",
    "book sales dashboard",
    "author earnings",
    "self publishing India",
  ],
  openGraph: {
    title: "Author Login | AGPH Author Dashboard",
    description:
      "Sign in to manage your books, track sales & royalties, and grow your author career with AGPH.",
    type: "website",
    siteName: "AGPH Author Dashboard",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Author Login | AGPH Author Dashboard",
    description:
      "Sign in to manage your books, track sales & royalties, and grow your author career with AGPH.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return <LoginCo />;
}

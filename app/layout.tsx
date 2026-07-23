import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AGPH - Author Dashboard",
  description: "A modern, responsive, and fully-featured dashboard for authors and content creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <div className="min-h-screen w-full flex items-center justify-center ">
          <div className="frame w-full p-3 sm:p-4 shadow-soft">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

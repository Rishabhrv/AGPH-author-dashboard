import AppShell from "@/components/layout/AppShell";
import DashboardPageCo from "@/components/dashboard/DashboardPageCo";
import { getAuthorProfileData, getAuthorSalesData, getAuthorReviewsData, getAuthorBooksProgressData } from "@/actions/auth";

export default async function DashboardPage() {
  // Fetch all necessary dashboard data server-side
  const [profileData, salesData, reviewsData, booksProgress] = await Promise.all([
    getAuthorProfileData(),
    getAuthorSalesData(),
    getAuthorReviewsData(),
    getAuthorBooksProgressData()
  ]);

  return (
    <AppShell active="Overview">
      <DashboardPageCo 
        profileData={profileData} 
        salesData={salesData} 
        reviewsData={reviewsData} 
        booksProgress={booksProgress} 
      />
    </AppShell>
  );
}
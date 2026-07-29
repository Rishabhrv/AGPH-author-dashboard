import AppShell from "@/components/layout/AppShell";
import ProfilePageCo from "@/components/profile/ProfilePageCo";
import { getAuthorProfileData, getAuthorSalesData, getAuthorReviewsData } from "@/actions/auth";

export default async function ProfilePage() {
  const [profileData, salesData, reviewsData] = await Promise.all([
    getAuthorProfileData(),
    getAuthorSalesData(),
    getAuthorReviewsData()
  ]);
  const storeUrl = process.env.STORE_URL || "http://localhost:5000";

  return (
    <AppShell active="profile">
      <ProfilePageCo initialProfileData={profileData} salesData={salesData} reviewsData={reviewsData} storeUrl={storeUrl} />
    </AppShell>
  );
}

import AppShell from "@/components/layout/AppShell";
import ReviewsPageCo from "@/components/reviews/ReviewsPageCo";
import { getAuthorReviewsData } from "@/actions/auth";

export const metadata = {
  title: "Ratings & Reviews - Author Dashboard",
};

export default async function ReviewsPage() {
  const initialData = await getAuthorReviewsData();
  const storeUrl = process.env.STORE_URL || "http://localhost:5000";

  return (
    <AppShell active="/reviews">
      <ReviewsPageCo initialData={initialData} storeUrl={storeUrl} />
    </AppShell>
  );
}

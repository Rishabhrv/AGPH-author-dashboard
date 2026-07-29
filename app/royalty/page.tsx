import AppShell from "@/components/layout/AppShell";
import RoyaltyPageCo from "@/components/royalty/RoyaltyPageCo";
import { getAuthorSalesData } from "@/actions/auth";

export default async function RoyaltyPage() {
  const initialData = await getAuthorSalesData();
  const storeUrl = process.env.STORE_URL || "http://localhost:5000";

  return (
    <AppShell active="royalty">
      <RoyaltyPageCo initialData={initialData} storeUrl={storeUrl} />
    </AppShell>
  );
}

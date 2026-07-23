import AppShell from "@/components/layout/AppShell";
import RoyaltyPageCo from "@/components/royalty/RoyaltyPageCo";
import { getAuthorSalesData } from "@/actions/auth";

export default async function RoyaltyPage() {
  const initialData = await getAuthorSalesData();

  return (
    <AppShell active="royalty">
      <RoyaltyPageCo initialData={initialData} />
    </AppShell>
  );
}

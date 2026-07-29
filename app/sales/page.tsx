import AppShell from "@/components/layout/AppShell";
import SalesPageCo from "@/components/sales/SalesPageCo";
import { getAuthorSalesData } from "@/actions/auth";

export default async function SalesPage() {
  const initialData = await getAuthorSalesData();
  const storeUrl = process.env.STORE_URL || "http://localhost:5000";

  return (
    <AppShell active="sales">
      <SalesPageCo initialData={initialData} storeUrl={storeUrl} />
    </AppShell>
  );
}

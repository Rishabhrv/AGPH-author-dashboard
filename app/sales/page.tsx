import AppShell from "@/components/layout/AppShell";
import SalesPageCo from "@/components/sales/SalesPageCo";
import { getAuthorSalesData } from "@/actions/auth";

export default async function SalesPage() {
  const initialData = await getAuthorSalesData();

  return (
    <AppShell active="sales">
      <SalesPageCo initialData={initialData} />
    </AppShell>
  );
}

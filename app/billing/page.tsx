import AppShell from "@/components/layout/AppShell";
import PaymentsDonutCard from "@/components/billing/PaymentsDonutCard";
import WaitingForBillsCard from "@/components/billing/WaitingForBillsCard";
import LatestTransactionCard from "@/components/billing/LatestTransactionCard";
import BillingStatsCard from "@/components/billing/BillingStatsCard";
import TransactionsTableCard from "@/components/billing/TransactionsTableCard";

export default function BillingPage() {
  return (
    <AppShell active="Billing">
      <h1 className="text-2xl sm:text-[26px] font-extrabold text-ink tracking-tight">
        Your patients billing &amp; invoices
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        <PaymentsDonutCard />
        <div className="flex flex-col gap-5">
          <WaitingForBillsCard />
          <LatestTransactionCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        <BillingStatsCard />
        <TransactionsTableCard />
      </div>
    </AppShell>
  );
}

import AppShell from "@/components/layout/AppShell";
import SupportPageCo from "@/components/support/SupportPageCo";

export const metadata = {
  title: "Support - Author Dashboard",
};

export default function SupportPage() {
  return (
    <AppShell active="/support">
      <SupportPageCo />
    </AppShell>
  );
}

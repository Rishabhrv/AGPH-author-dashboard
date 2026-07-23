import AppShell from "@/components/layout/AppShell";
import CommunityPageCo from "@/components/community/CommunityPageCo";

export const metadata = {
  title: "Community - Author Dashboard",
};

export default function CommunityPage() {
  return (
    <AppShell active="/community">
      <CommunityPageCo />
    </AppShell>
  );
}

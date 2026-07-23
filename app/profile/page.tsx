import AppShell from "@/components/layout/AppShell";
import ProfilePageCo from "@/components/profile/ProfilePageCo";

export default function ProfilePage() {
  return (
    <AppShell active="profile">
      <ProfilePageCo />
    </AppShell>
  );
}

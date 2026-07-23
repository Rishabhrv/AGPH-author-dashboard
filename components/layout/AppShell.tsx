import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 items-start">
      <Sidebar active={active} />
      <div className="flex-1 min-w-0 flex flex-col gap-5 py-1 p-5">
        <TopBar />
        {children}
      </div>
    </div>
  );
}

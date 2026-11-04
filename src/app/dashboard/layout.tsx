import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={user} />

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}


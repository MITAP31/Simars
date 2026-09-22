import UserSidebar from "@/components/layout/user-sidebar";
import UserHeader from "@/components/layout/user-header";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <div className="user-theme flex min-h-screen bg-background">
      <UserSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <UserHeader user={{ name: user.nama, role: "Pengguna", username: user.username }} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await prisma.jenis_arsip.findMany({
    where: { aktif: true },
    select: { nama: true, slug: true },
    orderBy: { nama: "asc" },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar categories={categories} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Plus, Users, UserX, Shield, User as UserIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PenggunaSearch } from "@/components/pengguna/pengguna-search";
import { PenggunaActions } from "@/components/pengguna/pengguna-actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function PenggunaPage({ searchParams }: Props) {
  const currentAdmin = await requireAdmin();
  const { q } = await searchParams;
  const search = q?.trim() ?? "";

  const whereClause = search
    ? {
        OR: [
          { nama: { contains: search, mode: "insensitive" as const } },
          { username: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [rawUsers, activeAdminCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        role: true,
        aktif: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: [
        { role: "asc" }, // admins first
        { created_at: "desc" },
      ],
    }),
    prisma.user.count({
      where: { role: "admin", aktif: true },
    }),
  ]);

  const users = rawUsers.map((u) => ({
    id: u.id.toString(),
    nama: u.nama,
    username: u.username,
    email: u.email,
    role: u.role,
    aktif: u.aktif,
    createdAt: u.created_at,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengguna</h1>
          <p className="text-sm text-muted-foreground">
            Kelola pengguna yang memiliki akses ke SIMARS.
          </p>
        </div>

        <Link
          href="/admin/pengguna/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <PenggunaSearch />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-muted p-4 text-muted-foreground mb-3">
              {search ? <UserX className="h-8 w-8" /> : <Users className="h-8 w-8" />}
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {search ? "Pengguna tidak ditemukan" : "Belum ada pengguna terdaftar"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              {search
                ? `Tidak ditemukan akun yang cocok dengan kata kunci "${search}". Silakan coba kata kunci lain.`
                : "Belum ada data pengguna di database. Klik tombol di bawah untuk menambahkan pengguna pertama."}
            </p>
            {!search && (
              <Link
                href="/admin/pengguna/tambah"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Tambah Pengguna
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  <th className="px-5 py-3 text-left font-medium">Nama</th>
                  <th className="px-5 py-3 text-left font-medium">Username</th>
                  <th className="px-5 py-3 text-left font-medium">Email</th>
                  <th className="px-5 py-3 text-left font-medium">Role</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {user.nama}
                        {user.id === currentAdmin.id.toString() && (
                          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            Anda
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      @{user.username}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {user.email || <span className="text-muted-foreground/60">—</span>}
                    </td>

                    <td className="px-5 py-4">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          <Shield className="h-3 w-3" />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <UserIcon className="h-3 w-3" />
                          User
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {user.aktif ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Nonaktif
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <PenggunaActions
                        user={user}
                        currentUserId={currentAdmin.id.toString()}
                        activeAdminCount={activeAdminCount}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
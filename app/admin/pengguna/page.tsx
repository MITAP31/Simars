import { MoreHorizontal, Plus, Search } from "lucide-react";

const users = [
  {
    name: "Admin",
    email: "admin@plnbatam.co.id",
    role: "Administrator",
    status: "Aktif",
  },
  {
    name: "Budi Santoso",
    email: "budi@plnbatam.co.id",
    role: "Operator",
    status: "Aktif",
  },
  {
    name: "Andi Pratama",
    email: "andi@plnbatam.co.id",
    role: "Operator",
    status: "Aktif",
  },
  {
    name: "Siti Rahma",
    email: "siti@plnbatam.co.id",
    role: "Viewer",
    status: "Aktif",
  },
];

export default function PenggunaPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pengguna
          </h1>

          <p className="text-muted-foreground">
            Kelola pengguna yang memiliki akses ke SIMARS.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          placeholder="Cari nama atau email pengguna..."
          className="h-10 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 text-left font-medium">
                  Nama
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Email
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Role
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Status
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.email}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium">
                      {user.name}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-muted-foreground">
                    {user.email}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {user.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="rounded-md p-2 hover:bg-muted"
                      aria-label={`Menu ${user.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
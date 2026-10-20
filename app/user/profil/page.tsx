import { BadgeCheck, Building2, Calendar, Mail, ShieldCheck, User, UserCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default async function ProfilPage() {
  const user = await requireUser();

  const details = [
    {
      label: "Nama Lengkap",
      value: user.nama,
      icon: User,
    },
    {
      label: "Username",
      value: `@${user.username}`,
      icon: UserCircle,
    },
    {
      label: "Email",
      value: user.email || "Belum diisi",
      icon: Mail,
    },
    {
      label: "Divisi Kerja",
      value: user.divisi ? `${user.divisi.kode} - ${user.divisi.nama}` : "Belum ditentukan",
      icon: Building2,
    },
    {
      label: "Peran Akses",
      value: "Pengguna Divisi (Role: user)",
      icon: ShieldCheck,
    },
    {
      label: "Tanggal Terdaftar",
      value: dateFormatter.format(user.created_at),
      icon: Calendar,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>SIMARS</span>
          <span>/</span>
          <span className="text-foreground">Profil</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profil Saya</h1>
        <p className="text-sm text-muted-foreground">Informasi akun dan hak akses pengguna di SIMARS.</p>
      </div>

      {/* Profile Card */}
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="h-24 bg-gradient-to-r from-[#075985] via-[#0e7490] to-[#155e75]" />
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 gap-4 pb-6 border-b border-border/60">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary text-primary-foreground shadow-md text-2xl font-bold">
                {user.nama
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-foreground">{user.nama}</h2>
                <p className="text-xs text-muted-foreground">
                  {user.divisi ? `${user.divisi.kode} - ${user.divisi.nama}` : "Divisi belum ditentukan"}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start sm:self-end rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <BadgeCheck className="h-4 w-4" />
              Akun Aktif
            </span>
          </div>

          <div className="pt-6">
            <h3 className="text-sm font-semibold text-foreground">Detail Informasi Pengguna</h3>
            <p className="text-xs text-muted-foreground">Data pengguna yang tercatat pada basis data sistem SIMARS.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {details.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Info */}
      <section className="flex gap-3.5 rounded-xl border border-sky-200/70 bg-sky-50/50 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold text-foreground">Data Akun Terkelola</h4>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Informasi akun dan penetapan divisi dikelola secara terpusat oleh Administrator SIMARS. Jika terdapat perubahan divisi atau identitas akun, silakan hubungi administrator.
          </p>
        </div>
      </section>
    </div>
  );
}

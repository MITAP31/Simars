"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  CircleDot,
  Info,
  Lock,
  Mail,
  Save,
  Shield,
  ShieldAlert,
  User,
} from "lucide-react";

export type DivisiOption = {
  id: string;
  kode: string;
  nama: string;
};

type PenggunaFormValues = {
  id?: string;
  nama?: string;
  username?: string;
  email?: string | null;
  role?: string;
  divisi_id?: string | null;
  aktif?: boolean;
};

type ServerAction = (formData: FormData) => void | Promise<void>;

export function PenggunaForm({
  action,
  values = {},
  isEdit = false,
  isLastActiveAdmin = false,
  submitLabel,
  divisiList = [],
  title,
  subtitle,
  headerIcon,
}: {
  action: ServerAction;
  values?: PenggunaFormValues;
  isEdit?: boolean;
  isLastActiveAdmin?: boolean;
  submitLabel: string;
  divisiList?: DivisiOption[];
  title: string;
  subtitle: React.ReactNode;
  headerIcon: React.ReactNode;
}) {
  return (
    <form
      action={action}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 md:p-10 shadow-xs dark:border-slate-800 dark:bg-card"
    >
      {values.id && <input type="hidden" name="id" value={values.id} />}

      {/* Header Halaman di Dalam Card */}
      <div className="flex items-center gap-3.5 mb-7 sm:mb-8">
        <Link
          href="/admin/pengguna"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0 dark:border-slate-800 dark:bg-muted dark:text-slate-400 dark:hover:text-slate-100"
          aria-label="Kembali ke daftar pengguna"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100/70 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 shrink-0">
            {headerIcon}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 md:space-y-7">
        {/* Info Banner untuk Edit Pengguna */}
        {isEdit && (
          <div className="flex items-center gap-2.5 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-xs sm:text-[13px] text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200">
            <Info className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <p className="leading-relaxed">
              Kata sandi tidak diubah di halaman ini. Untuk mengubah kata sandi pengguna, gunakan tombol{" "}
              <strong className="font-semibold text-sky-950 dark:text-sky-100">Reset Password</strong> pada menu aksi di daftar pengguna.
            </p>
          </div>
        )}

        {/* Warning Banner Admin Terakhir */}
        {isLastActiveAdmin && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-xs sm:text-[13px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="leading-relaxed">
              Akun ini adalah <strong className="font-semibold text-amber-950 dark:text-amber-100">satu-satunya Administrator aktif</strong> di sistem SIMARS. Role dan status akun ini tidak dapat diubah menjadi bukan admin atau nonaktif.
            </p>
          </div>
        )}

        {/* Form Fields: 2 Kolom dengan Icon di Dalam Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 md:gap-x-8 gap-y-6">
          {/* Kolom Kiri: Nama Lengkap */}
          <Field label="Nama Lengkap *" htmlFor="nama">
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="nama"
                name="nama"
                required
                maxLength={255}
                defaultValue={values.nama ?? ""}
                placeholder="Contoh: Budi Santoso"
                className={inputClass}
              />
            </div>
          </Field>

          {/* Kolom Kanan: Username */}
          <Field label="Username *" htmlFor="username">
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="username"
                name="username"
                required
                minLength={3}
                maxLength={100}
                defaultValue={values.username ?? ""}
                placeholder="Contoh: budi.santoso"
                className={inputClass}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Minimal 3 karakter. Huruf kecil, angka, titik, strip, atau garis bawah.
            </p>
          </Field>

          {/* Kolom Kiri: Alamat Email */}
          <Field label="Alamat Email" htmlFor="email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="email"
                name="email"
                type="email"
                maxLength={255}
                defaultValue={values.email ?? ""}
                placeholder="Contoh: budi@plnbatam.com"
                className={inputClass}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Opsional. Format email standar.
            </p>
          </Field>

          {/* Kolom Kanan: Divisi / Unit Kerja */}
          <Field label="Divisi / Unit Kerja" htmlFor="divisi_id">
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <select
                id="divisi_id"
                name="divisi_id"
                defaultValue={values.divisi_id ?? ""}
                className={selectClass}
              >
                <option value="">Pilih divisi (opsional)</option>
                {divisiList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.kode} - {d.nama}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Opsional. Tentukan divisi jika pengguna terafiliasi dengan unit kerja.
            </p>
          </Field>

          {/* Kolom Kiri: Role Akses */}
          <Field label="Role Akses *" htmlFor="role">
            <div className="relative">
              <Shield className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <select
                id="role"
                name="role"
                required
                defaultValue={values.role ?? "user"}
                disabled={isLastActiveAdmin}
                className={selectClass}
              >
                <option value="user">User</option>
                <option value="admin">Administrator</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            {isLastActiveAdmin && (
              <input type="hidden" name="role" value="admin" />
            )}
          </Field>

          {/* Kolom Kanan: Status Akun */}
          <Field label="Status Akun *" htmlFor="aktif">
            <div className="relative">
              <CircleDot className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <select
                id="aktif"
                name="aktif"
                required
                defaultValue={values.aktif === false ? "false" : "true"}
                disabled={isLastActiveAdmin}
                className={selectClass}
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            {isLastActiveAdmin && (
              <input type="hidden" name="aktif" value="true" />
            )}
          </Field>
        </div>

        {/* Section Password untuk Tambah Pengguna */}
        {!isEdit && (
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-8">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Pengaturan Kata Sandi Awal
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 md:gap-x-8 gap-y-6">
              {/* Kolom Kiri: Password Awal */}
              <Field label="Password Awal *" htmlFor="password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    className={inputClass}
                  />
                </div>
              </Field>

              {/* Kolom Kanan: Konfirmasi Password */}
              <Field label="Konfirmasi Password *" htmlFor="konfirmasi_password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="konfirmasi_password"
                    name="konfirmasi_password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Ketik ulang password"
                    className={inputClass}
                  />
                </div>
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Footer Tombol Aksi */}
      <div className="flex items-center justify-end gap-3 mt-8">
        <Link
          href="/admin/pengguna"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-muted dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Batal
        </Link>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007b99] hover:bg-[#006b85] text-white px-5 text-sm font-medium shadow-xs transition-colors cursor-pointer"
        >
          <Save className="h-4 w-4" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-800 dark:bg-card dark:text-slate-100 dark:placeholder:text-slate-500";

const selectClass =
  "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-800 dark:bg-card dark:text-slate-100";
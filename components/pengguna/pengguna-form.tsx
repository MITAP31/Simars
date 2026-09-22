"use client";

import Link from "next/link";
import { Info, Save, ShieldAlert } from "lucide-react";

type PenggunaFormValues = {
  id?: string;
  nama?: string;
  username?: string;
  email?: string | null;
  role?: string;
  aktif?: boolean;
};

type ServerAction = (formData: FormData) => void | Promise<void>;

export function PenggunaForm({
  action,
  values = {},
  isEdit = false,
  isLastActiveAdmin = false,
  submitLabel,
}: {
  action: ServerAction;
  values?: PenggunaFormValues;
  isEdit?: boolean;
  isLastActiveAdmin?: boolean;
  submitLabel: string;
}) {
  return (
    <form action={action} className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="space-y-6 p-6">
        {isEdit && (
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <p>
              Kata sandi tidak diubah di halaman ini. Untuk mengubah kata sandi pengguna, gunakan tombol <strong>Reset Password</strong> pada menu aksi di daftar pengguna.
            </p>
          </div>
        )}

        {isLastActiveAdmin && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p>
              Akun ini adalah <strong>satu-satunya Administrator aktif</strong> di sistem SIMARS. Role dan status akun ini tidak dapat diubah menjadi bukan admin atau nonaktif.
            </p>
          </div>
        )}

        {/* Data Akun */}
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Nama Lengkap *" htmlFor="nama">
            <input
              id="nama"
              name="nama"
              required
              maxLength={255}
              defaultValue={values.nama ?? ""}
              placeholder="Contoh: Budi Santoso"
              className={inputClass}
            />
          </Field>

          <Field label="Username *" htmlFor="username">
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
            <span className="block text-xs text-muted-foreground">
              Minimal 3 karakter. Huruf kecil, angka, titik, strip, atau garis bawah.
            </span>
          </Field>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Field label="Alamat Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              maxLength={255}
              defaultValue={values.email ?? ""}
              placeholder="Contoh: budi@plnbatam.com"
              className={inputClass}
            />
            <span className="block text-xs text-muted-foreground">
              Opsional. Format email standar.
            </span>
          </Field>

          <Field label="Role Akses *" htmlFor="role">
            <select
              id="role"
              name="role"
              required
              defaultValue={values.role ?? "user"}
              disabled={isLastActiveAdmin}
              className={inputClass}
            >
              <option value="admin">Administrator</option>
              <option value="user">User</option>
            </select>
            {isLastActiveAdmin && (
              <input type="hidden" name="role" value="admin" />
            )}
          </Field>

          <Field label="Status Akun *" htmlFor="aktif">
            <select
              id="aktif"
              name="aktif"
              required
              defaultValue={values.aktif === false ? "false" : "true"}
              disabled={isLastActiveAdmin}
              className={inputClass}
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
            {isLastActiveAdmin && (
              <input type="hidden" name="aktif" value="true" />
            )}
          </Field>
        </div>

        {/* Input Password untuk mode Tambah Pengguna */}
        {!isEdit && (
          <div className="border-t border-border/70 pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Pengaturan Kata Sandi Awal
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Password Awal *" htmlFor="password">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  className={inputClass}
                />
              </Field>

              <Field label="Konfirmasi Password *" htmlFor="konfirmasi_password">
                <input
                  id="konfirmasi_password"
                  name="konfirmasi_password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Ketik ulang password"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t p-6 sm:flex-row sm:justify-end">
        <Link
          href="/admin/pengguna"
          className="rounded-md border px-5 py-2 text-center text-sm font-medium hover:bg-muted"
        >
          Batal
        </Link>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer"
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
    <label className="block space-y-2" htmlFor={htmlFor}>
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

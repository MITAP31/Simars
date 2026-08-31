import Image from "next/image";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(30,115,200,0.48),transparent_28rem),radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.24),transparent_24rem)]" />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 h-24 w-24 drop-shadow-[0_10px_20px_rgba(14,165,233,0.25)]">
            <Image src="/pln-batam-mark-dark.svg" alt="Logo PLN Batam" fill sizes="96px" className="object-contain" priority />
          </div>

          <h1 className="text-2xl font-bold text-white">
            SIMARS
          </h1>

          <p className="mt-1 text-sm text-blue-100/75">
            Sistem Informasi Manajemen Arsip
          </p>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-3xl border border-sky-200/20 bg-slate-900/65 shadow-2xl shadow-black/35 backdrop-blur-xl">
          <div className="border-b border-sky-100/10 bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-transparent px-6 py-7 text-center">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-sky-300 to-yellow-300" />
            <h2 className="text-xl font-semibold text-white">
              Selamat Datang
            </h2>

            <p className="mt-1 text-sm text-blue-100/70">
              Masuk untuk mengakses sistem SIMARS.
            </p>
          </div>

          <div className="space-y-5 p-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-50">
                Username
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-200" />

                <input
                  type="text"
                  placeholder="Masukkan username"
                  className="h-11 w-full rounded-xl border border-sky-100/20 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-blue-100/45 outline-none transition-colors focus:border-sky-300/60 focus:bg-white/15 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-50">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-200" />

                <input
                  type="password"
                  placeholder="Masukkan password"
                  className="h-11 w-full rounded-xl border border-sky-100/20 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-blue-100/45 outline-none transition-colors focus:border-sky-300/60 focus:bg-white/15 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-blue-100">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-sky-100/40 bg-white/10 accent-sky-400"
                />

                Ingat saya
              </label>

              <button
                type="button"
                className="text-sm font-medium text-sky-200 transition-colors hover:text-white"
              >
                Lupa password?
              </button>
            </div>

            {/* Login */}
            <button
              type="button"
              className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition-all hover:-translate-y-0.5 hover:from-sky-400 hover:to-blue-500"
            >
              Masuk
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-blue-100/65">
          SIMARS • PLN Batam
        </p>
      </div>
    </main>
  );
}

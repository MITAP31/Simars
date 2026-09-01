import Image from "next/image";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sky-50 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,190,0.22),transparent_28rem),radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.2),transparent_24rem)]" />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 h-24 w-24 drop-shadow-[0_10px_20px_rgba(14,165,233,0.25)]">
            <Image src="/pln-batam-mark-dark.svg" alt="Logo PLN Batam" fill sizes="96px" className="object-contain" priority />
          </div>

          <h1 className="text-2xl font-bold text-sky-950">
            SIMARS
          </h1>

          <p className="mt-1 text-sm text-sky-800/75">
            Sistem Informasi Manajemen Arsip
          </p>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-3xl border border-sky-200/80 bg-white/85 shadow-2xl shadow-sky-900/10 backdrop-blur-xl">
          <div className="border-b border-sky-100 bg-gradient-to-r from-cyan-100 via-sky-100 to-transparent px-6 py-7 text-center">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-sky-300 to-yellow-300" />
            <h2 className="text-xl font-semibold text-sky-950">
              Selamat Datang
            </h2>

            <p className="mt-1 text-sm text-sky-800/70">
              Masuk untuk mengakses sistem SIMARS.
            </p>
          </div>

          <div className="space-y-5 p-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-sky-950">
                Username
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />

                <input
                  type="text"
                  placeholder="Masukkan username"
                  className="h-11 w-full rounded-xl border border-sky-200 bg-white pl-10 pr-3 text-sm text-sky-950 placeholder:text-sky-800/45 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-sky-950">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />

                <input
                  type="password"
                  placeholder="Masukkan password"
                  className="h-11 w-full rounded-xl border border-sky-200 bg-white pl-10 pr-3 text-sm text-sky-950 placeholder:text-sky-800/45 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-sky-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-sky-300 bg-white accent-cyan-600"
                />

                Ingat saya
              </label>

              <button
                type="button"
                className="text-sm font-medium text-primary transition-colors hover:text-cyan-700"
              >
                Lupa password?
              </button>
            </div>

            {/* Login */}
            <button
              type="button"
              className="h-11 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-sky-500"
            >
              Masuk
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-sky-800/65">
          SIMARS • PLN Batam
        </p>
      </div>
    </main>
  );
}

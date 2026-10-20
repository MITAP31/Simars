"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { AlertCircle, Info, Loader2, Lock, User, X } from "lucide-react";

import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

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

          <form action={formAction} className="space-y-5 p-6">
            {/* Error Message */}
            {state?.error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 shadow-xs"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="font-medium leading-relaxed">{state.error}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-sky-950">
                Username
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Masukkan username"
                  className="h-11 w-full rounded-xl border border-sky-200 bg-white pl-10 pr-3 text-sm text-sky-950 placeholder:text-sky-800/45 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-sky-950">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Masukkan password"
                  className="h-11 w-full rounded-xl border border-sky-200 bg-white pl-10 pr-3 text-sm text-sky-950 placeholder:text-sky-800/45 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
            </div>

            {/* Forgot password link */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgotNotice(true)}
                className="text-sm font-medium text-primary transition-colors hover:text-cyan-700"
              >
                Lupa password?
              </button>
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={isPending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-75 disabled:hover:translate-y-0"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>
        </div>

        {/* Notice Lupa Password Modal/Alert */}
        {showForgotNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl border border-sky-100 bg-white p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5 text-primary">
                  <Info className="h-5 w-5" />
                  <h3 className="font-semibold text-sky-950">Lupa Password</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Untuk alasan keamanan, pemulihan kata sandi dilakukan secara terpusat. Silakan hubungi Administrator Sistem SIMARS untuk mereset kata sandi akun Anda.
              </p>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(false)}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                >
                  Mengerti
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-sky-800/65">
          SIMARS • PLN Batam
        </p>
      </div>
    </main>
  );
}

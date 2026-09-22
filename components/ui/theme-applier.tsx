"use client";

import { useEffect } from "react";

export function ThemeApplier({ theme }: { theme: string }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => document.documentElement.classList.toggle("dark", theme === "gelap" || (theme === "sistem" && media.matches));
    applyTheme();
    if (theme !== "sistem") return;
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);
  return null;
}

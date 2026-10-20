import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/*": ["./storage/uploads/arsip/**/*", "./public/uploads/arsip/**/*"],
  },
  experimental: {
    serverActions: {
      // File arsip dibatasi 10 MB pada server action; ruang ekstra untuk multipart.
      bodySizeLimit: "11mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/admin/pengaturan/kode-klasifikasi/:path*",
        destination: "/admin/master-data/kode-klasifikasi/:path*",
        permanent: true,
      },
      {
        source: "/admin/pengaturan/divisi/:path*",
        destination: "/admin/master-data/divisi/:path*",
        permanent: true,
      },
      {
        source: "/admin/pengaturan/lokasi-penyimpanan/:path*",
        destination: "/admin/master-data/lokasi-penyimpanan/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

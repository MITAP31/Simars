import { redirect } from "next/navigation";

// Redirect aman dari rute lama ke rute resmi Arsip Akhir Retensi
export default function TempatSampahRedirectPage() {
  redirect("/admin/arsip/akhir-retensi");
}

import { readdir } from "node:fs/promises";
import path from "node:path";

const privateUploadDirectories = [
  path.join(process.cwd(), "public", "uploads", "arsip"),
  path.join(process.cwd(), "storage", "uploads", "arsip"),
];

async function countFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return 0;
    }
    throw new Error("Tidak dapat memeriksa folder dokumen publik.");
  }

  let count = 0;
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    count += entry.isDirectory() ? await countFiles(entryPath) : 1;
  }
  return count;
}

try {
  let privateFileCount = 0;
  for (const directory of privateUploadDirectories) {
    privateFileCount += await countFiles(directory);
  }

  if (privateFileCount > 0) {
    console.error(
      "Build dihentikan: folder upload berisi file. Gunakan source deployment bersih tanpa dokumen privat; siapkan penyimpanan persisten secara terpisah."
    );
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Pemeriksaan folder dokumen publik gagal.");
  process.exitCode = 1;
}

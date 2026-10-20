import { readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const legacyPublicDirectory = path.join(root, "public", "uploads", "arsip");
const privateStorageDirectory = path.join(root, "storage", "uploads", "arsip");
const buildOutputDirectory = path.join(root, ".next");
const phase = process.argv[2] ?? "prebuild";

function isMissing(error) {
  return error && typeof error === "object" && "code" in error && error.code === "ENOENT";
}

async function listFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isMissing(error)) return [];
    throw new Error("Tidak dapat memeriksa direktori upload.");
  }

  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      // Only names and paths are inspected. File contents are never opened.
      files.push({ fullPath, basename: entry.name });
    }
  }
  return files;
}

async function runPrebuildCheck() {
  const legacyFiles = await listFiles(legacyPublicDirectory);
  if (legacyFiles.length > 0) {
    console.error(
      "Build dihentikan: public/uploads/arsip berisi file lama. Jangan deploy file ini sebagai asset publik; lakukan backup dan migrasi terkontrol secara manual terlebih dahulu. File sumber tidak diubah."
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    "Pemeriksaan pra-build lulus: tidak ada file di public/uploads/arsip. File storage/uploads/arsip tetap privat dan akan diverifikasi pada output build."
  );
}

function includesUploadPath(relativePath) {
  const parts = relativePath.split(path.sep).map((part) => part.toLowerCase());
  for (let index = 0; index <= parts.length - 3; index += 1) {
    if (
      (parts[index] === "storage" || parts[index] === "public") &&
      parts[index + 1] === "uploads" &&
      parts[index + 2] === "arsip"
    ) {
      return true;
    }
  }
  return false;
}

async function runPostbuildCheck() {
  let outputFiles;
  try {
    outputFiles = await listFiles(buildOutputDirectory);
  } catch {
    throw new Error("Tidak dapat memeriksa artefak Next.js setelah build.");
  }

  if (outputFiles.length === 0) {
    throw new Error("Artefak .next tidak ditemukan; pemeriksaan pasca-build tidak dapat dilakukan.");
  }

  const sourceFiles = [
    ...(await listFiles(legacyPublicDirectory)),
    ...(await listFiles(privateStorageDirectory)),
  ];
  const privateBasenames = new Set(sourceFiles.map((file) => file.basename.toLowerCase()));

  const includedFiles = outputFiles.filter((file) => {
    const relativePath = path.relative(buildOutputDirectory, file.fullPath);
    return includesUploadPath(relativePath) || privateBasenames.has(file.basename.toLowerCase());
  });

  if (includedFiles.length > 0) {
    console.error(
      "Build ditolak: artefak .next memuat path atau nama file dari direktori upload. Artefak ini tidak boleh dipublikasikan. Nama file tidak ditampilkan."
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    "Pemeriksaan pasca-build lulus: tidak ditemukan path upload atau nama file sumber upload di artefak .next."
  );
}

try {
  if (phase === "prebuild") {
    await runPrebuildCheck();
  } else if (phase === "postbuild") {
    await runPostbuildCheck();
  } else {
    throw new Error("Tahap pemeriksaan tidak valid. Gunakan prebuild atau postbuild.");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Pemeriksaan keamanan file gagal.");
  process.exitCode = 1;
}

import { openSync, closeSync, readSync, statSync } from "node:fs";
import path from "node:path";

/** Checks existing BA storage without generating or changing the document. */
export function isAvailableBeritaAcara(filePath: string | null | undefined): boolean {
  if (!filePath) return false;
  const storageBase = path.resolve(process.cwd(), "storage", "uploads", "arsip");
  const target = path.resolve(process.cwd(), "storage", filePath.replace(/^\/?/, ""));
  const prefix = storageBase.endsWith(path.sep) ? storageBase : `${storageBase}${path.sep}`;
  if (!target.startsWith(prefix)) return false;
  let fd: number | undefined;
  try {
    if (!statSync(target).isFile()) return false;
    fd = openSync(target, "r");
    const signature = Buffer.alloc(5);
    return readSync(fd, signature, 0, 5, 0) === 5 && signature.toString("ascii") === "%PDF-";
  } catch {
    return false;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface ArsipPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function ArsipPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: ArsipPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const goToPage = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber > 1) {
      params.set("page", pageNumber.toString());
    } else {
      params.delete("page");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items: (number | string)[] = [];
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) items.push(i);
      items.push("...");
      items.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      items.push(1);
      items.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      items.push("...");
      items.push(currentPage - 1);
      items.push(currentPage);
      items.push(currentPage + 1);
      items.push("...");
      items.push(totalPages);
    }
    return items;
  };

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 px-5 py-3.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between bg-card">
      <p>
        Menampilkan{" "}
        <span className="font-semibold text-foreground">
          {start}–{end}
        </span>{" "}
        dari{" "}
        <span className="font-semibold text-foreground">
          {totalItems.toLocaleString("id-ID")}
        </span>{" "}
        arsip
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pagination arsip" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || isPending}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {getPaginationItems().map((item, idx) => {
            if (typeof item === "string") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex h-8 w-6 items-center justify-center text-xs text-muted-foreground select-none"
                >
                  …
                </span>
              );
            }

            const isCurrent = item === currentPage;
            return (
              <button
                key={item}
                type="button"
                onClick={() => goToPage(item)}
                disabled={isPending}
                aria-current={isCurrent ? "page" : undefined}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors ${
                  isCurrent
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || isPending}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </nav>
      )}
    </div>
  );
}

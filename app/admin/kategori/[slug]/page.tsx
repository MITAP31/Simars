import { CategoryArchivePage } from "@/components/arsip/category-archive-page";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ slug }, { q }] = await Promise.all([params, searchParams]);
  return <CategoryArchivePage slug={slug} query={q} />;
}

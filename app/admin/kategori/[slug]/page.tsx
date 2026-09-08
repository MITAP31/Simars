import { CategoryArchivePage } from "@/components/arsip/category-archive-page";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryArchivePage slug={slug} />;
}

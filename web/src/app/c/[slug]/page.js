import { notFound } from "next/navigation";
import ServiceGrid from "@/components/ServiceGrid";
import { loadCategoryPage } from "@/lib/catalog";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await loadCategoryPage(slug);
  if (!data) return {};
  const n = data.category.nameSv;
  return {
    title: `${n} – boka online | HemHjälp`,
    description: `Boka ${n.toLowerCase()} online. Verifierade företag, tydliga priser och RUT-avdrag.`,
    alternates: { canonical: `/c/${slug}` },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const data = await loadCategoryPage(slug);
  if (!data) notFound();
  return <ServiceGrid category={data.category} services={data.services} />;
}
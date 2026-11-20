import { notFound } from "next/navigation";
import ServiceGrid from "@/components/ServiceGrid";
import { loadCategoryPage } from "@/lib/catalog";
import { CITIES } from "@/lib/cities";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug, city } = await params;
  const c = CITIES.find((x) => x.slug === city);
  const data = c && (await loadCategoryPage(slug, c.name));
  if (!data) return {};
  const n = data.category.nameSv;
  return {
    title: `${n} i ${c.name} – boka online | HemHjälp`,
    description: `Boka ${n.toLowerCase()} i ${c.name}. Verifierade företag, tydliga priser och RUT-avdrag.`,
    alternates: { canonical: `/c/${slug}/${city}` },
  };
}

export default async function Page({ params }) {
  const { slug, city } = await params;
  const c = CITIES.find((x) => x.slug === city);
  if (!c) notFound();
  const data = await loadCategoryPage(slug, c.name);
  if (!data) notFound();
  return <ServiceGrid category={data.category} services={data.services} cityName={c.name} />;
}
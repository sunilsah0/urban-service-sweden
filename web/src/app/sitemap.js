import { prisma } from "@/lib/prisma";
import { CITIES } from "@/lib/cities";

export const revalidate = 3600;

export default async function sitemap() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const cats = await prisma.category.findMany({ select: { slug: true } });
  return [
    { url: site },
    ...cats.flatMap((c) => [
      { url: `${site}/c/${c.slug}` },
      ...CITIES.map((city) => ({ url: `${site}/c/${c.slug}/${city.slug}` })),
    ]),
  ];
}
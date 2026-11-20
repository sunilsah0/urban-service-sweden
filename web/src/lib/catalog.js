import { cache } from "react";
import { prisma } from "./prisma";

export const loadCategoryPage = cache(async (slug, cityName) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, slug: true, nameEn: true, nameSv: true, icon: true, taxType: true },
  });
  if (!category) return null;
  const services = await prisma.service.findMany({
    where: {
      active: true,
      categoryId: category.id,
      provider: {
        status: "APPROVED",
        ...(cityName ? { city: { equals: cityName, mode: "insensitive" } } : {}),
      },
    },
    select: {
      id: true, title: true, priceSek: true, durationMin: true, imageUrl: true,
      provider: { select: { companyName: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return { category, services };
});
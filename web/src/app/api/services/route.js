import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function GET(req) {
  const slug = req.nextUrl.searchParams.get("category");
  const services = await prisma.service.findMany({
    where: {
      active: true,
      provider: { status: "APPROVED" },
      ...(slug ? { category: { slug } } : {}),
    },
    include: { provider: { select: { companyName: true, city: true } }, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(services);
}

export async function POST(req) {
  const u = await getUser(req);
  if (!u || u.role !== "PROVIDER") return fail("Providers only", 403);
  const provider = await prisma.provider.findUnique({ where: { userId: u.id } });
  if (!provider || provider.status !== "APPROVED")
    return fail("Your company is not approved yet", 403);

  const { title, description, priceSek, durationMin, categoryId, imageUrl } = await req.json();
  if (!title || !description || !categoryId || !(priceSek > 0) || !(durationMin > 0))
    return fail("Fill all fields correctly");

  const service = await prisma.service.create({
    data: {
      providerId: provider.id,
      categoryId,
      title,
      description,
      priceSek: Number(priceSek),
      durationMin: Number(durationMin),
      imageUrl: imageUrl || null,
    },
  });
  return NextResponse.json(service);
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function GET(req) {
  const u = await getUser(req);
  if (!u || u.role !== "PROVIDER") return fail("Providers only", 403);
  const provider = await prisma.provider.findUnique({
    where: { userId: u.id },
    include: { services: { include: { category: true }, orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json(provider);
}

export async function PATCH(req) {
  const u = await getUser(req);
  if (!u || u.role !== "PROVIDER") return fail("Providers only", 403);
  const current = await prisma.provider.findUnique({ where: { userId: u.id } });
  const { orgNumber, city, description } = await req.json();
  const clean = String(orgNumber || "").replace(/[^0-9-]/g, "").slice(0, 13);
  const updated = await prisma.provider.update({
    where: { userId: u.id },
    data: {
      orgNumber: clean,
      city: String(city || "").slice(0, 80),
      description: String(description || "").slice(0, 2000),
      // a changed org number must be verified again
      ...(clean !== current.orgNumber ? { fSkattVerified: false } : {}),
    },
  });
  return NextResponse.json(updated);
}
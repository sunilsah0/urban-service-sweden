import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function GET(req) {
  const u = await getUser(req);
  if (!u || u.role !== "ADMIN") return fail("Admins only", 403);
  return NextResponse.json(
    await prisma.service.findMany({
      select: { id: true, title: true, priceSek: true, active: true, provider: { select: { companyName: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
  );
}
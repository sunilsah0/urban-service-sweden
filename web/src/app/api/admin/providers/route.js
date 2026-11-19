import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function GET(req) {
  const u = await getUser(req);
  if (!u || u.role !== "ADMIN") return fail("Admins only", 403);
  const providers = await prisma.provider.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(providers);
}
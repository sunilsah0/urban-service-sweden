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
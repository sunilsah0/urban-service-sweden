import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  if (!u || u.role !== "ADMIN") return fail("Admins only", 403);
  const { status } = await req.json();
  if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) return fail("Bad status");
  const provider = await prisma.provider.update({ where: { id }, data: { status } });
  return NextResponse.json(provider);
}
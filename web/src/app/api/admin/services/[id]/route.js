import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  if (!u || u.role !== "ADMIN") return fail("Admins only", 403);
  const { active } = await req.json();
  return NextResponse.json(await prisma.service.update({ where: { id }, data: { active: !!active } }));
}
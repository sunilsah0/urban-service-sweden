import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req) {
  const u = await getUser(req);
  if (!u) return NextResponse.json({ user: null });
  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json({ user });
}
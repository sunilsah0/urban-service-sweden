import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function POST(req) {
  const u = await getUser(req);
  if (!u) return fail("Please log in", 401);
  const { token } = await req.json();
  if (typeof token !== "string" || !token.startsWith("ExponentPushToken")) return fail("Bad token");
  await prisma.user.update({ where: { id: u.id }, data: { pushToken: token } });
  return NextResponse.json({ ok: true });
}
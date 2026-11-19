import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";
import { getBookingAccess } from "@/lib/access";

export async function GET(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  const access = u && (await getBookingAccess(u, id));
  if (!access) return fail("Not allowed", 403);
  const msgs = await prisma.message.findMany({
    where: { bookingId: id },
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return NextResponse.json(msgs);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  const access = u && (await getBookingAccess(u, id));
  if (!access || access.who === "admin") return fail("Not allowed", 403);
  const { text } = await req.json();
  if (!text?.trim() || text.length > 1000) return fail("Message is empty or too long");
  const msg = await prisma.message.create({ data: { bookingId: id, senderId: u.id, text: text.trim() } });
  return NextResponse.json(msg);
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";
import { getBookingAccess } from "@/lib/access";

const ACTIVE = ["EN_ROUTE", "IN_PROGRESS"];

export async function POST(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  const access = u && (await getBookingAccess(u, id));
  if (!access || access.who !== "employee") return fail("Not allowed", 403);
  if (!ACTIVE.includes(access.booking.status)) return fail("Tracking is not active");
  const { lat, lng } = await req.json();
  if (typeof lat !== "number" || typeof lng !== "number") return fail("Bad location");
  await prisma.locationPoint.create({ data: { bookingId: id, employeeId: access.booking.employeeId, lat, lng } });
  return NextResponse.json({ ok: true });
}

export async function GET(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  const access = u && (await getBookingAccess(u, id));
  if (!access || access.who === "employee") return fail("Not allowed", 403);
  if (!ACTIVE.includes(access.booking.status)) return NextResponse.json({ active: false, point: null, trail: [] });
  const recent = await prisma.locationPoint.findMany({
    where: { bookingId: id },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return NextResponse.json({ active: true, point: recent[0] || null, trail: recent.reverse() });
}
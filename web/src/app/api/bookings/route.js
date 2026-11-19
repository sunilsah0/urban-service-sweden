import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function GET(req) {
  const u = await getUser(req);
  if (!u) return fail("Please log in", 401);

 let where = u.role === "ADMIN" ? {} : { id: "none" };
  if (u.role === "CUSTOMER") where = { customerId: u.id };
  if (u.role === "PROVIDER") {
    const provider = await prisma.provider.findUnique({ where: { userId: u.id } });
    where = { providerId: provider?.id || "none" };
  }
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: { select: { title: true, priceSek: true } },
      provider: { select: { companyName: true } },
      customer: { select: { name: true, email: true } },
      employee: { include: { user: { select: { name: true } } } },
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(bookings);
}

export async function POST(req) {
  const u = await getUser(req);
  if (!u) return fail("Please log in", 401);
  if (u.role !== "CUSTOMER") return fail("Only customers can book", 403);

  const { serviceId, date, address, note } = await req.json();
  const when = new Date(date);
  if (!serviceId || !address || isNaN(when) || when < new Date())
    return fail("Choose a future date and enter your address");

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true, provider: { status: "APPROVED" } },
  });
  if (!service) return fail("Service not available", 404);

  const booking = await prisma.booking.create({
    data: {
      customerId: u.id,
      serviceId,
      providerId: service.providerId,
      date: when,
      address,
      note: note || "",
      title: service.title,
      priceSek: service.priceSek,
    },
  });
  return NextResponse.json(booking);
}
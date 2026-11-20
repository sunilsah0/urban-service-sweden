import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";
import { priceBreakdown } from "@/lib/pricing";
import { notify } from "@/lib/notify";

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

  const { serviceId, date, address, note, useRut } = await req.json();
  const when = new Date(date);
  if (!serviceId || !address || isNaN(when) || when < new Date())
    return fail("Choose a future date and enter your address");

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true, provider: { status: "APPROVED" } },
    include: { category: true, provider: true },
  });
  if (!service) return fail("Service not available", 404);

  const rutOk = service.category.taxType === "RUT" && service.provider.fSkattVerified;
  if (useRut && !rutOk) return fail("RUT-avdrag is not available for this service");
  const pb = priceBreakdown(service.priceSek, !!useRut);

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
      useRut: !!useRut,
      rutDeductionSek: pb.rutDeductionSek,
      payAmountSek: pb.payAmountSek,
    },
  });
  after(() =>
    notify(service.provider.userId, {
      title: "New booking request / Ny bokningsförfrågan",
      body: `${service.title} · ${when.toLocaleString("sv-SE")}`,
      path: `/booking/${booking.id}`,
    })
  );
  return NextResponse.json(booking);
}
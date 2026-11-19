import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";
import { getBookingAccess } from "@/lib/access";

const allowed = {
  PROVIDER: {
    REQUESTED: ["ACCEPTED", "CANCELLED"],
    ACCEPTED: ["EN_ROUTE", "IN_PROGRESS", "CANCELLED"],
    EN_ROUTE: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
  },
  EMPLOYEE: { ACCEPTED: ["EN_ROUTE"], EN_ROUTE: ["IN_PROGRESS"], IN_PROGRESS: ["COMPLETED"] },
  CUSTOMER: { REQUESTED: ["CANCELLED"], ACCEPTED: ["CANCELLED"] },
};

export async function GET(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  if (!u) return fail("Please log in", 401);
  const access = await getBookingAccess(u, id, {
    service: { select: { title: true, priceSek: true } },
    customer: { select: { name: true } },
    timeLogs: true,
    review: true,
  });
  if (!access) return fail("Not allowed", 403);
  const { booking, who } = access;
  const minutes = booking.timeLogs.reduce(
    (sum, l) => sum + ((l.endedAt ? +new Date(l.endedAt) : Date.now()) - +new Date(l.startedAt)) / 60000,
    0
  );
  return NextResponse.json({ ...booking, who, minutesWorked: Math.round(minutes) });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  if (!u) return fail("Please log in", 401);
  const { status } = await req.json();
  const access = await getBookingAccess(u, id);
  if (!access) return fail("Not allowed", 403);
  const { booking, who } = access;

  if (who !== "admin" && !allowed[who.toUpperCase()]?.[booking.status]?.includes(status))
    return fail("This change is not allowed");

  const ops = [prisma.booking.update({ where: { id }, data: { status } })];
  if (status === "IN_PROGRESS")
    ops.push(prisma.timeLog.create({ data: { bookingId: id, employeeId: booking.employeeId, startedAt: new Date() } }));
  if (status === "COMPLETED") {
    ops.push(prisma.timeLog.updateMany({ where: { bookingId: id, endedAt: null }, data: { endedAt: new Date() } }));
    ops.push(prisma.locationPoint.deleteMany({ where: { bookingId: id } })); // GDPR: delete GPS after the job
  }
  const [updated] = await prisma.$transaction(ops);
  return NextResponse.json(updated);
}
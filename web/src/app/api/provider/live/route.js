import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function GET(req) {
  const u = await getUser(req);
  if (!u || u.role !== "PROVIDER") return fail("Providers only", 403);
  const provider = await prisma.provider.findUnique({ where: { userId: u.id } });
  const jobs = await prisma.booking.findMany({
    where: { providerId: provider?.id || "none", status: { in: ["EN_ROUTE", "IN_PROGRESS"] } },
    include: { employee: { include: { user: { select: { name: true } } } } },
  });
  const out = await Promise.all(
    jobs.map(async (j) => ({
      id: j.id,
      title: j.title || "Job",
      address: j.address,
      status: j.status,
      employeeName: j.employee?.user.name || "-",
      point: await prisma.locationPoint.findFirst({ where: { bookingId: j.id }, orderBy: { createdAt: "desc" } }),
    }))
  );
  return NextResponse.json(out);
}
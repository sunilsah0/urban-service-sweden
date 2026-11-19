import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function GET(req) {
  const u = await getUser(req);
  if (!u || u.role !== "EMPLOYEE") return fail("Employees only", 403);
  const emp = await prisma.employee.findUnique({ where: { userId: u.id } });
  const jobs = await prisma.booking.findMany({
    where: { employeeId: emp?.id || "none", status: { in: ["ACCEPTED", "EN_ROUTE", "IN_PROGRESS"] } },
    include: { customer: { select: { name: true } }, service: { select: { title: true } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(jobs);
}
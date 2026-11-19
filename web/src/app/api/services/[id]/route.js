import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/auth";

export async function GET(req, { params }) {
  const { id } = await params;
  const service = await prisma.service.findFirst({
    where: { id, active: true, provider: { status: "APPROVED" } },
    include: { provider: { select: { companyName: true, city: true, description: true } }, category: true },
  });
  if (!service) return fail("Service not found", 404);
  return NextResponse.json(service);
}
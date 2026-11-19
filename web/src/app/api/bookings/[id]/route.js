import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

const allowed = {
  PROVIDER: {
    REQUESTED: ["ACCEPTED", "CANCELLED"],
    ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED"],
  },
  CUSTOMER: { REQUESTED: ["CANCELLED"], ACCEPTED: ["CANCELLED"] },
};

export async function PATCH(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  if (!u) return fail("Please log in", 401);
  const { status } = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { provider: true },
  });
  if (!booking) return fail("Not found", 404);

  const isOwner =
    (u.role === "CUSTOMER" && booking.customerId === u.id) ||
    (u.role === "PROVIDER" && booking.provider.userId === u.id);
  const isAdmin = u.role === "ADMIN";
  if (!isOwner && !isAdmin) return fail("Not allowed", 403);

  if (!isAdmin && !allowed[u.role]?.[booking.status]?.includes(status))
    return fail("This change is not allowed");

  const updated = await prisma.booking.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}
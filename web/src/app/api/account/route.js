import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function GET(req) {
  const u = await getUser(req);
  if (!u) return fail("Please log in", 401);
  const [user, bookings, messages, reviews, jobs] = await Promise.all([
    prisma.user.findUnique({ where: { id: u.id }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.booking.findMany({ where: { customerId: u.id } }),
    prisma.message.findMany({ where: { senderId: u.id } }),
    prisma.review.findMany({ where: { customerId: u.id } }),
    prisma.jobPost.findMany({ where: { customerId: u.id } }),
  ]);
  return new NextResponse(JSON.stringify({ user, bookings, messages, reviews, jobs }, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=my-data.json" },
  });
}

export async function DELETE(req) {
  const u = await getUser(req);
  if (!u) return fail("Please log in", 401);
  if (u.role === "ADMIN") return fail("Admin accounts cannot be deleted here", 403);

  const open = await prisma.booking.count({
    where: {
      OR: [{ customerId: u.id }, { provider: { userId: u.id } }, { employee: { userId: u.id } }],
      status: { in: ["REQUESTED", "ACCEPTED", "EN_ROUTE", "IN_PROGRESS"] },
    },
  });
  if (open) return fail("Finish or cancel your open bookings first");

  // Personal data is anonymised. Booking and payment rows stay for bookkeeping law.
  await prisma.$transaction([
    prisma.message.updateMany({ where: { senderId: u.id }, data: { text: "[deleted]" } }),
    prisma.user.update({
      where: { id: u.id },
      data: {
        name: "Deleted user",
        email: `deleted-${u.id}@deleted.invalid`,
        passwordHash: "!",
        pushToken: null,
        deletedAt: new Date(),
      },
    }),
  ]);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("token");
  return res;
}
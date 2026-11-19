import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";
import { getBookingAccess } from "@/lib/access";

export async function POST(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  const access = u && (await getBookingAccess(u, id, { review: true }));
  if (!access || access.who !== "customer") return fail("Customers only", 403);
  const { booking } = access;
  if (booking.status !== "COMPLETED") return fail("You can review after the job is completed");
  if (booking.review) return fail("Already reviewed");
  const { rating, comment } = await req.json();
  if (!(rating >= 1 && rating <= 5)) return fail("Rating must be 1 to 5");
  const review = await prisma.review.create({
    data: {
      bookingId: id,
      customerId: u.id,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      rating: Number(rating),
      comment: (comment || "").slice(0, 1000),
    },
  });
  return NextResponse.json(review);
}
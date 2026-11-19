import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const u = await getUser(req);
  if (!u || u.role !== "CUSTOMER") return fail("Customers only", 403);
  const { bookingId } = await req.json();
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { service: true } });
  if (!booking || booking.customerId !== u.id) return fail("Not found", 404);
  if (booking.paid) return fail("Already paid");
  if (["REQUESTED", "CANCELLED"].includes(booking.status)) return fail("Wait until the provider accepts");

  const price = booking.priceSek ?? booking.service?.priceSek;
  const origin = req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "sek",
          unit_amount: price * 100,
          product_data: { name: booking.title || booking.service?.title || "Service" },
        },
      },
    ],
    metadata: { bookingId },
    success_url: `${origin}/booking/${bookingId}`,
    cancel_url: `${origin}/booking/${bookingId}`,
  });
  return NextResponse.json({ url: session.url });
}
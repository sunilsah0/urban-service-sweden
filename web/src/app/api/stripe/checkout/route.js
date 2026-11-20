import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";
import { PLATFORM_FEE_PERCENT } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const u = await getUser(req);
  if (!u || u.role !== "CUSTOMER") return fail("Customers only", 403);
  const { bookingId } = await req.json();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, provider: true },
  });
  if (!booking || booking.customerId !== u.id) return fail("Not found", 404);
  if (booking.paid) return fail("Already paid");
  if (["REQUESTED", "CANCELLED"].includes(booking.status)) return fail("Wait until the provider accepts");

  const p = booking.provider;
  if (!p.stripeAccountId || !p.payoutsEnabled) return fail("This provider has not finished payout setup yet");

  const gross = booking.priceSek ?? booking.service?.priceSek;
  const charge = booking.payAmountSek ?? gross; // after RUT, if used
  const fee = Math.round((gross * PLATFORM_FEE_PERCENT) / 100);
  if (fee >= charge) return fail("Price is too low for payment");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "sek",
          unit_amount: charge * 100,
          product_data: { name: booking.title || booking.service?.title || "Service" },
        },
      },
    ],
    payment_intent_data: {
      application_fee_amount: fee * 100,
      transfer_data: { destination: p.stripeAccountId },
    },
    metadata: { bookingId },
    success_url: `${req.nextUrl.origin}/booking/${bookingId}`,
    cancel_url: `${req.nextUrl.origin}/booking/${bookingId}`,
  });
  return NextResponse.json({ url: session.url });
}
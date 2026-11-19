import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }
  if (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid") {
    const bookingId = event.data.object.metadata?.bookingId;
    const booking = bookingId
      ? await prisma.booking.findUnique({ where: { id: bookingId }, include: { service: true } })
      : null;
    if (booking) {
      const price = booking.priceSek ?? booking.service?.priceSek ?? 0;
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paid: true, paidAt: new Date(), platformFeeSek: Math.round(price * 0.15) },
      });
    }
  }
  return new Response("ok");
}
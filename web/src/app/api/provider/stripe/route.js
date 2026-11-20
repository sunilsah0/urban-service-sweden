import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function mine(req) {
  const u = await getUser(req);
  if (!u || u.role !== "PROVIDER") return null;
  const provider = await prisma.provider.findUnique({ where: { userId: u.id }, include: { user: true } });
  return provider?.status === "APPROVED" ? provider : null;
}

// Start or continue Stripe onboarding
export async function POST(req) {
  const provider = await mine(req);
  if (!provider) return fail("Approved providers only", 403);
  let accountId = provider.stripeAccountId;
  if (!accountId) {
    const acc = await stripe.accounts.create({
      type: "express",
      country: "SE",
      email: provider.user.email,
      capabilities: { transfers: { requested: true } },
      metadata: { providerId: provider.id },
    });
    accountId = acc.id;
    await prisma.provider.update({ where: { id: provider.id }, data: { stripeAccountId: accountId } });
  }
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${req.nextUrl.origin}/provider`,
    return_url: `${req.nextUrl.origin}/provider`,
    type: "account_onboarding",
  });
  return NextResponse.json({ url: link.url });
}

// Check onboarding status
export async function GET(req) {
  const provider = await mine(req);
  if (!provider) return fail("Approved providers only", 403);
  if (!provider.stripeAccountId) return NextResponse.json({ connected: false, enabled: false });
  const acc = await stripe.accounts.retrieve(provider.stripeAccountId);
  const enabled = acc.capabilities?.transfers === "active" && !!acc.payouts_enabled;
  if (enabled !== provider.payoutsEnabled)
    await prisma.provider.update({ where: { id: provider.id }, data: { payoutsEnabled: enabled } });
  return NextResponse.json({ connected: true, enabled });
}
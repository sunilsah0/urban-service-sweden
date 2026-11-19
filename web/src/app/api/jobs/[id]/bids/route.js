import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function POST(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  if (!u || u.role !== "PROVIDER") return fail("Providers only", 403);
  const provider = await prisma.provider.findUnique({ where: { userId: u.id } });
  if (!provider || provider.status !== "APPROVED") return fail("Your company is not approved yet", 403);
  const job = await prisma.jobPost.findUnique({ where: { id } });
  if (!job || job.status !== "OPEN") return fail("Job is not open", 400);
  const { priceSek, message } = await req.json();
  if (!(priceSek > 0)) return fail("Enter a price");
  const bid = await prisma.bid.upsert({
    where: { jobPostId_providerId: { jobPostId: id, providerId: provider.id } },
    update: { priceSek: Number(priceSek), message: message || "" },
    create: { jobPostId: id, providerId: provider.id, priceSek: Number(priceSek), message: message || "" },
  });
  return NextResponse.json(bid);
}
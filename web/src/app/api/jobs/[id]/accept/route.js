import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function POST(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  if (!u || u.role !== "CUSTOMER") return fail("Customers only", 403);
  const { bidId } = await req.json();
  const job = await prisma.jobPost.findUnique({ where: { id }, include: { bids: true } });
  if (!job || job.customerId !== u.id || job.status !== "OPEN") return fail("Job not available");
  const bid = job.bids.find((b) => b.id === bidId);
  if (!bid) return fail("Bid not found", 404);

  const [booking] = await prisma.$transaction([
    prisma.booking.create({
      data: {
        customerId: u.id,
        providerId: bid.providerId,
        jobPostId: job.id,
        title: job.title,
        priceSek: bid.priceSek,
        date: job.date,
        address: job.address,
        note: job.description,
        status: "ACCEPTED",
      },
    }),
    prisma.jobPost.update({ where: { id }, data: { status: "ASSIGNED" } }),
  ]);
  return NextResponse.json(booking);
}
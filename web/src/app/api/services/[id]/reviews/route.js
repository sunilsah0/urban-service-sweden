import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const { id } = await params;
  const where = { serviceId: id };
  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.review.aggregate({ where, _avg: { rating: true }, _count: true }),
  ]);
  return NextResponse.json({ avg: agg._avg.rating, count: agg._count, reviews });
}
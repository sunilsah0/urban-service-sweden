import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function GET(req) {
  const u = await getUser(req);
  if (!u) return fail("Please log in", 401);
  if (u.role === "CUSTOMER") {
    return NextResponse.json(
      await prisma.jobPost.findMany({
        where: { customerId: u.id },
        include: {
          category: true,
          booking: { select: { id: true } },
          bids: {
            include: { provider: { select: { companyName: true, city: true } } },
            orderBy: { priceSek: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    );
  }
  if (u.role === "PROVIDER") {
    const provider = await prisma.provider.findUnique({ where: { userId: u.id } });
    return NextResponse.json(
      await prisma.jobPost.findMany({
        where: { status: "OPEN", date: { gt: new Date() } },
        include: { category: true, bids: { where: { providerId: provider?.id || "none" } } },
        orderBy: { createdAt: "desc" },
      })
    );
  }
  return fail("Not allowed", 403);
}

export async function POST(req) {
  const u = await getUser(req);
  if (!u || u.role !== "CUSTOMER") return fail("Customers only", 403);
  const { title, description, categoryId, address, budgetSek, date } = await req.json();
  const when = new Date(date);
  if (!title || !description || !categoryId || !address || isNaN(when) || when < new Date())
    return fail("Fill all fields and choose a future date");
  const job = await prisma.jobPost.create({
    data: {
      customerId: u.id,
      categoryId,
      title,
      description,
      address,
      date: when,
      budgetSek: budgetSek ? Number(budgetSek) : null,
    },
  });
  return NextResponse.json(job);
}
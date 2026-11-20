import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  if (!u || u.role !== "ADMIN") return fail("Admins only", 403);
  const { status, fSkattVerified } = await req.json();
  const data = {};
  if (typeof fSkattVerified === "boolean") data.fSkattVerified = fSkattVerified;
  if (status) {
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) return fail("Bad status");
    if (status === "APPROVED") {
      const p = await prisma.provider.findUnique({ where: { id } });
      const verified = typeof fSkattVerified === "boolean" ? fSkattVerified : p.fSkattVerified;
      if (!p.orgNumber || !verified) return fail("Add the org number and verify F-skatt before approving");
    }
    data.status = status;
  }
  return NextResponse.json(await prisma.provider.update({ where: { id }, data }));
}
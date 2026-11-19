import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, hashPassword, fail } from "@/lib/auth";

async function myProvider(req) {
  const u = await getUser(req);
  if (!u || u.role !== "PROVIDER") return null;
  const p = await prisma.provider.findUnique({ where: { userId: u.id } });
  return p?.status === "APPROVED" ? p : null;
}

export async function GET(req) {
  const provider = await myProvider(req);
  if (!provider) return fail("Approved providers only", 403);
  const employees = await prisma.employee.findMany({
    where: { providerId: provider.id },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  const logs = await prisma.timeLog.findMany({ where: { employeeId: { in: employees.map((e) => e.id) } } });
  return NextResponse.json(
    employees.map((e) => ({
      ...e,
      minutes: Math.round(
        logs
          .filter((l) => l.employeeId === e.id)
          .reduce((s, l) => s + ((l.endedAt ? +l.endedAt : Date.now()) - +l.startedAt) / 60000, 0)
      ),
    }))
  );
}

export async function POST(req) {
  const provider = await myProvider(req);
  if (!provider) return fail("Approved providers only", 403);
  const { name, email, password, phone } = await req.json();
  if (!name || !email || !password || password.length < 8) return fail("Fill all fields (password min 8)");
  const lower = email.toLowerCase().trim();
  if (await prisma.user.findUnique({ where: { email: lower } })) return fail("Email already registered", 409);
  const user = await prisma.user.create({
    data: {
      name,
      email: lower,
      passwordHash: await hashPassword(password),
      role: "EMPLOYEE",
      employee: { create: { providerId: provider.id, phone: phone || "" } },
    },
  });
  return NextResponse.json({ id: user.id });
}
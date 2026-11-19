import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, sessionResponse, fail } from "@/lib/auth";

export async function POST(req) {
  const { name, email, password, role, companyName, city } = await req.json();
  if (!name || !email || !password || password.length < 8)
    return fail("Fill all fields (password min 8 characters)");
  const lower = email.toLowerCase().trim();
  if (await prisma.user.findUnique({ where: { email: lower } }))
    return fail("Email already registered", 409);

  const isProvider = role === "PROVIDER";
  const user = await prisma.user.create({
    data: {
      name,
      email: lower,
      passwordHash: await hashPassword(password),
      role: isProvider ? "PROVIDER" : "CUSTOMER",
      provider: isProvider
        ? { create: { companyName: companyName || name, city: city || "" } }
        : undefined,
    },
  });
  return sessionResponse(user);
}
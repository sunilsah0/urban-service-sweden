import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const hashPassword = (p) => bcrypt.hash(p, 10);
export const checkPassword = (p, hash) => bcrypt.compare(p, hash);

export function signToken(id, role) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

// Works for web (cookie) and mobile (Authorization header)
export async function getUser(req) {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const row = await prisma.user.findUnique({ where: { id: payload.sub }, select: { deletedAt: true } });
    if (!row || row.deletedAt) return null;
    return { id: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export async function sessionResponse(user) {
  const token = await signToken(user.id, user.role);
  const res = NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

export const fail = (error, status = 400) => NextResponse.json({ error }, { status });
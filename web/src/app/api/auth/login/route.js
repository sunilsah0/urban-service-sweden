import { prisma } from "@/lib/prisma";
import { checkPassword, sessionResponse, fail } from "@/lib/auth";

export async function POST(req) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({
    where: { email: String(email || "").toLowerCase().trim() },
  });
  if (!user || !(await checkPassword(password || "", user.passwordHash)))
    return fail("Wrong email or password", 401);
  return sessionResponse(user);
}
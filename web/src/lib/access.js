import { prisma } from "./prisma";

export async function getBookingAccess(u, id, include = {}) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      provider: true,
      employee: { include: { user: { select: { name: true } } } },
      ...include,
    },
  });
  if (!booking) return null;
  let who = null;
  if (u.role === "ADMIN") who = "admin";
  else if (booking.customerId === u.id) who = "customer";
  else if (booking.provider.userId === u.id) who = "provider";
  else if (booking.employee?.userId === u.id) who = "employee";
  return who ? { booking, who } : null;
}
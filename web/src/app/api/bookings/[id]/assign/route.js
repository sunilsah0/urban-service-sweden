import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, fail } from "@/lib/auth";
import { getBookingAccess } from "@/lib/access";
import { notify } from "@/lib/notify";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const u = await getUser(req);
  const access = u && (await getBookingAccess(u, id));
  if (!access || access.who !== "provider") return fail("Providers only", 403);
  if (!["REQUESTED", "ACCEPTED"].includes(access.booking.status)) return fail("Cannot assign now");
  const { employeeId } = await req.json();
  const emp = await prisma.employee.findFirst({
    where: { id: employeeId, providerId: access.booking.providerId, active: true },
  });
  if (!emp) return fail("Employee not found", 404);
  const updated = await prisma.booking.update({ where: { id }, data: { employeeId } });
    after(() =>
        notify(emp.userId, {
         title: "New job / Nytt jobb",
         body: access.booking.title || "A job was assigned to you / Ett jobb har tilldelats dig",
         path: "/",
    })
    );
return NextResponse.json(updated);
}
import { prisma } from "./prisma";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function notify(userId, { title, body, path = "/" }) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) return;
    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const jobs = [];
    if (process.env.RESEND_API_KEY) {
      jobs.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "HemHjälp <onboarding@resend.dev>",
            to: [user.email],
            subject: title,
            html: `<p>${esc(body)}</p><p><a href="${site}${path}">${site}${path}</a></p>`,
          }),
        })
      );
    }
    if (user.pushToken) {
      jobs.push(
        fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: user.pushToken, title, body, data: { path } }),
        })
      );
    }
    await Promise.allSettled(jobs);
  } catch (e) {
    console.error("notify failed", e);
  }
}
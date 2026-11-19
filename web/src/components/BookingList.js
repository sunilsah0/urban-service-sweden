"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

export function actionsFor(role, status) {
  if (role === "PROVIDER")
    return (
      {
        REQUESTED: [["ACCEPTED", "accept"], ["CANCELLED", "decline"]],
        ACCEPTED: [["EN_ROUTE", "on_my_way"], ["CANCELLED", "cancel"]],
        EN_ROUTE: [["IN_PROGRESS", "start"]],
        IN_PROGRESS: [["COMPLETED", "complete"]],
      }[status] || []
    );
  if (role === "EMPLOYEE")
    return (
      {
        ACCEPTED: [["EN_ROUTE", "on_my_way"]],
        EN_ROUTE: [["IN_PROGRESS", "start"]],
        IN_PROGRESS: [["COMPLETED", "complete"]],
      }[status] || []
    );
  if (role === "CUSTOMER")
    return ["REQUESTED", "ACCEPTED"].includes(status) ? [["CANCELLED", "cancel"]] : [];
  return [];
}

export default function BookingList({ bookings, role, onAction }) {
  const { t } = useLang();
  if (!bookings.length) return <p className="text-gray-500">{t("empty")}</p>;
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div key={b.id} className="rounded-xl bg-white p-4 shadow">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold">
                {b.title || b.service?.title} · {b.priceSek ?? b.service?.priceSek} SEK
                {b.paid && <span className="ml-2 text-emerald-700">✔ {t("paid")}</span>}
              </div>
              <div className="text-sm text-gray-600">{new Date(b.date).toLocaleString()} · {b.address}</div>
              <div className="text-sm text-gray-600">{t("by")} {b.provider.companyName} · {b.customer.name}</div>
              {b.employee && <div className="text-sm text-gray-600">👷 {b.employee.user.name}</div>}
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{t(b.status)}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {onAction && actionsFor(role, b.status).map(([status, label]) => (
              <button key={status} onClick={() => onAction(b.id, status)} className="rounded border px-3 py-1 text-sm hover:bg-gray-100">
                {t(label)}
              </button>
            ))}
            <Link href={`/booking/${b.id}`} className="rounded border px-3 py-1 text-sm hover:bg-gray-100">{t("details")}</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
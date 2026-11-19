"use client";
import { useLang } from "@/lib/i18n";

function actionsFor(role, status) {
  if (role === "PROVIDER")
    return (
      {
        REQUESTED: [["ACCEPTED", "accept"], ["CANCELLED", "decline"]],
        ACCEPTED: [["IN_PROGRESS", "start"], ["CANCELLED", "cancel"]],
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
              <div className="font-semibold">{b.service.title} · {b.service.priceSek} SEK</div>
              <div className="text-sm text-gray-600">
                {new Date(b.date).toLocaleString()} · {b.address}
              </div>
              <div className="text-sm text-gray-600">
                {t("by")} {b.provider.companyName} · {b.customer.name}
              </div>
              {b.note && <div className="text-sm italic">{b.note}</div>}
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {t(b.status)}
            </span>
          </div>
          {onAction && (
            <div className="mt-3 flex gap-2">
              {actionsFor(role, b.status).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => onAction(b.id, status)}
                  className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                >
                  {t(label)}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
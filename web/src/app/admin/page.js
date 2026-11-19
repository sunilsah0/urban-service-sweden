"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import BookingList from "@/components/BookingList";

export default function Admin() {
  const { t } = useLang();
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setProviders(await api("/admin/providers"));
      setBookings(await api("/bookings"));
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    await api(`/admin/providers/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  if (error) return <p className="text-red-600">{error}</p>;
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("providers")}</h2>
        <div className="space-y-2">
          {providers.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow">
              <div>
                <div className="font-semibold">{p.companyName} · {p.city}</div>
                <div className="text-sm text-gray-600">{p.user.name} · {p.user.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">{t(p.status)}</span>
                <button onClick={() => setStatus(p.id, "APPROVED")} className="rounded border px-3 py-1 text-sm">{t("approve")}</button>
                <button onClick={() => setStatus(p.id, "REJECTED")} className="rounded border px-3 py-1 text-sm">{t("reject")}</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("bookings")}</h2>
        <BookingList bookings={bookings} role="ADMIN" />
      </section>
    </div>
  );
}
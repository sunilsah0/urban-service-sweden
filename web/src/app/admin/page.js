"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import BookingList from "@/components/BookingList";

export default function Admin() {
  const { t } = useLang();
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [denied, setDenied] = useState(false);

  async function load() {
    try {
      setProviders(await api("/admin/providers"));
      setServices(await api("/admin/services"));
      setBookings(await api("/bookings"));
    } catch (e) { setError(e.message); setDenied(true); }
  }
  useEffect(() => { load(); }, []);

  async function update(path, body) {
    setError("");
    try { await api(path, { method: "PATCH", body: JSON.stringify(body) }); load(); }
    catch (e) { setError(e.message); }
  }

  if (denied) return <p className="text-red-600">{error}</p>;
  return (
    <div className="space-y-8">
      {error && <p className="text-red-600">{error}</p>}

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("providers")}</h2>
        <div className="space-y-2">
          {providers.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow">
              <div>
                <div className="font-semibold">{p.companyName} · {p.city}</div>
                <div className="text-sm text-gray-600">{p.user.name} · {p.user.email}</div>
                <div className="text-sm">{t("org_number")}: {p.orgNumber || "-"} · {p.fSkattVerified ? `✔ ${t("f_skatt_ok")}` : t("f_skatt_pending")}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">{t(p.status)}</span>
                <button onClick={() => update(`/admin/providers/${p.id}`, { fSkattVerified: !p.fSkattVerified })} className="rounded border px-3 py-1 text-sm">{t("verify_fskatt")}</button>
                <button onClick={() => update(`/admin/providers/${p.id}`, { status: "APPROVED" })} className="rounded border px-3 py-1 text-sm">{t("approve")}</button>
                <button onClick={() => update(`/admin/providers/${p.id}`, { status: "REJECTED" })} className="rounded border px-3 py-1 text-sm">{t("reject")}</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("my_services")}</h2>
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow">
              <span>{s.title} · {s.provider.companyName} · {s.priceSek} SEK</span>
              <button onClick={() => update(`/admin/services/${s.id}`, { active: !s.active })} className="rounded border px-3 py-1 text-sm">
                {s.active ? t("hide") : t("show")}
              </button>
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
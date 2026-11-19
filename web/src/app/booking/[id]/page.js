"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, btn, input } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import Chat from "@/components/Chat";
import { actionsFor } from "@/components/BookingList";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });

export default function BookingPage() {
  const { id } = useParams();
  const { t } = useLang();
  const [b, setB] = useState(null);
  const [me, setMe] = useState(null);
  const [emps, setEmps] = useState([]);
  const [geo, setGeo] = useState(null);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = () => api(`/bookings/${id}`).then(setB).catch((e) => setError(e.message));

  useEffect(() => {
    api("/auth/me").then((d) => setMe(d.user));
    load();
    const i = setInterval(load, 8000);
    return () => clearInterval(i);
  }, [id]);

  useEffect(() => {
    if (b?.who === "provider") api("/provider/employees").then(setEmps).catch(() => {});
  }, [b?.who]);

  useEffect(() => {
    if (!b || !["EN_ROUTE", "IN_PROGRESS"].includes(b.status) || b.who === "employee") { setGeo(null); return; }
    const poll = () => api(`/bookings/${id}/location`).then(setGeo).catch(() => {});
    poll();
    const i = setInterval(poll, 10000);
    return () => clearInterval(i);
  }, [id, b?.status, b?.who]);

  const run = (fn) => async (...a) => { try { await fn(...a); load(); } catch (e) { setError(e.message); } };
  const act = run((status) => api(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }));
  const assign = run((employeeId) => api(`/bookings/${id}/assign`, { method: "PATCH", body: JSON.stringify({ employeeId }) }));
  const review = run((e) => { e.preventDefault(); return api(`/bookings/${id}/review`, { method: "POST", body: JSON.stringify({ rating, comment }) }); });
  async function pay() {
    try {
      const { url } = await api("/stripe/checkout", { method: "POST", body: JSON.stringify({ bookingId: id }) });
      window.location.href = url;
    } catch (e) { setError(e.message); }
  }

  if (!b) return <p className="text-red-600">{error || "..."}</p>;
  const price = b.priceSek ?? b.service?.priceSek;
  const actions = actionsFor(b.who.toUpperCase(), b.status);
  const points = geo?.point
    ? [{ id: "w", lat: geo.point.lat, lng: geo.point.lng, label: b.employee?.user.name || "Worker" }]
    : [];
  const canPay = b.who === "customer" && !b.paid && ["ACCEPTED", "EN_ROUTE", "IN_PROGRESS", "COMPLETED"].includes(b.status);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <div className="space-y-1 rounded-xl bg-white p-5 shadow">
          <div className="flex justify-between gap-2">
            <h1 className="text-xl font-bold">{b.title || b.service?.title}</h1>
            <span className="h-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{t(b.status)}</span>
          </div>
          <p className="text-sm text-gray-600">{new Date(b.date).toLocaleString()} · {b.address}</p>
          <p className="font-semibold">{price} SEK {b.paid && <span className="text-emerald-700">· ✔ {t("paid")}</span>}</p>
          <p className="text-sm">{t("assigned")}: {b.employee?.user.name || t("unassigned")}</p>
          <p className="text-sm">{t("worked")}: {Math.floor(b.minutesWorked / 60)} h {b.minutesWorked % 60} min</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {actions.map(([status, label]) => (
              <button key={status} onClick={() => act(status)} className="rounded border px-3 py-1 text-sm hover:bg-gray-100">{t(label)}</button>
            ))}
            {canPay && <button onClick={pay} className={btn}>💳 {t("pay")}</button>}
          </div>
        </div>

        {b.who === "provider" && ["REQUESTED", "ACCEPTED"].includes(b.status) && (
          <div className="rounded-xl bg-white p-5 shadow">
            <label className="text-sm font-semibold">{t("assign")}</label>
            <select className={input} value={b.employeeId || ""} onChange={(e) => assign(e.target.value)}>
              <option value="">-</option>
              {emps.map((e) => <option key={e.id} value={e.id}>{e.user.name}</option>)}
            </select>
          </div>
        )}

        {b.who === "customer" && b.status === "COMPLETED" && !b.review && (
          <form onSubmit={review} className="space-y-2 rounded-xl bg-white p-5 shadow">
            <h2 className="font-semibold">{t("rate")}</h2>
            <select className={input} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"⭐".repeat(n)}</option>)}
            </select>
            <textarea className={input} value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className={btn}>{t("save")}</button>
          </form>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-2 font-semibold">{t("live_track")}</h2>
          {geo?.point ? <LiveMap points={points} trail={geo.trail} /> : <p className="text-sm text-gray-500">{t("tracking_off")}</p>}
        </div>
        {b.who !== "admin" && <Chat bookingId={id} meId={me?.id} />}
      </div>
    </div>
  );
}
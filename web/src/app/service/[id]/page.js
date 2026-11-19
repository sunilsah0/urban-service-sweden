"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, btn, input } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function ServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLang();
  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { api(`/services/${id}`).then(setService).catch((e) => setMsg(e.message)); }, [id]);

  async function book(e) {
    e.preventDefault();
    setMsg("");
    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({ serviceId: id, date: new Date(date).toISOString(), address, note }),
      });
      setMsg(t("booked_ok"));
      setTimeout(() => router.push("/bookings"), 800);
    } catch (err) {
      if (err.status === 401) router.push("/login");
      else setMsg(err.message);
    }
  }

  if (!service) return <p>{msg || "..."}</p>;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        {service.imageUrl && <img src={service.imageUrl} alt={service.title} className="mb-4 w-full rounded-xl object-cover" />}
        <h1 className="text-2xl font-bold">{service.title}</h1>
        <p className="text-gray-600">{service.provider.companyName} · {service.provider.city}</p>
        <p className="my-3">{service.description}</p>
        <p className="text-xl font-bold text-emerald-700">{service.priceSek} SEK · {service.durationMin} {t("min")}</p>
      </div>
      <form onSubmit={book} className="space-y-3 rounded-xl bg-white p-5 shadow">
        <label className="block text-sm">{t("date")}
          <input type="datetime-local" required className={input} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block text-sm">{t("address")}
          <input required className={input} value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label className="block text-sm">{t("note")}
          <textarea className={input} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button className={btn}>{t("book")}</button>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      </form>
    </div>
  );
}
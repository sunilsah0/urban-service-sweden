"use client";
import { useEffect, useState } from "react";
import { api, uploadImage, btn, input } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import BookingList from "@/components/BookingList";
import ProviderSettings from "@/components/ProviderSettings";

const empty = { title: "", description: "", priceSek: "", durationMin: "", categoryId: "" };

export default function ProviderDashboard() {
  const { t, lang } = useLang();
  const [provider, setProvider] = useState(null);
  const [cats, setCats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function load() {
    try {
      setProvider(await api("/provider/me"));
      setBookings(await api("/bookings"));
      setCats(await api("/categories"));
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function addService(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const imageUrl = file ? await uploadImage(file) : null;
      await api("/services", { method: "POST", body: JSON.stringify({ ...form, imageUrl }) });
      setForm(empty); setFile(null);
      await load();
    } catch (err) { setError(err.message); }
    setBusy(false);
  }
  async function act(id, status) {
    await api(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  if (error && !provider) return <p className="text-red-600">{error}</p>;
  if (!provider) return <p>...</p>;
 if (provider.status === "PENDING")
  return (
    <div className="space-y-4">
      <p className="rounded bg-yellow-100 p-4">{t("pending_msg")}</p>
      <ProviderSettings provider={provider} onSaved={load} />
    </div>
  );
 if (provider.status === "REJECTED") return <p className="rounded bg-red-100 p-4">{t("rejected_msg")}</p>;
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{provider.companyName}</h1>
      <ProviderSettings provider={provider} onSaved={load} />
      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("bookings")}</h2>
        <BookingList bookings={bookings} role="PROVIDER" onAction={act} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("add_service")}</h2>
        <form onSubmit={addService} className="grid max-w-xl gap-3 rounded-xl bg-white p-5 shadow">
          <input required placeholder={t("title")} className={input} value={form.title} onChange={set("title")} />
          <textarea required placeholder={t("description")} className={input} value={form.description} onChange={set("description")} />
          <select required className={input} value={form.categoryId} onChange={set("categoryId")}>
            <option value="">{t("category")}</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{lang === "sv" ? c.nameSv : c.nameEn}</option>)}
          </select>
          <input required type="number" placeholder={t("price_sek")} className={input} value={form.priceSek} onChange={set("priceSek")} />
          <input required type="number" placeholder={t("duration")} className={input} value={form.durationMin} onChange={set("durationMin")} />
          <label className="text-sm">{t("image")}
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          <button disabled={busy} className={btn}>{busy ? "..." : t("save")}</button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("my_services")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {provider.services.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-xl bg-white shadow">
              {s.imageUrl && <img src={s.imageUrl} alt={s.title} className="h-32 w-full object-cover" />}
              <div className="p-3">
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-emerald-700">{s.priceSek} SEK · {s.durationMin} {t("min")}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
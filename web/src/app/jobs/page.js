"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, btn, input } from "@/lib/api";
import { useLang } from "@/lib/i18n";

const empty = { title: "", description: "", categoryId: "", address: "", budgetSek: "", date: "" };

export default function Jobs() {
  const { t, lang } = useLang();
  const [me, setMe] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [cats, setCats] = useState([]);
  const [f, setF] = useState(empty);
  const [bid, setBid] = useState({});
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = () => api("/jobs").then(setJobs).catch((e) => setError(e.message));
  useEffect(() => {
    api("/auth/me").then((d) => setMe(d.user));
    api("/categories").then(setCats);
    load();
  }, []);

  const run = (fn) => async (...a) => { setError(""); try { await fn(...a); load(); } catch (e) { setError(e.message); } };
  const post = run((e) => {
    e.preventDefault();
    return api("/jobs", { method: "POST", body: JSON.stringify({ ...f, date: new Date(f.date).toISOString() }) }).then(() => setF(empty));
  });
  const accept = run((jobId, bidId) => api(`/jobs/${jobId}/accept`, { method: "POST", body: JSON.stringify({ bidId }) }));
  const sendBid = run((jobId) => api(`/jobs/${jobId}/bids`, { method: "POST", body: JSON.stringify(bid[jobId] || {}) }));
  const setB = (jobId, k) => (e) => setBid({ ...bid, [jobId]: { ...(bid[jobId] || {}), [k]: e.target.value } });

  if (!me) return <p>...</p>;
  return (
    <div className="space-y-6">
      {error && <p className="text-red-600">{error}</p>}

      {me.role === "CUSTOMER" && (
        <form onSubmit={post} className="grid max-w-xl gap-2 rounded-xl bg-white p-5 shadow">
          <h2 className="font-semibold">{t("post_job")}</h2>
          <input required placeholder={t("title")} className={input} value={f.title} onChange={set("title")} />
          <textarea required placeholder={t("description")} className={input} value={f.description} onChange={set("description")} />
          <select required className={input} value={f.categoryId} onChange={set("categoryId")}>
            <option value="">{t("category")}</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{lang === "sv" ? c.nameSv : c.nameEn}</option>)}
          </select>
          <input required placeholder={t("address")} className={input} value={f.address} onChange={set("address")} />
          <input type="number" placeholder={t("budget")} className={input} value={f.budgetSek} onChange={set("budgetSek")} />
          <input required type="datetime-local" className={input} value={f.date} onChange={set("date")} />
          <button className={btn}>{t("post_job")}</button>
        </form>
      )}

      <h2 className="text-xl font-semibold">{me.role === "CUSTOMER" ? t("my_jobs") : t("open_jobs")}</h2>
      {!jobs.length && <p className="text-gray-500">{t("empty")}</p>}
      {jobs.map((j) => (
        <div key={j.id} className="space-y-2 rounded-xl bg-white p-4 shadow">
          <div className="flex justify-between">
            <div className="font-semibold">{j.title} · {lang === "sv" ? j.category.nameSv : j.category.nameEn}</div>
            <span className="text-xs font-semibold">{t(j.status)}</span>
          </div>
          <p className="text-sm">{j.description}</p>
          <p className="text-sm text-gray-600">{new Date(j.date).toLocaleString()} · {j.address} {j.budgetSek && `· ${t("budget")}: ${j.budgetSek}`}</p>

          {me.role === "CUSTOMER" && (
            <div className="space-y-1">
              <div className="text-sm font-semibold">{t("bids")} ({j.bids.length})</div>
              {j.bids.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm">
                  <span>{b.provider.companyName} · <b>{b.priceSek} SEK</b> {b.message && `· ${b.message}`}</span>
                  {j.status === "OPEN" && <button onClick={() => accept(j.id, b.id)} className="rounded border px-2 py-1">{t("accept_bid")}</button>}
                </div>
              ))}
              {j.booking && <Link href={`/booking/${j.booking.id}`} className="text-sm underline">{t("details")}</Link>}
            </div>
          )}

          {me.role === "PROVIDER" && (
            <div className="flex flex-wrap gap-2">
              <input type="number" placeholder={t("price_sek")} className="w-32 rounded border px-2 py-1" defaultValue={j.bids[0]?.priceSek} onChange={setB(j.id, "priceSek")} />
              <input placeholder={t("bid_msg")} className="flex-1 rounded border px-2 py-1" defaultValue={j.bids[0]?.message} onChange={setB(j.id, "message")} />
              <button onClick={() => sendBid(j.id)} className={btn}>{t("place_bid")}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
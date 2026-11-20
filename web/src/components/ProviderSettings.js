"use client";
import { useEffect, useState } from "react";
import { api, btn, input } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { CITIES } from "@/lib/cities";

export default function ProviderSettings({ provider, onSaved }) {
  const { t } = useLang();
  const [f, setF] = useState({ orgNumber: provider.orgNumber, city: provider.city, description: provider.description });
  const [pay, setPay] = useState(null);
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (provider.status === "APPROVED") api("/provider/stripe").then(setPay).catch(() => {});
  }, [provider.status]);

  async function save(e) {
    e.preventDefault();
    try { await api("/provider/me", { method: "PATCH", body: JSON.stringify(f) }); setMsg("✔"); onSaved(); }
    catch (err) { setMsg(err.message); }
  }
  async function connect() {
    try { const { url } = await api("/provider/stripe", { method: "POST" }); window.location.href = url; }
    catch (err) { setMsg(err.message); }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form onSubmit={save} className="space-y-2 rounded-xl bg-white p-5 shadow">
        <h2 className="font-semibold">{t("profile")}</h2>
        <input className={input} list="cities2" placeholder={t("city")} value={f.city} onChange={set("city")} />
        <datalist id="cities2">{CITIES.map((c) => <option key={c.slug} value={c.name} />)}</datalist>
        <input className={input} placeholder={t("org_number")} value={f.orgNumber} onChange={set("orgNumber")} />
        <textarea className={input} placeholder={t("description")} value={f.description} onChange={set("description")} />
        <p className="text-xs">{provider.fSkattVerified ? `✔ ${t("f_skatt_ok")}` : t("f_skatt_pending")}</p>
        <button className={btn}>{t("save")}</button> <span className="text-sm">{msg}</span>
      </form>
      {provider.status === "APPROVED" && (
        <div className="space-y-2 rounded-xl bg-white p-5 shadow">
          <h2 className="font-semibold">{t("payouts")}</h2>
          <p className="text-sm">{pay?.enabled ? `✔ ${t("payouts_ready")}` : t("payouts_setup")}</p>
          {!pay?.enabled && <button onClick={connect} className={btn}>{t("payouts")}</button>}
        </div>
      )}
    </div>
  );
}
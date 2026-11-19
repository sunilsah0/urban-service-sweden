"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, btn, input } from "@/lib/api";
import { useLang } from "@/lib/i18n";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });
const empty = { name: "", email: "", password: "", phone: "" };

export default function Team() {
  const { t } = useLang();
  const [emps, setEmps] = useState([]);
  const [live, setLive] = useState([]);
  const [f, setF] = useState(empty);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const loadEmps = () => api("/provider/employees").then(setEmps).catch((e) => setError(e.message));
  const loadLive = () => api("/provider/live").then(setLive).catch(() => {});
  useEffect(() => {
    loadEmps(); loadLive();
    const i = setInterval(loadLive, 10000);
    return () => clearInterval(i);
  }, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/provider/employees", { method: "POST", body: JSON.stringify(f) });
      setF(empty);
      loadEmps();
    } catch (err) { setError(err.message); }
  }

  const points = live.filter((j) => j.point).map((j) => ({
    id: j.id, lat: j.point.lat, lng: j.point.lng, label: `${j.employeeName}: ${j.title}`,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <form onSubmit={add} className="space-y-2 rounded-xl bg-white p-5 shadow">
          <h2 className="font-semibold">{t("add_employee")}</h2>
          <input required placeholder={t("name")} className={input} value={f.name} onChange={set("name")} />
          <input required type="email" placeholder={t("email")} className={input} value={f.email} onChange={set("email")} />
          <input required type="password" placeholder={t("password")} className={input} value={f.password} onChange={set("password")} />
          <input placeholder={t("phone")} className={input} value={f.phone} onChange={set("phone")} />
          <button className={btn}>{t("save")}</button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
        <div className="space-y-2">
          {emps.map((e) => (
            <div key={e.id} className="flex justify-between rounded-xl bg-white p-4 shadow">
              <div>
                <div className="font-semibold">{e.user.name}</div>
                <div className="text-sm text-gray-600">{e.user.email} {e.phone && `· ${e.phone}`}</div>
              </div>
              <div className="text-sm font-semibold text-emerald-700">
                {t("hours")}: {Math.floor(e.minutes / 60)} h {e.minutes % 60} min
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 rounded-xl bg-white p-5 shadow">
        <h2 className="font-semibold">{t("live")}</h2>
        <LiveMap points={points} />
        {!live.length && <p className="text-sm text-gray-500">{t("no_live")}</p>}
        {live.map((j) => (
          <Link key={j.id} href={`/booking/${j.id}`} className="block text-sm underline">
            {j.employeeName} · {j.title} · {t(j.status)}
          </Link>
        ))}
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { api, btn, input } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function Register() {
  const { t } = useLang();
  const [f, setF] = useState({ name: "", email: "", password: "", role: "CUSTOMER", companyName: "", city: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    try {
      const { user } = await api("/auth/register", { method: "POST", body: JSON.stringify(f) });
      window.location.href = user.role === "PROVIDER" ? "/provider" : "/";
    } catch (err) { setError(err.message); }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3 rounded-xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">{t("register")}</h1>
      <select className={input} value={f.role} onChange={set("role")}>
        <option value="CUSTOMER">{t("customer")}</option>
        <option value="PROVIDER">{t("provider")}</option>
      </select>
      <input required placeholder={t("name")} className={input} value={f.name} onChange={set("name")} />
      <input type="email" required placeholder={t("email")} className={input} value={f.email} onChange={set("email")} />
      <input type="password" required placeholder={t("password")} className={input} value={f.password} onChange={set("password")} />
      {f.role === "PROVIDER" && (
        <>
          <input required placeholder={t("company")} className={input} value={f.companyName} onChange={set("companyName")} />
          <input required placeholder={t("city")} className={input} value={f.city} onChange={set("city")} />
        </>
      )}
      <button className={btn}>{t("register")}</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
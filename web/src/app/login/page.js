"use client";
import { useState } from "react";
import { api, btn, input } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function Login() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const { user } = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      window.location.href = user.role === "ADMIN" ? "/admin" : user.role === "PROVIDER" ? "/provider" : "/";
    } catch (err) { setError(err.message); }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3 rounded-xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">{t("login")}</h1>
      <input type="email" required placeholder={t("email")} className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" required placeholder={t("password")} className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className={btn}>{t("login")}</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
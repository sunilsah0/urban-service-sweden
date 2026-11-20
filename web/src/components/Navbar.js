"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLang, LANGS } from "@/lib/i18n";

export default function Navbar() {
  const { t, lang, setLang } = useLang();
  const [user, setUser] = useState(null);

  useEffect(() => { api("/auth/me").then((d) => setUser(d.user)).catch(() => {}); }, []);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <nav className="relative z-20 flex flex-wrap items-center justify-between gap-3 bg-white px-6 py-3 shadow">
      <Link href="/" className="text-xl font-bold text-emerald-700">HemHjälp</Link>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {user?.role === "CUSTOMER" && (<><Link href="/bookings">{t("my_bookings")}</Link><Link href="/jobs">{t("jobs")}</Link></>)}
        {user?.role === "PROVIDER" && (<><Link href="/provider">{t("dashboard")}</Link><Link href="/provider/team">{t("team")}</Link><Link href="/jobs">{t("jobs")}</Link></>)}
        {user?.role === "ADMIN" && <Link href="/admin">{t("admin")}</Link>}
        {user ? (
          <button onClick={logout}>{t("logout")} ({user.name})</button>
        ) : (
          <>
            <Link href="/login">{t("login")}</Link>
            <Link href="/register">{t("register")}</Link>
          </>
        )}
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded border px-2 py-1">
          {Object.entries(LANGS).map(([code, l]) => <option key={code} value={code}>{l.label}</option>)}
        </select>
      </div>
    </nav>
  );
}
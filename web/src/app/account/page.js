"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function Account() {
  const { t } = useLang();
  const [error, setError] = useState("");

  async function del() {
    if (!confirm(t("delete_confirm"))) return;
    try { await api("/account", { method: "DELETE" }); window.location.href = "/"; }
    catch (e) { setError(e.message); }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">{t("account")}</h1>
      <a href="/api/account" className="inline-block rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white">{t("export_data")}</a>
      <div>
        <button onClick={del} className="rounded-lg border border-red-500 px-4 py-2 font-medium text-red-600">{t("delete_account")}</button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
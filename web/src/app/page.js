"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function Home() {
  const { t, lang } = useLang();
  const [cats, setCats] = useState([]);
  useEffect(() => { api("/categories").then(setCats).catch(() => {}); }, []);

  return (
    <div>
      <section className="rounded-2xl bg-emerald-600 p-10 text-white">
        <h1 className="text-3xl font-bold md:text-5xl">{t("home_title")}</h1>
        <p className="mt-3 text-lg">{t("home_sub")}</p>
      </section>
      <h2 className="mb-4 mt-8 text-xl font-semibold">{t("categories")}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cats.map((c) => (
          <Link key={c.id} href={`/c/${c.slug}`} className="rounded-xl bg-white p-6 text-center shadow hover:shadow-md">
            <div className="text-4xl">{c.icon}</div>
            <div className="mt-2 font-medium">{lang === "sv" ? c.nameSv : c.nameEn}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
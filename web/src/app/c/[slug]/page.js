"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function CategoryPage() {
  const { slug } = useParams();
  const { t } = useLang();
  const [services, setServices] = useState([]);
  useEffect(() => { api(`/services?category=${slug}`).then(setServices).catch(() => {}); }, [slug]);

  if (!services.length) return <p className="text-gray-500">{t("empty")}</p>;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {services.map((s) => (
        <Link key={s.id} href={`/service/${s.id}`} className="overflow-hidden rounded-xl bg-white shadow hover:shadow-md">
          {s.imageUrl && <img src={s.imageUrl} alt={s.title} className="h-40 w-full object-cover" />}
          <div className="p-4">
            <div className="font-semibold">{s.title}</div>
            <div className="text-sm text-gray-600">{s.provider.companyName} · {s.provider.city}</div>
            <div className="mt-2 font-bold text-emerald-700">{s.priceSek} SEK · {s.durationMin} {t("min")}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { CITIES } from "@/lib/cities";
import { RUT_PERCENT } from "@/lib/pricing";

export default function ServiceGrid({ category, services, cityName }) {
  const { t, lang } = useLang();
  const name = lang === "sv" ? category.nameSv : category.nameEn;
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">
        {category.icon} {cityName ? `${name} ${t("in")} ${cityName}` : name}
        {category.taxType === "RUT" && (
          <span className="ml-3 rounded-full bg-emerald-100 px-3 py-1 align-middle text-xs font-semibold text-emerald-800">
            RUT −{RUT_PERCENT}%
          </span>
        )}
      </h1>
      {!cityName && (
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {CITIES.map((c) => (
            <Link key={c.slug} href={`/c/${category.slug}/${c.slug}`} className="rounded-full border px-3 py-1 hover:bg-gray-100">
              {c.name}
            </Link>
          ))}
        </div>
      )}
      {!services.length ? (
        <p className="text-gray-500">{t("empty")}</p>
      ) : (
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
      )}
    </div>
  );
}
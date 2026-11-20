"use client";
import { useLang } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";

export default function LegalPage({ doc }) {
  const { lang, t } = useLang();
  const sections = LEGAL[doc][lang] || LEGAL[doc].en;
  return (
    <article className="mx-auto max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">{t(doc)}</h1>
      {sections.map(([h, text]) => (
        <section key={h}>
          <h2 className="font-semibold">{h}</h2>
          <p className="text-sm text-gray-700">{text}</p>
        </section>
      ))}
    </article>
  );
}
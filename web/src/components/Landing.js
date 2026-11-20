"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { api, btn } from "@/lib/api";
import { useLang } from "@/lib/i18n";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });
const card = "reveal rounded-2xl bg-white/85 p-6 shadow-lg backdrop-blur";

export default function Landing() {
  const { t, lang } = useLang();
  const progress = useRef(0);
  const root = useRef(null);
  const [cats, setCats] = useState([]);

  useEffect(() => { api("/categories").then(setCats).catch(() => {}); }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return () => window.removeEventListener("scroll", onScroll);

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    let raf;
    const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((el) =>
        gsap.from(el, { y: 60, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } })
      );
    }, root);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      ctx.revert();
      window.removeEventListener("scroll", onScroll);
    };
  }, [cats.length]);

  return (
    <div ref={root}>
      <Scene3D progress={progress} />
      <div className="relative z-10">
        <section className="flex min-h-[85vh] items-center">
          <div className="reveal max-w-xl rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur">
            <h1 className="text-4xl font-extrabold md:text-6xl">{t("home_title")}</h1>
            <p className="mt-4 text-lg">{t("home_sub")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#services" className={btn}>{t("browse")}</a>
              <Link href="/register" className="rounded-lg border border-emerald-600 bg-white px-4 py-2 font-medium text-emerald-700">
                {t("become_provider")}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <h2 className="reveal mb-6 text-3xl font-bold">{t("how_title")}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className={card}>
                <div className="text-3xl font-extrabold text-emerald-600">{n}</div>
                <h3 className="mt-2 font-semibold">{t(`step${n}_t`)}</h3>
                <p className="text-sm text-gray-700">{t(`step${n}_d`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="py-16">
          <h2 className="reveal mb-6 text-3xl font-bold">{t("categories")}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {cats.map((c) => (
              <Link key={c.id} href={`/c/${c.slug}`} className={`${card} text-center transition hover:-translate-y-1`}>
                <div className="text-4xl">{c.icon}</div>
                <div className="mt-2 text-sm font-medium">{lang === "sv" ? c.nameSv : c.nameEn}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-16">
          <h2 className="reveal mb-6 text-3xl font-bold">{t("why_title")}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className={card}>
                <h3 className="font-semibold">{t(`why${n}_t`)}</h3>
                <p className="text-sm text-gray-700">{t(`why${n}_d`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="reveal rounded-2xl bg-emerald-600 p-10 text-white shadow-lg">
            <h2 className="text-3xl font-bold">{t("provider_cta_t")}</h2>
            <p className="mt-2">{t("provider_cta_d")}</p>
            <Link href="/register" className="mt-5 inline-block rounded-lg bg-white px-4 py-2 font-semibold text-emerald-700">
              {t("become_provider")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
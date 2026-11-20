"use client";
import { createContext, useContext, useEffect, useState } from "react";
import en from "@/locales/en";
import sv from "@/locales/sv";

// To add a language: create src/locales/xx.js (copy en.js and translate it),
// import it above and add one line here. Missing keys fall back to English.
export const LANGS = {
  en: { label: "English", dict: en },
  sv: { label: "Svenska", dict: sv },
  // de: { label: "Deutsch", dict: de },
  // ar: { label: "العربية", dict: ar, rtl: true },
};

const Ctx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && LANGS[saved]) return setLangState(saved);
    const browser = navigator.language.slice(0, 2);
    if (LANGS[browser]) setLangState(browser);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang].rtl ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  const t = (key) => LANGS[lang].dict[key] ?? en[key] ?? key;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
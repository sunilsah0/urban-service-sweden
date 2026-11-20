"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative z-10 mt-10 bg-white px-6 py-6 text-sm text-gray-600">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3">
        <span>© {new Date().getFullYear()} HemHjälp</span>
        <div className="flex gap-4">
          <Link href="/privacy">{t("privacy")}</Link>
          <Link href="/terms">{t("terms")}</Link>
          <Link href="/account">{t("account")}</Link>
        </div>
      </div>
    </footer>
  );
}
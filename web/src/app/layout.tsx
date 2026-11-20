import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "HemHjälp | Hemtjänster i Sverige",
  description: "Boka städning, barnpassning, trädgård och mer. Verifierade företag, tydliga priser och RUT-avdrag.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900" suppressHydrationWarning>
        <LangProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl p-4">{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
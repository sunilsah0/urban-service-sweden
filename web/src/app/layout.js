import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "HemHjälp | Home services in Sweden",
  description: "Book trusted home services: cleaning, nanny, garden and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <LangProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl p-4">{children}</main>
        </LangProvider>
      </body>
    </html>
  );
}
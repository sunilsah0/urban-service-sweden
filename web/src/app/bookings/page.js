"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import BookingList from "@/components/BookingList";

export default function MyBookings() {
  const { t } = useLang();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const load = () => api("/bookings").then(setBookings).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  async function act(id, status) {
    await api(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("my_bookings")}</h1>
      {error && <p className="text-red-600">{error}</p>}
      <BookingList bookings={bookings} role="CUSTOMER" onAction={act} />
    </div>
  );
}
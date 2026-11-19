"use client";
import { useEffect, useState } from "react";
import { api, btn, input } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function Chat({ bookingId, meId }) {
  const { t } = useLang();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const load = () => api(`/bookings/${bookingId}/messages`).then(setMsgs).catch(() => {});

  useEffect(() => {
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, [bookingId]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await api(`/bookings/${bookingId}/messages`, { method: "POST", body: JSON.stringify({ text }) });
    setText("");
    load();
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h2 className="mb-2 font-semibold">{t("chat")}</h2>
      <div className="mb-3 max-h-60 space-y-1 overflow-y-auto">
        {msgs.map((m) => (
          <div key={m.id} className={m.senderId === meId ? "text-right" : ""}>
            <span className={`inline-block rounded-lg px-3 py-1 text-sm ${m.senderId === meId ? "bg-emerald-100" : "bg-gray-100"}`}>
              <b>{m.sender.name}:</b> {m.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input className={input} value={text} onChange={(e) => setText(e.target.value)} />
        <button className={btn}>{t("send")}</button>
      </form>
    </div>
  );
}
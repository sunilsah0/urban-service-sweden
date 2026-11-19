"use client";
import { createContext, useContext, useEffect, useState } from "react";

const dict = {
  en: {
    home_title: "Trusted home services in Sweden",
    home_sub: "Cleaning, nanny, garden and more. Book in minutes.",
    categories: "Services",
    login: "Log in", register: "Sign up", logout: "Log out",
    name: "Name", email: "Email", password: "Password (min 8)",
    iam: "I am a", customer: "Customer", provider: "Service provider",
    company: "Company name", city: "City",
    book: "Book now", date: "Date and time", address: "Address", note: "Note (optional)",
    price: "Price", min: "min", by: "by",
    my_bookings: "My bookings", dashboard: "Provider dashboard", admin: "Admin",
    add_service: "Add a service", title: "Title", description: "Description",
    price_sek: "Price (SEK)", duration: "Duration (minutes)", category: "Category", image: "Image",
    save: "Save", my_services: "My services", providers: "Providers", bookings: "Bookings",
    pending_msg: "Your company is waiting for admin approval.",
    rejected_msg: "Your company was rejected.",
    approve: "Approve", reject: "Reject",
    accept: "Accept", decline: "Decline", start: "Start job", complete: "Complete", cancel: "Cancel",
    empty: "Nothing here yet", booked_ok: "Booking sent!",
    REQUESTED: "Requested", ACCEPTED: "Accepted", IN_PROGRESS: "In progress",
    COMPLETED: "Completed", CANCELLED: "Cancelled",
    PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected",
  },
  sv: {
    home_title: "Pålitliga hemtjänster i Sverige",
    home_sub: "Städning, barnpassning, trädgård och mer. Boka på några minuter.",
    categories: "Tjänster",
    login: "Logga in", register: "Skapa konto", logout: "Logga ut",
    name: "Namn", email: "E-post", password: "Lösenord (minst 8)",
    iam: "Jag är", customer: "Kund", provider: "Tjänsteleverantör",
    company: "Företagsnamn", city: "Stad",
    book: "Boka nu", date: "Datum och tid", address: "Adress", note: "Meddelande (valfritt)",
    price: "Pris", min: "min", by: "av",
    my_bookings: "Mina bokningar", dashboard: "Leverantörspanel", admin: "Admin",
    add_service: "Lägg till tjänst", title: "Titel", description: "Beskrivning",
    price_sek: "Pris (SEK)", duration: "Varaktighet (minuter)", category: "Kategori", image: "Bild",
    save: "Spara", my_services: "Mina tjänster", providers: "Leverantörer", bookings: "Bokningar",
    pending_msg: "Ditt företag väntar på godkännande från admin.",
    rejected_msg: "Ditt företag har avslagits.",
    approve: "Godkänn", reject: "Avslå",
    accept: "Acceptera", decline: "Avböj", start: "Starta jobb", complete: "Slutför", cancel: "Avboka",
    empty: "Inget här ännu", booked_ok: "Bokning skickad!",
    REQUESTED: "Förfrågan", ACCEPTED: "Accepterad", IN_PROGRESS: "Pågår",
    COMPLETED: "Slutförd", CANCELLED: "Avbokad",
    PENDING: "Väntar", APPROVED: "Godkänd", REJECTED: "Avslagen",
  },
};

const Ctx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("en");
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "sv" || saved === "en") setLangState(saved);
  }, []);
  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  const t = (key) => dict[lang][key] || key;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, ScrollView, Image, Linking, StyleSheet, Switch, Alert} from "react-native";
import * as SecureStore from "expo-secure-store";
import { call } from "./api";
import EmployeeApp from "./EmployeeApp";
import TrackScreen from "./TrackScreen";
import { registerPush } from "./push";
import ProviderApp from "./ProviderApp";

const dict = {
  en: { title: "HemHjälp", login: "Log in", logout: "Log out", email: "Email", password: "Password", book: "Book now", date: "Date (YYYY-MM-DD HH:MM)", address: "Address", mine: "My bookings", back: "Back", ok: "Booked!", min: "min", track: "Track worker", pay: "Pay now", paid: "Paid" },
  sv: { title: "HemHjälp", login: "Logga in", logout: "Logga ut", email: "E-post", password: "Lösenord", book: "Boka nu", date: "Datum (ÅÅÅÅ-MM-DD TT:MM)", address: "Adress", mine: "Mina bokningar", back: "Tillbaka", ok: "Bokat!", min: "min", track: "Följ arbetaren", pay: "Betala nu", paid: "Betald" },
};

export default function App() {
  const [lang, setLang] = useState("en");
  const t = (k) => dict[lang][k] || k;
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [screen, setScreen] = useState("home"); // home | list | detail | bookings | login | track
  const [cats, setCats] = useState([]);
  const [services, setServices] = useState([]);
  const [service, setService] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [trackId, setTrackId] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState("");
  const [useRut, setUseRut] = useState(false);
  

  useEffect(() => {
    SecureStore.getItemAsync("token").then((tk) => {
      if (!tk) return;
      call("/auth/me", tk).then((d) => { if (d.user) { setToken(tk); setRole(d.user.role); } }).catch(() => {});
    });
    call("/categories").then(setCats).catch((e) => setMsg(e.message));
  }, []);

  async function openCategory(slug) {
    setServices(await call(`/services?category=${slug}`));
    setScreen("list");
  }
  async function login() {
    try {
      const d = await call("/auth/login", null, { method: "POST", body: JSON.stringify({ email, password }) });
      await SecureStore.setItemAsync("token", d.token);
      setToken(d.token); setRole(d.user.role); registerPush(d.token); setMsg(""); setScreen("home");
    } catch (e) { setMsg(e.message); }
  }
  async function logout() {
    await SecureStore.deleteItemAsync("token");
    setToken(null); setRole(null); setScreen("home");
  }
  async function book() {
    try {
      const iso = new Date(date.replace(" ", "T")).toISOString();
      await call("/bookings", token, { method: "POST", body: JSON.stringify({  serviceId: service.id, date: iso, address, useRut  }) });
      setMsg(t("ok"));
    } catch (e) { setMsg(e.message); }
  }
  async function openBookings() {
    try { setBookings(await call("/bookings", token)); setScreen("bookings"); }
    catch (e) { setMsg(e.message); setScreen("login"); }
  }
  async function pay(id) {
    try {
      const d = await call("/stripe/checkout", token, { method: "POST", body: JSON.stringify({ bookingId: id }) });
      Linking.openURL(d.url);
    } catch (e) { setMsg(e.message); }
  }
function deleteAccount() {
  Alert.alert("Delete account?", "This cannot be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => {
        try { await call("/account", token, { method: "DELETE" }); await logout(); }
        catch (e) { setMsg(e.message); }
    } },
  ]);
}
if (role === "PROVIDER") return <ProviderApp token={token} onLogout={logout} onDelete={deleteAccount} />;
  if (role === "EMPLOYEE") return <EmployeeApp token={token} onLogout={logout} />;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.logo} onPress={() => { setScreen("home"); setMsg(""); }}>{t("title")}</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Text onPress={openBookings}>{t("mine")}</Text>
          <Text onPress={() => setLang(lang === "en" ? "sv" : "en")}>{lang === "en" ? "SV" : "EN"}</Text>
          {token ? <Text onPress={logout}>{t("logout")}</Text> : <Text onPress={() => setScreen("login")}>{t("login")}</Text>}
        </View>
      </View>
      {!!msg && <Text style={s.msg}>{msg}</Text>}

      {screen === "home" && (
        <FlatList numColumns={2} data={cats} keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <Pressable style={s.cat} onPress={() => openCategory(item.slug)}>
              <Text style={{ fontSize: 32 }}>{item.icon}</Text>
              <Text style={{ fontWeight: "600" }}>{lang === "sv" ? item.nameSv : item.nameEn}</Text>
            </Pressable>
          )} />
      )}

      {screen === "list" && (
        <FlatList data={services} keyExtractor={(x) => x.id}
          ListHeaderComponent={<Text onPress={() => setScreen("home")}>← {t("back")}</Text>}
          renderItem={({ item }) => (
            <Pressable style={s.card} onPress={() => { setService(item); setMsg(""); setScreen("detail"); }}>
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={s.img} />}
              <Text style={s.bold}>{item.title}</Text>
              <Text>{item.provider.companyName} · {item.provider.city}</Text>
              <Text style={s.price}>{item.priceSek} SEK · {item.durationMin} {t("min")}</Text>
            </Pressable>
          )} />
      )}

      {screen === "detail" && service && (
        <ScrollView>
          <Text onPress={() => setScreen("list")}>← {t("back")}</Text>
          {service.imageUrl && <Image source={{ uri: service.imageUrl }} style={s.img} />}
          <Text style={s.bold}>{service.title}</Text>
          <Text>{service.description}</Text>
          <Text style={s.price}>{service.priceSek} SEK</Text>
          <TextInput style={s.input} placeholder={t("date")} value={date} onChangeText={setDate} />
          <TextInput style={s.input} placeholder={t("address")} value={address} onChangeText={setAddress} />
          <Pressable style={s.btn} onPress={token ? book : () => setScreen("login")}>
            <Text style={s.btnText}>{t("book")}</Text>
          </Pressable>
          {service.category?.taxType === "RUT" && service.provider?.fSkattVerified && (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
    <Switch value={useRut} onValueChange={setUseRut} />
    {/* 50 = RUT_PERCENT on the server. Keep them in sync. */}
    <Text style={{ flex: 1 }}>RUT-avdrag: {service.priceSek - Math.round(service.priceSek / 2)} SEK</Text>
  </View>
)}
        </ScrollView>
      )}

      {screen === "bookings" && (
        <FlatList data={bookings} keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.bold}>{item.title || item.service?.title}</Text>
              <Text>{new Date(item.date).toLocaleString()} · {item.address}</Text>
              <Text style={s.price}>{item.status}</Text>
              {["EN_ROUTE", "IN_PROGRESS"].includes(item.status) && (
                <Text style={s.link} onPress={() => { setTrackId(item.id); setScreen("track"); }}>📍 {t("track")}</Text>
              )}
              {!item.paid && ["ACCEPTED", "EN_ROUTE", "IN_PROGRESS", "COMPLETED"].includes(item.status) && (
                <Text style={s.link} onPress={() => pay(item.id)}>💳 {t("pay")}</Text>
              )}
              {item.paid && <Text style={s.price}>✔ {t("paid")}</Text>}
            </View>
          )} />
          
      )}
      {token && screen === "home" && <Text onPress={deleteAccount} style={{ color: "#b91c1c", marginVertical: 12 }}>Delete account</Text>}
      {screen === "track" && <TrackScreen token={token} bookingId={trackId} onBack={openBookings} />}

      {screen === "login" && (
        <View>
          <TextInput style={s.input} placeholder={t("email")} autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextInput style={s.input} placeholder={t("password")} secureTextEntry value={password} onChangeText={setPassword} />
          <Pressable style={s.btn} onPress={login}><Text style={s.btnText}>{t("login")}</Text></Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#f9fafb" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  logo: { fontSize: 20, fontWeight: "bold", color: "#047857" },
  msg: { color: "#047857", marginBottom: 8 },
  cat: { flex: 1, margin: 6, padding: 20, borderRadius: 12, backgroundColor: "white", alignItems: "center" },
  card: { padding: 12, borderRadius: 12, backgroundColor: "white", marginVertical: 6 },
  img: { height: 150, borderRadius: 8, marginBottom: 8 },
  bold: { fontWeight: "700", fontSize: 16 },
  price: { color: "#047857", fontWeight: "700", marginTop: 4 },
  link: { color: "#2563eb", fontWeight: "700", marginTop: 6 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, marginVertical: 6, backgroundColor: "white" },
  btn: { backgroundColor: "#059669", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnText: { color: "white", fontWeight: "700" },
});
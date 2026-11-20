import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { call } from "./api";

const ACTIONS = {
  REQUESTED: [["ACCEPTED", "Accept"], ["CANCELLED", "Decline"]],
  ACCEPTED: [["EN_ROUTE", "On the way"], ["CANCELLED", "Cancel"]],
  EN_ROUTE: [["IN_PROGRESS", "Start"]],
  IN_PROGRESS: [["COMPLETED", "Complete"]],
};

export default function ProviderApp({ token, onLogout, onDelete }) {
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [emps, setEmps] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      setBookings(await call("/bookings", token));
      setEmps(await call("/provider/employees", token));
      setMsg("");
    } catch (e) { setMsg(e.message); }
  }
  useEffect(() => {
    load();
    const i = setInterval(load, 20000);
    return () => clearInterval(i);
  }, []);

  async function patch(path, body) {
    try { await call(path, token, { method: "PATCH", body: JSON.stringify(body) }); load(); }
    catch (e) { setMsg(e.message); }
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.logo}>HemHjälp · Provider</Text>
        <Text onPress={onLogout}>Log out</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 16, marginBottom: 8 }}>
        <Text style={tab === "bookings" ? s.tabOn : s.tab} onPress={() => setTab("bookings")}>Bookings</Text>
        <Text style={tab === "team" ? s.tabOn : s.tab} onPress={() => setTab("team")}>Team</Text>
      </View>
      {!!msg && <Text style={{ color: "#b91c1c" }}>{msg}</Text>}

      {tab === "bookings" ? (
        <FlatList
          style={{ flex: 1 }}
          data={bookings}
          keyExtractor={(b) => b.id}
          ListEmptyComponent={<Text>No bookings yet.</Text>}
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.bold}>{item.title || item.service?.title} · {item.priceSek ?? item.service?.priceSek} SEK</Text>
              <Text>{new Date(item.date).toLocaleString()}</Text>
              <Text>{item.address} · {item.customer.name}</Text>
              <Text style={s.status}>{item.status}{item.paid ? " · paid" : ""}</Text>
              {["REQUESTED", "ACCEPTED"].includes(item.status) && (
                <View style={s.chips}>
                  {emps.map((e) => (
                    <Text
                      key={e.id}
                      onPress={() => patch(`/bookings/${item.id}/assign`, { employeeId: e.id })}
                      style={[s.chip, item.employeeId === e.id && s.chipOn]}
                    >
                      {e.user.name}
                    </Text>
                  ))}
                </View>
              )}
              <View style={s.chips}>
                {(ACTIONS[item.status] || []).map(([status, label]) => (
                  <Pressable key={status} style={s.btn} onPress={() => patch(`/bookings/${item.id}`, { status })}>
                    <Text style={s.btnText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={emps}
          keyExtractor={(e) => e.id}
          ListEmptyComponent={<Text>Add employees on the web dashboard.</Text>}
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.bold}>{item.user.name}</Text>
              <Text>Hours worked: {Math.floor(item.minutes / 60)} h {item.minutes % 60} min</Text>
            </View>
          )}
        />
      )}
      <Text onPress={onDelete} style={{ color: "#b91c1c", marginVertical: 12 }}>Delete account</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#f9fafb" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  logo: { fontSize: 20, fontWeight: "bold", color: "#047857" },
  tab: { color: "#6b7280", fontWeight: "600" },
  tabOn: { color: "#047857", fontWeight: "800", textDecorationLine: "underline" },
  card: { padding: 12, borderRadius: 12, backgroundColor: "white", marginVertical: 6 },
  bold: { fontWeight: "700", fontSize: 16 },
  status: { color: "#047857", fontWeight: "700", marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  chipOn: { backgroundColor: "#d1fae5", borderColor: "#059669" },
  btn: { backgroundColor: "#059669", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: "white", fontWeight: "700" },
});
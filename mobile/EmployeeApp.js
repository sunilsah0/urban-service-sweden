import { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { call } from "./api";

const NEXT = {
  ACCEPTED: ["EN_ROUTE", "On my way"],
  EN_ROUTE: ["IN_PROGRESS", "Start job"],
  IN_PROGRESS: ["COMPLETED", "End job"],
};

export default function EmployeeApp({ token, onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [msg, setMsg] = useState("");
  const watcher = useRef(null);

  async function stopTracking() {
    watcher.current?.remove();
    watcher.current = null;
  }
  async function startTracking(bookingId) {
    await stopTracking();
    watcher.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 10 },
      (loc) =>
        call(`/bookings/${bookingId}/location`, token, {
          method: "POST",
          body: JSON.stringify({ lat: loc.coords.latitude, lng: loc.coords.longitude }),
        }).catch(() => {})
    );
  }

  async function load() {
    try {
      const list = await call("/employee/jobs", token);
      setJobs(list);
      const active = list.find((j) => ["EN_ROUTE", "IN_PROGRESS"].includes(j.status));
      if (active && !watcher.current) {
        const p = await Location.requestForegroundPermissionsAsync();
        if (p.status === "granted") await startTracking(active.id);
      }
      if (!active) await stopTracking();
    } catch (e) { setMsg(e.message); }
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => { clearInterval(i); stopTracking(); };
  }, []);

  async function change(job, status) {
    try {
      if (status === "EN_ROUTE") {
        const p = await Location.requestForegroundPermissionsAsync();
        if (p.status !== "granted") return setMsg("Location permission is needed to start the trip.");
      }
      await call(`/bookings/${job.id}`, token, { method: "PATCH", body: JSON.stringify({ status }) });
      if (status === "COMPLETED") await stopTracking();
      setMsg("");
      await load();
    } catch (e) { setMsg(e.message); }
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.logo}>HemHjälp · Staff</Text>
        <Text onPress={onLogout}>Log out</Text>
      </View>
      <Text style={s.note}>
        📍 Your location is shared with the customer only while a job is active (on the way or in progress). Keep this app open.
      </Text>
      {!!msg && <Text style={{ color: "#b91c1c" }}>{msg}</Text>}
      <FlatList
        data={jobs}
        keyExtractor={(j) => j.id}
        ListEmptyComponent={<Text>No jobs assigned to you.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.bold}>{item.title || item.service?.title}</Text>
            <Text>{new Date(item.date).toLocaleString()}</Text>
            <Text>{item.address} · {item.customer.name}</Text>
            <Text style={s.status}>{item.status}</Text>
            {NEXT[item.status] && (
              <Pressable style={s.btn} onPress={() => change(item, NEXT[item.status][0])}>
                <Text style={s.btnText}>{NEXT[item.status][1]}</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#f9fafb" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  logo: { fontSize: 20, fontWeight: "bold", color: "#047857" },
  note: { backgroundColor: "#ecfdf5", padding: 10, borderRadius: 8, marginBottom: 10 },
  card: { padding: 12, borderRadius: 12, backgroundColor: "white", marginVertical: 6 },
  bold: { fontWeight: "700", fontSize: 16 },
  status: { color: "#047857", fontWeight: "700", marginTop: 4 },
  btn: { backgroundColor: "#059669", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnText: { color: "white", fontWeight: "700" },
});
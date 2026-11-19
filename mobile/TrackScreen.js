import { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { call } from "./api";

export default function TrackScreen({ token, bookingId, onBack }) {
  const [geo, setGeo] = useState(null);
  const map = useRef(null);

  useEffect(() => {
    const poll = () => call(`/bookings/${bookingId}/location`, token).then(setGeo).catch(() => {});
    poll();
    const i = setInterval(poll, 10000);
    return () => clearInterval(i);
  }, [bookingId]);

  useEffect(() => {
    if (geo?.point)
      map.current?.animateToRegion({ latitude: geo.point.lat, longitude: geo.point.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 });
  }, [geo?.point?.id]);

  const toCoord = (p) => ({ latitude: p.lat, longitude: p.lng });
  return (
    <View style={{ flex: 1 }}>
      <Text onPress={onBack} style={{ marginBottom: 8 }}>← Back</Text>
      {geo?.point ? (
        <MapView ref={map} style={{ flex: 1 }} initialRegion={{ ...toCoord(geo.point), latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
          <Marker coordinate={toCoord(geo.point)} title="Your worker" />
          <Polyline coordinates={geo.trail.map(toCoord)} strokeWidth={4} />
        </MapView>
      ) : (
        <Text>Waiting for the worker's location...</Text>
      )}
    </View>
  );
}
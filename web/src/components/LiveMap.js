"use client";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from "react-leaflet";

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center[0], center[1]]);
  return null;
}

export default function LiveMap({ points = [], trail = [] }) {
  const center = points[0] ? [points[0].lat, points[0].lng] : [59.3293, 18.0686]; // Stockholm
  return (
    <MapContainer center={center} zoom={14} style={{ height: 320, width: "100%" }} className="rounded-xl">
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <Recenter center={center} />
      {trail.length > 1 && <Polyline positions={trail.map((p) => [p.lat, p.lng])} />}
      {points.map((p) => (
        <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={10}>
          <Popup>{p.label}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
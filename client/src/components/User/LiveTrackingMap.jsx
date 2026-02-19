import React, { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Zap, Compass, CheckCircle } from "lucide-react";
import useLiveTracking from "../../hooks/user/useLiveTracking";

/* ── Compass label ──────────────────────────────── */
const bearingToLabel = (deg) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
  return dirs[Math.round(deg / 45)];
};

/* ── Rotating worker arrow icon (orange) ────────── */
const makeArrowIcon = (bearing) =>
  L.divIcon({
    html: `
      <div style="
        width:0; height:0;
        border-left:10px solid transparent;
        border-right:10px solid transparent;
        border-bottom:22px solid #F97316;
        transform:rotate(${bearing}deg);
        transform-origin:center bottom;
        filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));
      "></div>`,
    className: "",
    iconSize: [20, 22],
    iconAnchor: [10, 11],
  });

/* ── Red pulsing destination pin ────────────────── */
const destIcon = L.divIcon({
  html: `
    <div style="position:relative;width:24px;height:24px">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:#EF4444;opacity:0.25;
        animation:pulse 1.5s ease-in-out infinite;
      "></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:#EF4444;"></div>
      <style>@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.8)}}</style>
    </div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/**
 * LiveTrackingMap
 *
 * Shown on the user (job-creator) side to watch the worker approach.
 *
 * Props:
 *  - task  : active task object (must have _id and location.coordinates)
 *  - onClose : optional close handler
 */
const LiveTrackingMap = ({ task, onClose }) => {
  const destination = useMemo(() => {
    if (!task?.location?.coordinates?.length) return null;
    const [lng, lat] = task.location.coordinates;
    return { lat, lng };
  }, [task]);

  const { workerCoords, routePath, distanceKm, speed, bearing, hasArrived } =
    useLiveTracking({
      taskId: task?._id,
      destination,
    });

  const arrowIcon = useMemo(() => makeArrowIcon(bearing), [bearing]);

  const mapCenter = workerCoords
    ? [workerCoords.lat, workerCoords.lng]
    : destination
      ? [destination.lat, destination.lng]
      : [20.5937, 78.9629];

  const distDisplay =
    distanceKm !== null
      ? distanceKm >= 1
        ? `${distanceKm.toFixed(1)} km`
        : `${Math.round(distanceKm * 1000)} m`
      : "Locating…";

  const dirLabel = bearingToLabel(bearing);

  /* Expected route: blue dashed straight line worker → destination */
  const expectedRoute =
    workerCoords && destination
      ? [
        [workerCoords.lat, workerCoords.lng],
        [destination.lat, destination.lng],
      ]
      : [];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 20,
        overflow: "hidden",
        background: "#0a0a14",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Info bar ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          zIndex: 500,
          background: "rgba(10,10,20,0.82)",
          backdropFilter: "blur(12px)",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          gap: 20,
          alignItems: "center",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
            Worker Status
          </p>
          <p style={{ color: "#fff", fontWeight: 800, fontSize: 13, margin: "2px 0 0" }}>
            {hasArrived ? "🎉 Arrived!" : workerCoords ? "En Route" : "Waiting for GPS…"}
          </p>
        </div>

        {/* Distance */}
        <Stat icon={<Navigation size={12} color="#22C55E" />} value={distDisplay} label="away" color="#22C55E" />
        {/* Speed */}
        <Stat icon={<Zap size={12} color="#F97316" />} value={`${speed} km/h`} label="speed" color="#F97316" />
        {/* Direction */}
        <Stat icon={<Compass size={12} color="#3B82F6" />} value={dirLabel} label="dir" color="#3B82F6" />

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              width: 30, height: 30,
              cursor: "pointer",
              color: "#fff",
              fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Map ──────────────────────────────────── */}
      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Blue dashed expected route */}
        {expectedRoute.length === 2 && (
          <Polyline
            positions={expectedRoute}
            pathOptions={{ color: "#3B82F6", weight: 4, dashArray: "10 8", opacity: 0.8 }}
          />
        )}

        {/* Green solid traveled path */}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{ color: "#22C55E", weight: 4, opacity: 0.9 }}
          />
        )}

        {/* Worker arrow */}
        {workerCoords && (
          <Marker position={[workerCoords.lat, workerCoords.lng]} icon={arrowIcon}>
            <Popup>Worker is here</Popup>
          </Marker>
        )}

        {/* Destination */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
            <Popup>{task?.address || "Task Location"}</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ── Arrived banner ───────────────────────── */}
      {hasArrived && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 500,
            background: "#dcfce7",
            border: "2px solid #22C55E",
            borderRadius: 16,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 24px rgba(34,197,94,0.25)",
          }}
        >
          <CheckCircle size={20} color="#16a34a" />
          <span style={{ fontWeight: 800, color: "#15803d", fontSize: 14, letterSpacing: 0.5 }}>
            Worker has arrived!
          </span>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 500,
          background: "rgba(10,10,20,0.8)",
          backdropFilter: "blur(8px)",
          borderRadius: 12,
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <LegendItem color="#3B82F6" dash label="Expected Route" />
        <LegendItem color="#22C55E" label="Traveled Path" />
      </div>
    </div>
  );
};

/* Small metric display */
const Stat = ({ icon, value, label, color }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {icon}
      <span style={{ color, fontWeight: 800, fontSize: 14, lineHeight: 1 }}>{value}</span>
    </div>
    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "2px 0 0" }}>
      {label}
    </p>
  </div>
);

/* Legend row */
const LegendItem = ({ color, dash, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{
      width: 24, height: 3.5,
      background: color,
      borderRadius: 2,
      ...(dash ? { backgroundImage: `repeating-linear-gradient(90deg,${color} 0,${color} 6px,transparent 6px,transparent 10px)`, background: "none" } : {}),
    }} />
    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 600 }}>{label}</span>
  </div>
);

export default LiveTrackingMap;

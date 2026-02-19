import React, { useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Navigation, Zap, Compass } from "lucide-react";
import { bearingToLabel } from "../../hooks/worker/useLocationBroadcast";

/* ── Haversine (km) ─────────────────────────────── */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ── Auto-pan the map to follow worker ─────────── */
const MapFollower = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.panTo(center, { animate: true, duration: 0.5 });
  }, [center, map]);
  return null;
};

/* ── Rotating arrow div-icon ────────────────────── */
const makeArrowIcon = (bearing) =>
  L.divIcon({
    html: `
      <div style="
        width: 0; height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 22px solid #F97316;
        transform: rotate(${bearing}deg);
        transform-origin: center bottom;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      "></div>`,
    className: "",
    iconSize: [20, 22],
    iconAnchor: [10, 11],
  });

/* ── Red pulsing destination icon ───────────────── */
const destIcon = L.divIcon({
  html: `
    <div style="position:relative; width:24px; height:24px">
      <div style="
        position:absolute; inset:0; border-radius:50%;
        background:#EF4444; opacity:0.25;
        animation: pulse 1.5s ease-in-out infinite;
      "></div>
      <div style="
        position:absolute; inset:4px; border-radius:50%;
        background:#EF4444;
      "></div>
      <style>
        @keyframes pulse {
          0%,100%{transform:scale(1)}
          50%{transform:scale(1.8)}
        }
      </style>
    </div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/**
 * WorkerNavigationMap
 *
 * Full-screen navigation overlay shown when worker taps "Start Navigation".
 *
 * Props:
 *  - task          : active task object (must have task.location.coordinates [lng, lat])
 *  - workerCoords  : { lat, lng } current worker position
 *  - routePath     : [[lat, lng], ...] traveled path
 *  - speed         : number (km/h)
 *  - bearing       : number (degrees)
 *  - isTracking    : bool
 *  - onClose       : () => void
 */
const WorkerNavigationMap = ({
  task,
  workerCoords,
  routePath,
  speed,
  bearing,
  isTracking,
  onClose,
}) => {
  /* Destination from task.location.coordinates [lng, lat] */
  const destination = useMemo(() => {
    if (!task?.location?.coordinates?.length) return null;
    const [lng, lat] = task.location.coordinates;
    return { lat, lng };
  }, [task]);

  const distanceKm = useMemo(() => {
    if (!workerCoords || !destination) return null;
    return haversineKm(
      workerCoords.lat, workerCoords.lng,
      destination.lat, destination.lng
    );
  }, [workerCoords, destination]);

  const hasArrived = distanceKm !== null && distanceKm < 0.05;

  const center = workerCoords
    ? [workerCoords.lat, workerCoords.lng]
    : destination
      ? [destination.lat, destination.lng]
      : [20.5937, 78.9629]; // fallback: India

  /* Expected route: straight line worker → destination (dashed blue) */
  const expectedRoute = useMemo(() => {
    if (!workerCoords || !destination) return [];
    return [
      [workerCoords.lat, workerCoords.lng],
      [destination.lat, destination.lng],
    ];
  }, [workerCoords, destination]);

  const arrowIcon = useMemo(() => makeArrowIcon(bearing), [bearing]);

  const dirLabel = bearingToLabel(bearing);
  const distDisplay =
    distanceKm !== null
      ? distanceKm >= 1
        ? `${distanceKm.toFixed(1)} km`
        : `${Math.round(distanceKm * 1000)} m`
      : "--";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Top HUD ────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "rgba(10,10,20,0.88)",
          backdropFilter: "blur(12px)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Left: Task title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
            Navigating to
          </p>
          <p style={{ color: "#fff", fontWeight: 800, fontSize: 14, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {task?.title || "Destination"}
          </p>
        </div>

        {/* Center: Metrics */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {/* Speed */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Zap size={12} color="#F97316" />
              <span style={{ color: "#F97316", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{speed}</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>km/h</p>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />

          {/* Compass */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Compass size={12} color="#3B82F6" />
              <span style={{ color: "#3B82F6", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{dirLabel}</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>direction</p>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />

          {/* Distance */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Navigation size={12} color="#22C55E" />
              <span style={{ color: "#22C55E", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{distDisplay}</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>away</p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff",
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Map ─────────────────────────────────── */}
      <MapContainer
        center={center}
        zoom={16}
        style={{ flex: 1, width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Auto-follow worker */}
        {workerCoords && (
          <MapFollower center={[workerCoords.lat, workerCoords.lng]} />
        )}

        {/* Expected route: Blue dashed line (worker → destination) */}
        {expectedRoute.length === 2 && (
          <Polyline
            positions={expectedRoute}
            pathOptions={{ color: "#3B82F6", weight: 4, dashArray: "10 8", opacity: 0.85 }}
          />
        )}

        {/* Traveled path: Green solid */}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{ color: "#22C55E", weight: 4, opacity: 0.9 }}
          />
        )}

        {/* Worker arrow marker */}
        {workerCoords && (
          <Marker
            position={[workerCoords.lat, workerCoords.lng]}
            icon={arrowIcon}
          />
        )}

        {/* Destination marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destIcon} />
        )}
      </MapContainer>

      {/* ── Tracking status badge ───────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: isTracking ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
          border: `1px solid ${isTracking ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          borderRadius: 999,
          padding: "8px 18px",
          display: "flex", alignItems: "center", gap: 8,
          backdropFilter: "blur(10px)",
        }}
      >
        <span style={{
          width: 8, height: 8,
          borderRadius: "50%",
          background: isTracking ? "#22C55E" : "#EF4444",
          boxShadow: isTracking ? "0 0 6px #22C55E" : "0 0 6px #EF4444",
          display: "inline-block",
          animation: isTracking ? "gpsPulse 1.5s ease-in-out infinite" : "none",
        }} />
        <span style={{ color: isTracking ? "#22C55E" : "#EF4444", fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>
          {isTracking ? "GPS Active" : "GPS Inactive"}
        </span>
        <style>{`@keyframes gpsPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>

      {/* ── Arrived banner ──────────────────────── */}
      {hasArrived && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "48px 40px",
              textAlign: "center",
              maxWidth: 320,
              boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
              borderTop: "6px solid #22C55E",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>📍</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 900, textTransform: "uppercase", letterSpacing: -1 }}>
              Arrived!
            </h2>
            <p style={{ color: "#6b7280", fontWeight: 600, margin: "0 0 24px", fontSize: 14 }}>
              You are within 50m of the task location.
            </p>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "14px",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerNavigationMap;

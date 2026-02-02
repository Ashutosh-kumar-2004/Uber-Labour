import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

const LocationMarker = ({ onLocationSelect, selectedLocation }) => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  // Handle map clicks to set location manually
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  // Effect to update marker if parent passes a new location (e.g. initial load)
  useEffect(() => {
    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      const coords = [selectedLocation.lat, selectedLocation.lng];
      setPosition(coords);
      map.flyTo(coords, 14);
    }
  }, [selectedLocation, map]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = [latitude, longitude];
        setPosition(coords);
        onLocationSelect(latitude, longitude);
        map.flyTo(coords, 14);
      },
      () => {
        alert("Unable to retrieve your location");
      },
    );
  };

  return (
    <>
      {position && (
        <Marker position={position}>
          <Popup>Selected Location</Popup>
        </Marker>
      )}

      {/* LOCATE ME BUTTON OVERLAY */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent map click
            e.preventDefault();
            handleLocateMe();
          }}
          type="button"
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          Locate Me
        </button>
      </div>
    </>
  );
};

const Map = ({ onLocationSelect, selectedLocation }) => {
  return (
    <MapContainer
      center={[28.6139, 77.209]} // fallback location
      zoom={5}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker
        onLocationSelect={onLocationSelect}
        selectedLocation={selectedLocation}
      />
    </MapContainer>
  );
};

export default Map;

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- FIX FOR DEFAULT BLUE LEAFLET ICONS ---
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// 👇 1. CREATE A CUSTOM RED ICON FOR THE USER'S LOCATION
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DonationMap = ({ donations }) => {
  // Default center of the map (Delhi/NCR region)
  const defaultCenter = [28.6139, 77.209];

  // 👇 2. STATE TO HOLD LIVE USER LOCATION
  const [currentLocation, setCurrentLocation] = useState(null);

  // 👇 3. GET LIVE LOCATION WHEN COMPONENT LOADS
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success! Save the user's latitude and longitude
          setCurrentLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Error getting location: ", error.message);
        },
      );
    }
  }, []);

  // Filter out donations that don't have geometry data
  const mapData = donations.filter(
    (d) =>
      d.geometry &&
      d.geometry.coordinates &&
      d.geometry.coordinates.length === 2,
  );

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-md border border-gray-200 z-0 relative">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 👇 4. RENDER THE RED MARKER IF WE HAVE THE USER'S LOCATION */}
        {currentLocation && (
          <Marker position={currentLocation} icon={redIcon}>
            <Popup>
              <div className="text-center font-bold text-red-600">
                📍 You are here!
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render all the Donation Pins (Blue) */}
        {mapData.map((donation) => {
          const lat = donation.geometry.coordinates[1];
          const lng = donation.geometry.coordinates[0];
          const position = [lat, lng];

          // Google Maps Directions URL
          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

          return (
            <Marker key={donation._id} position={position}>
              <Popup>
                <div className="text-center min-w-[150px]">
                  <img
                    src={donation.image}
                    alt={donation.name}
                    className="w-full h-24 object-cover rounded mb-2 border border-gray-100"
                  />
                  <h3 className="font-bold text-gray-800">{donation.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {donation.location}
                  </p>

                  <div className="mb-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold
                      ${
                        donation.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : donation.status === "Accepted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </div>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2 px-3 rounded shadow-sm transition-colors text-center no-underline"
                  >
                    📍 Navigate
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default DonationMap;

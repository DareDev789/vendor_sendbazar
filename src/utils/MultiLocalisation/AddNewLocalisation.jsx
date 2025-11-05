import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

function SearchBar({ onSelect, query, setQuery, isOpen, setIsOpen }) {
  const [results, setResults] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [hoveringResults, setHoveringResults] = useState(false);
  const debounceTimeout = useRef(null);

  const shouldSearch = () => inputFocused || hoveringResults;

  const search = async (term) => {
    if (!term || !shouldSearch()) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      term
    )}`;
    const res = await fetch(url);
    const data = await res.json();
    setResults(data);
  };

  useEffect(() => {
    const lastChar = query.slice(-1);
    if (!shouldSearch()) return;

    if (lastChar === " " || lastChar === ",") {
      clearTimeout(debounceTimeout.current);
      search(query.trim());
      return;
    }
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (query.trim()) {
        search(query.trim());
      }
    }, 2000);

    return () => clearTimeout(debounceTimeout.current);
  }, [query, inputFocused, hoveringResults]);

  return (
    <div
      className="search-bar relative z-[1000] w-full"
      style={{ marginBottom: 10 }}
    >
      <input
        type="text"
        placeholder="Rechercher un lieu..."
        value={query}
        onFocus={() => setInputFocused(true)}
        onBlur={() => {
          setTimeout(() => setInputFocused(false), 150);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        className="border p-2 rounded w-full relative z-10 bg-white"
      />
      {isOpen && results.length > 0 && (
        <ul
          className="absolute left-0 right-0 mt-1 border rounded max-h-48 overflow-auto bg-white shadow-lg z-50"
          style={{ top: "100%" }}
          onMouseEnter={() => setHoveringResults(true)}
          onMouseLeave={() => setHoveringResults(false)}
        >
          {results.map((item) => (
            <li
              key={item.place_id}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                onSelect({
                  lat: parseFloat(item.lat),
                  lng: parseFloat(item.lon),
                  address: item.display_name,
                });
                setResults([]);
                setQuery(item.display_name);
              }}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function AddNewLocalisation({
  modifierLocalisation,
  supprimerLocalisation,
  index,
  loc,
}) {
  const latLocal = localStorage.getItem("latitude");
  const lngLocal = localStorage.getItem("longitude");
  const addressLocal = localStorage.getItem("address");

  const [position, setPosition] = useState({
    lat: loc.dokan_geo_latitude
      ? parseFloat(loc.dokan_geo_latitude)
      : latLocal
      ? parseFloat(latLocal)
      : -18.8792,
    lng: loc.dokan_geo_longitude
      ? parseFloat(loc.dokan_geo_longitude)
      : lngLocal
      ? parseFloat(lngLocal)
      : 47.5079,
    address: loc.dokan_geo_address || addressLocal || "Tananarive, Madagascar",
  });

  const [query, setQuery] = useState(
    addressLocal || position?.address || loc.dokan_geo_address || ""
  );

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setPosition({
      lat: loc.dokan_geo_latitude
        ? parseFloat(loc.dokan_geo_latitude)
        : parseFloat(latLocal) || -18.8792,
      lng: loc.dokan_geo_longitude
        ? parseFloat(loc.dokan_geo_longitude)
        : parseFloat(lngLocal) || 47.5079,
      address:
        loc.dokan_geo_address || addressLocal || "Tananarive, Madagascar",
    });
    setQuery(loc.dokan_geo_address || addressLocal || "Tananarive, Madagascar");
  }, [loc.dokan_geo_latitude, loc.dokan_geo_longitude, loc.dokan_geo_address]);

  const handlePositionChange = (pos) => {
    setPosition(pos);
    modifierLocalisation(index, "dokan_geo_address", pos.address);
    modifierLocalisation(index, "dokan_geo_latitude", pos.lat);
    modifierLocalisation(index, "dokan_geo_longitude", pos.lng);
    setIsOpen(false);
  };

  useEffect(() => {
    if (loc.dokan_geo_latitude && loc.dokan_geo_longitude) {
      modifierLocalisation(index, "dokan_geo_address", loc.dokan_geo_address);
      modifierLocalisation(index, "dokan_geo_latitude", loc.dokan_geo_latitude);
      modifierLocalisation(
        index,
        "dokan_geo_longitude",
        loc.dokan_geo_longitude
      );
    }
  }, [loc.dokan_geo_latitude, loc.dokan_geo_longitude]);

  return (
    <div>
      <div className="w-full p-2 overflow-hidden">
        <SearchBar
          onSelect={handlePositionChange}
          query={query}
          setQuery={setQuery}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
        <div className="h-64 md:h-72 mb-4">
          <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full rounded border"
          >
            <ChangeView center={position} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={position} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

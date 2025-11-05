import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { faMapMarkedAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MultiLocalisation from "./MultiLocalisation/MultiLocalisation";

function SearchBar({ onSelect, query, setQuery }) {
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
    <div className="search-bar relative z-[1000]" style={{ marginBottom: 10 }}>
      <input
        type="text"
        placeholder="Rechercher un lieu..."
        value={query}
        onFocus={() => setInputFocused(true)}
        onBlur={() => {
          setTimeout(() => setInputFocused(false), 150);
        }}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full relative z-10 bg-white"
      />
      {results.length > 0 && (
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

export default function GeolocalisationComp({
  register,
  setValue,
  defaultLat,
  defaultLng,
  defaultAddress,
  autresLocalisations = [],
  onChange = () => {},
  weShow = true,
}) {
  const latLocal = localStorage.getItem("latitude");
  const lngLocal = localStorage.getItem("longitude");
  const addressLocal = localStorage.getItem("address");

  const [position, setPosition] = useState({
    lat: defaultLat
      ? parseFloat(defaultLat)
      : latLocal
      ? parseFloat(latLocal)
      : -18.8792,
    lng: defaultLng
      ? parseFloat(defaultLng)
      : lngLocal
      ? parseFloat(lngLocal)
      : 47.5079,
    address: defaultAddress || addressLocal || "Tananarive, Madagascar",
  });

  const [query, setQuery] = useState(
    addressLocal || position?.address || defaultAddress || ""
  );
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setPosition({
      lat: defaultLat
        ? parseFloat(defaultLat)
        : parseFloat(latLocal) || -18.8792,
      lng: defaultLng
        ? parseFloat(defaultLng)
        : parseFloat(lngLocal) || 47.5079,
      address: defaultAddress || addressLocal || "Tananarive, Madagascar",
    });
    setQuery(defaultAddress || addressLocal || "Tananarive, Madagascar");
  }, [defaultLat, defaultLng, defaultAddress]);

  const handlePositionChange = (pos) => {
    setPosition(pos);
    setValue("latitude", pos.lat);
    setValue("longitude", pos.lng);
    setValue("address", pos.address);
  };

  useEffect(() => {
    if (defaultLat && defaultLng) {
      setValue("latitude", defaultLat);
      setValue("longitude", defaultLng);
      setValue("address", defaultAddress);
    }
  }, [defaultLat, defaultLng, defaultAddress]);

  return (
    <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm relative z-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full justify-between"
      >
        <span>
          <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-3" />
          Géolocalisation
        </span>
        <span className="text-base text-gray-600">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <>
          <div className="w-full flex flex-wrap md:flex-nowrap items-center">
            <div className="w-72 md:w-4/12 max-w-full p-2">
              <SearchBar
                onSelect={handlePositionChange}
                query={query}
                setQuery={setQuery}
              />
              <div className="h-64 md:h-80 mb-4">
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

              <input
                type="hidden"
                {...register("address")}
                value={position.address || ""}
              />
              <input
                type="hidden"
                {...register("latitude")}
                value={position.lat || ""}
              />
              <input
                type="hidden"
                {...register("longitude")}
                value={position.lng || ""}
              />
            </div>

            {weShow && (
              <>
                <div className="w-full md:w-8/12">
                  <MultiLocalisation
                    autresLocalisations={autresLocalisations}
                    onChange={onChange}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import React from "react";

export default function ProfileProgress({ percentage, label }) {
  const validPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="w-full max-w-full mx-auto mb-5">
      {label && (
        <label className="block mb-2 font-bold text-gray-700">
          {label}
        </label>
      )}
      <div className="w-full max-w-full bg-gray-300 rounded-full h-6 overflow-hidden">
        <div
          className="bg-pink-400 h-6 transition-all duration-500"
          style={{ width: `${validPercentage}%` }}
        />
      </div>
    </div>
  );
}

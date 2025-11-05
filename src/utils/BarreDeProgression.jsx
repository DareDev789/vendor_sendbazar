import React from "react";

export default function BarreDeProgression({ percentage = 0, color = "bg-blue-500", label = "Progression" }) {
  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 h-4 overflow-hidden">
        <div
          className={`${color} h-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

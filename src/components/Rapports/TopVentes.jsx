import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

export default function TopVentes() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleFilter = () => {
        
    };
  return (
    <>
        <div className="flex items-center gap-2">
            <label>
            Du : 
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="ml-1 border rounded px-2 py-1"
            />
            </label>
            <label>
            Au : 
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="ml-1 border rounded px-2 py-1"
            />
            </label>
            <button
            onClick={handleFilter}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
            Afficher
            </button>
        </div>
        <table className="w-full max-w-4xl table-auto border border-gray-400">
            <thead>
                <tr>
                <th className="border px-4 py-2">Oeuvre</th>
                <th className="border px-4 py-2">Ventes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td className="border px-4 py-2">??????????</td>
                <td className="border px-4 py-2">??????????</td>
                </tr>
                <tr>
                <td className="border px-4 py-2">??????????</td>
                <td className="border px-4 py-2">??????????</td>
                </tr>
                <tr>
                <td className="border px-4 py-2">??????????</td>
                <td className="border px-4 py-2">??????????</td>
                </tr>
                <tr>
                <td className="border px-4 py-2">??????????</td>
                <td className="border px-4 py-2">??????????</td>
                </tr>
                <tr>
                <td className="border px-4 py-2">??????????</td>
                <td className="border px-4 py-2">??????????</td>
                </tr>
            </tbody>
        </table>

    </>
  );
}

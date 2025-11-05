import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const moisNoms = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function LineChartComponent({ data }) {
  const moisActuel = new Date().getMonth();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <XAxis 
          dataKey="x" 
          label={{ 
            value: `Mois de ${moisNoms[moisActuel]}`,
            position: "insideBottomRight", 
            offset: -5 
          }} 
        />
        <YAxis label={{angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Line type="monotone" dataKey="y" stroke="#1e90ff" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

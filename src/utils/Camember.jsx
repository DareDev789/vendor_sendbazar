import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Hook pour détecter si on est sur mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

// Légende personnalisée
function CustomLegend({ payload }) {
  const navigate = useNavigate();

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {payload.map((entry, index) => {
        const { color, payload: dataPayload } = entry;

        const name =
          dataPayload.name === "En cours de vérification"
            ? "Attente paiement"
            : dataPayload.name === "En cours de traitement"
            ? "En cours"
            : dataPayload.name;

        return (
          <li
            key={`item-${index}`}
            style={{ marginBottom: 6, cursor: "pointer", color: color }}
            onClick={() => navigate(`/commandes/${name}`)}
          >
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                backgroundColor: color,
                marginRight: 8,
              }}
            />
            {dataPayload.name} ({dataPayload.value})
          </li>
        );
      })}
    </ul>
  );
}

// Couleurs pour les segments
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8B5CF6", "#EF4444"];

// Composant principal
export default function Camember({ data }) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full h-[60vh] sm:h-[70vh]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 80 : 100}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                cursor="pointer"
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            content={<CustomLegend />}
            layout={isMobile ? "horizontal" : "vertical"}
            align={isMobile ? "center" : "right"}
            verticalAlign={isMobile ? "bottom" : "middle"}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/orders/stats/");
        setStats(data);
      } catch {
        toast.error("Error cargando estadísticas");
      }
    })();
  }, []);

  if (!stats)
    return <div className="p-6 text-orange-600">Cargando estadísticas...</div>;

  const COLORS = ["#f97316", "#ef4444", "#10b981", "#6366f1", "#facc15", "#9ca3af"];
  const pieData = Object.entries(stats.by_status).map(([k, v]) => ({
    name: k,
    value: v,
  }));

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-8">
        <h1 className="text-3xl font-bold text-orange-500">📊 Dashboard Administrativo</h1>

        {/* Sección Totales y Gráfico */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Totales */}
          <div className="bg-orange-100 rounded p-4 border border-orange-200 shadow-sm">
            <h2 className="text-lg font-semibold text-orange-600 mb-2">Totales Generales</h2>
            <p className="text-gray-700">
              <strong>Total de órdenes:</strong> {stats.total_orders}
            </p>
            <p className="text-gray-700">
              <strong>Total de evidencias:</strong> {stats.total_evidences}
            </p>
          </div>

          {/* Gráfico pastel */}
          <div className="bg-orange-100 rounded p-4 border border-orange-200 shadow-sm">
            <h2 className="text-lg font-semibold text-orange-600 mb-4">Órdenes por Estado</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla por técnico */}
        <div className="bg-orange-100 rounded p-4 border border-orange-200 shadow-sm">
          <h2 className="text-lg font-semibold text-orange-600 mb-2">Órdenes por Técnico</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-orange-200">
              <thead className="bg-orange-200 text-orange-700 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Técnico</th>
                  <th className="px-3 py-2 text-center">Órdenes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.by_technician).map(([tech, count]) => (
                  <tr key={tech} className="hover:bg-orange-50 border-t">
                    <td className="px-3 py-2">{tech}</td>
                    <td className="px-3 py-2 text-center">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

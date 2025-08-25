import { useEffect, useState } from "react";
import { api } from "../api";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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

  if (!stats) return <div className="p-4">Cargando estadísticas...</div>;

  // preparar datos para gráfico
  const COLORS = ["#16a34a","#dc2626","#2563eb","#ca8a04","#6b7280","#9333ea"];
  const pieData = Object.entries(stats.by_status).map(([k,v])=>({ name:k, value:v }));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Totales</h2>
          <p>Total de órdenes: {stats.total_orders}</p>
          <p>Total evidencias: {stats.total_evidences}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">Órdenes por estado</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-semibold">Órdenes por técnico</h2>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2">Técnico</th>
              <th className="border px-2">Órdenes</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.by_technician).map(([t,c])=>(
              <tr key={t}>
                <td className="border px-2">{t}</td>
                <td className="border px-2 text-center">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

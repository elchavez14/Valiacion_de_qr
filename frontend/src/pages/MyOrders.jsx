import { useEffect, useState } from "react";
import { api } from "../api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchId, setSearchId] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/orders/");
      setOrders(data);
    } catch {
      toast.error("Error cargando órdenes");
    }
  }

  useEffect(() => { load(); }, []);

  // aplicar filtros en memoria
  const filteredOrders = orders.filter(o => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (searchId && String(o.id) !== searchId.trim()) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Mis Órdenes</h1>

      <div className="flex gap-4 items-center">
        <label>
          Estado:
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border p-1 ml-2"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="in_use">En uso</option>
            <option value="completed">Completadas</option>
            <option value="failed">Fallidas</option>
            <option value="expired">Expiradas</option>
          </select>
        </label>

        <label>
          Buscar por ID:
          <input
            type="text"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="Ej: 5"
            className="border p-1 ml-2"
          />
        </label>
      </div>

      {filteredOrders.length === 0 && <p>No hay órdenes que coincidan.</p>}

      <table className="w-full text-sm border mt-3">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">ID</th>
            <th className="border px-2">Estado</th>
            <th className="border px-2">Creada</th>
            <th className="border px-2">Expira</th>
            <th className="border px-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(o => (
            <tr key={o.id}>
              <td className="border px-2">{o.id}</td>
              <td className="border px-2">{o.status}</td>
              <td className="border px-2">{o.created_at}</td>
              <td className="border px-2">{o.expires_at}</td>
              <td className="border px-2">
                <Link to={`/order?id=${o.id}`} className="underline text-blue-600">
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

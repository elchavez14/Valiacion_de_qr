import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    api
      .get("/orders/")
      .then((res) => setOrders(res.data))
      .catch(() => toast.error("Error cargando órdenes"));
  }, []);

  const filtered = orders.filter((o) => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (searchId && String(o.id) !== searchId.trim()) return false;
    return true;
  });

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("es-BO") : "-";

  const badgeColor = {
    pending: "bg-gray-100 text-gray-800",
    in_use: "bg-yellow-100 text-yellow-900",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    expired: "bg-black text-white",
  };

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-2">
          🧾 Mis Órdenes
        </h1>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <label className="text-sm text-gray-700">
              Estado:
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="ml-2 px-3 py-2 rounded border border-orange-200 bg-orange-100 text-sm focus:outline-none"
              >
                <option value="all">Todas</option>
                <option value="pending">Pendientes</option>
                <option value="in_use">En uso</option>
                <option value="completed">Completadas</option>
                <option value="failed">Fallidas</option>
                <option value="expired">Expiradas</option>
              </select>
            </label>

            <label className="text-sm text-gray-700">
              Buscar por ID:
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Ej: 5"
                className="ml-2 px-3 py-2 rounded border border-orange-200 bg-orange-100 text-sm focus:outline-none"
              />
            </label>
          </div>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <p className="text-gray-600 text-center py-4 italic">
            No hay órdenes que coincidan.
          </p>
        ) : (
          <ul className="space-y-4">
            {filtered.map((o) => (
              <li
                key={o.id}
                className="bg-orange-100 p-4 rounded-lg flex items-center justify-between shadow-sm border border-orange-200"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    disabled
                    className="w-5 h-5 accent-orange-500 cursor-default"
                    checked={o.status === "completed"}
                  />
                  <div>
                    <p className="text-sm text-orange-800 font-semibold">
                      Orden #{o.id} — {o.uuid_order}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Creada:</strong> {formatDate(o.created_at)} <br />
                      <strong>Expira:</strong> {formatDate(o.expires_at)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full font-semibold ${badgeColor[o.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {o.status}
                  </span>
                  <div className="mt-2">
                    <Link
                      to={`/open?id=${o.id}#jwt=${o.jwt_token}`}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded shadow"
                    >
                      Abrir →
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

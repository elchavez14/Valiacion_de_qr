import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);

  const [techId, setTechId] = useState("");
  const [techName, setTechName] = useState("");
  const [hours, setHours] = useState(1);

  useEffect(() => {
    loadOrders();
    loadTechnicians();
  }, []);

  async function loadOrders() {
    try {
      const { data } = await api.get("/orders/");
      setOrders(data);
    } catch {
      toast.error("Error cargando órdenes");
    }
  }

  async function loadTechnicians() {
    try {
      const { data } = await api.get("/auth/users/?role=TECNICO");
      setTechnicians(data);
    } catch {
      toast.error("Error cargando técnicos");
    }
  }

  async function createOrder(e) {
    e.preventDefault();
    if (!techId || !techName) return toast.error("Selecciona técnico y nombre");
    setLoading(true);
    try {
      const { data } = await api.post("/orders/create_order/", {
        technician_id: techId,
        technician_name: techName,
        hours: parseInt(hours),
      });
      toast.success("Orden creada");
      setOrders([data.order, ...orders]);
    } catch {
      toast.error("Error creando orden");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}/download_pdf/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const disposition = response.headers["content-disposition"];
      let filename = `orden_${orderId}.pdf`;
      const match = disposition?.match(/filename="?(.+)"?/);
      if (match?.[1]) filename = match[1];

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Error descargando PDF");
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-orange-500">🛠 Administración de Órdenes</h1>

        {/* FORMULARIO */}
        <form onSubmit={createOrder} className="space-y-4 bg-orange-100 p-4 rounded border border-orange-200">
          <h2 className="text-xl font-semibold text-orange-600">➕ Crear Nueva Orden</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Técnico asignado:</label>
            <select
              value={techId}
              onChange={(e) => {
                const tid = e.target.value;
                setTechId(tid);
                const sel = technicians.find((t) => String(t.id) === tid);
                setTechName(sel ? `${sel.first_name} ${sel.last_name || sel.username}` : "");
              }}
              className="w-full mt-1 p-2 border border-orange-300 rounded bg-orange-50 focus:outline-none"
            >
              <option value="">-- Selecciona un técnico --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.username} ({t.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre completo del técnico:</label>
            <input
              value={techName}
              onChange={(e) => setTechName(e.target.value)}
              className="w-full mt-1 p-2 border border-orange-300 rounded bg-orange-50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Duración (horas):</label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full mt-1 p-2 border border-orange-300 rounded bg-orange-50 focus:outline-none"
            />
          </div>

          <button
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded shadow font-medium transition"
          >
            {loading ? "Creando..." : "Crear Orden"}
          </button>
        </form>

        {/* TABLA */}
        <h2 className="text-xl font-semibold text-orange-600">📄 Órdenes Existentes</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-orange-200 shadow-sm rounded overflow-hidden">
            <thead className="bg-orange-100 text-orange-700 uppercase text-xs">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Técnico</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Creada</th>
                <th className="p-3">Expira</th>
                <th className="p-3">PDF</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t hover:bg-orange-50">
                  <td className="p-3">{o.id}</td>
                  <td className="p-3">{o.technician_name}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3">{o.created_at}</td>
                  <td className="p-3">{o.expires_at}</td>
                  <td className="p-3">
                    <a
                      href={`/admin/orders/${o.id}`}
                      className="text-orange-600 hover:underline"
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => downloadPdf(o.id)}
                      className="ml-2 text-blue-600 hover:underline text-sm"
                    >
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

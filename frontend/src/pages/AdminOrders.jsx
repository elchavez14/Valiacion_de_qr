import { useEffect, useState } from "react";
import { api } from "../api";
import toast from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);

  // campos formulario
  const [techId, setTechId] = useState("");
  const [techName, setTechName] = useState("");
  const [hours, setHours] = useState(1);

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

  useEffect(() => {
    loadOrders();
    loadTechnicians();
  }, []);

  async function createOrder(e) {
    e.preventDefault();
    if (!techId || !techName) return toast.error("Selecciona técnico y nombre");
    setLoading(true);
    try {
      const { data } = await api.post("/orders/create_order/", {
        technician_id: techId,
        technician_name: techName,
        hours: parseInt(hours)
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
      responseType: "blob", // recibe archivo binario
    });

    // crear un enlace de descarga temporal
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // intentar leer filename del header Content-Disposition
    const disposition = response.headers["content-disposition"];
    let filename = `orden_${orderId}.pdf`;
    if (disposition) {
      const match = disposition.match(/filename="?(.+)"?/);
      if (match?.[1]) filename = match[1];
    }

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
    <div style={{padding:16,maxWidth:720,margin:"0 auto"}}>
      <h1 className="text-2xl font-bold">Administración de Órdenes</h1>

      <form onSubmit={createOrder} style={{margin:"20px 0"}}>
        <h2>Crear nueva orden</h2>
        <div>
         <div>
  <label>Técnico asignado:</label>
  <select
    value={techId}
    onChange={e=>{
      const tid = e.target.value;
      setTechId(tid);
      const sel = technicians.find(t=>String(t.id)===tid);
      setTechName(sel ? `${sel.first_name} ${sel.last_name || sel.username}` : "");
    }}
    className="border p-2 w-full"
  >
    <option value="">-- Selecciona un técnico --</option>
    {technicians.map(t=>(
      <option key={t.id} value={t.id}>
        {t.username} ({t.role})
      </option>
    ))}
  </select>
</div>
        </div>
        <div>
          <label>Nombre completo del técnico:</label>
          <input value={techName} onChange={e=>setTechName(e.target.value)} className="border p-2 w-full"/>
        </div>
        <div>
          <label>Duración (horas):</label>
          <input type="number" value={hours} onChange={e=>setHours(e.target.value)} className="border p-2 w-full"/>
        </div>
        <button disabled={loading} className="bg-black text-white px-4 py-2 mt-2 rounded">
          {loading ? "Creando..." : "Crear Orden"}
        </button>
      </form>

      <h2>Órdenes existentes</h2>
      <table className="border w-full text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th>ID</th>
            <th>Técnico</th>
            <th>Estado</th>
            <th>Creada</th>
            <th>Expira</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o=>(
            <tr key={o.id} className="border-t">
              <td>{o.id}</td>
              <td>{o.technician_name}</td>
              <td>{o.status}</td>
              <td>{o.created_at}</td>
              <td>{o.expires_at}</td>
              <td>
                <a href={`/admin/orders/${o.id}`} className="underline text-blue-600">{o.id}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAccess } from "../store/auth";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/orders/${id}/`);
        setOrder(data);
      } catch {
        toast.error("Error cargando orden");
      }
    })();
  }, [id]);

  if (!order) return <div className="p-4">Cargando...</div>;

  async function downloadPDF() {
    try {
      const res = await fetch(`/api/orders/${order.id}/download_pdf/`, {
        headers: {
          Authorization: `Bearer ${getAccess()}`
        }
      });
      if (!res.ok) {
        const errorText = await res.text();
        toast.error("No se pudo descargar el PDF: " + errorText);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orden_${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("No se pudo descargar el PDF");
    }
  }
  const handleDownloadPDF = async (orderId) => {
  try {
    // 👇 importante: pedirlo como blob (archivo binario)
    const res = await api.get(`/orders/${orderId}/download_pdf/`, {
      responseType: "blob",
    });

    // Crear URL temporal para el archivo
    const url = window.URL.createObjectURL(new Blob([res.data]));

    // Crear un link invisible para descargar
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orden_${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();

    // limpiar URL temporal
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error al descargar el PDF:", err);
    alert("No se pudo descargar el PDF");
  }
};

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <button onClick={() => nav(-1)} className="underline text-blue-600">← Volver</button>
      <h1 className="text-xl font-bold">Detalle de Orden #{order.id}</h1>
      <div className="border p-3 rounded">
        <p><b>UUID:</b> {order.uuid_order}</p>
        <p><b>Técnico:</b> {order.technician_name} (id {order.technician})</p>
        <p><b>Estado:</b> {order.status}</p>
        <p><b>Creada:</b> {order.created_at}</p>
        <p><b>Expira:</b> {order.expires_at}</p>
        {order.closed_at && <p><b>Cerrada:</b> {order.closed_at}</p>}
        {order.closing_reason && <p><b>Motivo cierre:</b> {order.closing_reason}</p>}
        {order.closing_notes && <p><b>Notas:</b> {order.closing_notes}</p>}
      </div>

      <div>
        <h2 className="font-semibold">Evidencias</h2>
        {(order.evidences?.length === 0 || !order.evidences) && <p>No hay evidencias.</p>}
        <ul className="list-disc pl-6">
          {(order.evidences || []).map(ev => (
            <li key={ev.id}>
              <b>{ev.kind}</b> — hash: {ev.file_hash} — 
              <a href={ev.file} target="_blank" rel="noreferrer" className="text-blue-600 underline ml-2">
                Ver archivo
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 mt-2">
        <button
  onClick={() => handleDownloadPDF(order.id)}
  className="px-4 py-2 bg-[#f15a24] text-white rounded-md hover:bg-white hover:text-[#f15a24] border border-[#f15a24] transition"
>
  Descargar PDF
</button>

      </div>
    </div>
  );
}

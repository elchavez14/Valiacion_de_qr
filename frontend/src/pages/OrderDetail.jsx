import { useEffect, useState } from "react";
import { getOrder } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await getOrder(id);
        setOrder(data);
      } catch {
        toast.error("Error cargando la orden");
      }
    };
    fetchOrder();
  }, [id]);

  if (!order) return <div className="p-6 text-orange-600">Cargando orden...</div>;

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">

        {/* Botón volver */}
        <button
          onClick={() => nav(-1)}
          className="text-orange-600 underline hover:text-orange-800"
        >
          ← Volver
        </button>

        {/* Título */}
        <h1 className="text-2xl font-bold text-orange-500">🧾 Detalle de Orden #{order.id}</h1>

        {/* Datos de orden */}
        <div className="bg-orange-100 border border-orange-200 p-4 rounded space-y-2">
          <p><strong>UUID:</strong> {order.uuid_order}</p>
          <p><strong>Técnico:</strong> {order.technician_name} (ID {order.technician})</p>
          <p><strong>Estado:</strong> {order.status}</p>
          <p><strong>Creada:</strong> {order.created_at}</p>
          <p><strong>Expira:</strong> {order.expires_at}</p>
          {order.closed_at && <p><strong>Cerrada:</strong> {order.closed_at}</p>}
          {order.closing_reason && <p><strong>Motivo de cierre:</strong> {order.closing_reason}</p>}
          {order.closing_notes && <p><strong>Notas:</strong> {order.closing_notes}</p>}
        </div>

        {/* Evidencias */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-orange-600">📂 Evidencias</h2>

          {(!order.evidences || order.evidences.length === 0) ? (
            <p className="text-gray-600">No hay evidencias registradas.</p>
          ) : (
            <ul className="space-y-6">
              {order.evidences.map((ev) => (
                <li key={ev.id} className="border rounded p-4 bg-orange-50">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{ev.kind}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(ev.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2">
                    {ev.file.endsWith(".jpg") || ev.file.endsWith(".png") ? (
                      <img
                        src={ev.file}
                        alt={`Evidencia ${ev.kind}`}
                        className="max-w-full h-auto border rounded"
                      />
                    ) : ev.file.endsWith(".pdf") ? (
                      <a
                        href={ev.file}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Descargar PDF
                      </a>
                    ) : (
                      <a
                        href={ev.file}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Ver archivo
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Descargar PDF final si está completada */}
          {order.status === "COMPLETED" && (
            <div className="pt-4">
              <a
                href={`${import.meta.env.VITE_API_URL}/orders/${order.id}/download_full_pdf/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow transition"
              >
                📥 Descargar PDF completo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

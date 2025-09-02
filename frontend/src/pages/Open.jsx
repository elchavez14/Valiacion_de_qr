import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";

export default function Open() {
  const [jwt, setJwt] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const nav = useNavigate();
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const id = params.get("id");

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const hp = new URLSearchParams(hash);
    setJwt(hp.get("jwt") || "");
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      if (!jwt || !id) {
        setError("Falta el JWT o el ID de orden.");
        return;
      }

      try {
        const res = await api.post(`/orders/${id}/validate_token/`, { jwt });
        setOrder(res.data.order);
      } catch (err) {
        const msg = err.response?.data?.detail || "Error desconocido";
        setError(msg);
      }
    };

    validateToken();
  }, [id, jwt]);

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(jwt);
      } else {
        const ta = document.createElement("textarea");
        ta.value = jwt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("JWT copiado");
    } catch {
      toast.error("No se pudo copiar el JWT");
    }
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6 text-orange-600">Validando orden...</div>;

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-orange-500">📄 Acceso a Orden #{id}</h1>

        {/* JWT Box */}
        <div className="bg-orange-100 border border-orange-200 p-4 rounded">
          <p className="text-sm text-gray-600 mb-1">JWT recibido:</p>
          <code className="block break-words border bg-white p-2 rounded text-sm">
            {jwt || "(vacío)"}
          </code>
          <button
            onClick={copyToClipboard}
            className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow w-full"
          >
            Copiar JWT
          </button>
        </div>

        {/* Acciones */}
        <button
          onClick={() => nav(`/order?id=${id}`)}
          className="w-full border border-orange-400 text-orange-600 font-semibold hover:bg-orange-100 px-4 py-2 rounded transition"
        >
          Continuar →
        </button>

        {/* Información de la orden */}
        <div className="bg-orange-100 border border-orange-200 p-4 rounded">
          <h2 className="text-lg font-semibold text-orange-600 mb-2">✔️ Orden válida</h2>
          <p><strong>UUID:</strong> {order.uuid_order}</p>
          <p><strong>Técnico:</strong> {order.technician_name}</p>
          <p><strong>Estado:</strong> {order.status}</p>
        </div>
      </div>
    </div>
  );
}

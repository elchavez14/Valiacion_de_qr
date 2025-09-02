import React, { useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

export default function SuccessForm() {
  const { id } = useParams();
  const [docSigned, setDocSigned] = useState(null);
  const [docId, setDocId] = useState(null);
  const [titularPresent, setTitularPresent] = useState(true);
  const [notes, setNotes] = useState("");
  const [jwt, setJwt] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docSigned || !docId || !jwt) {
      setMessage("⚠️ Faltan archivos o JWT.");
      return;
    }

    const formData = new FormData();
    formData.append("doc_signed", docSigned);
    formData.append("doc_id", docId);
    formData.append("jwt", jwt);
    formData.append("titular_present", titularPresent);
    formData.append("notes", notes);

    try {
      await api.post(`/orders/${id}/succeed/`, formData);
      setMessage("✅ Orden cerrada con éxito");
      setTimeout(() => navigate("/my-orders"), 2000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Error al subir evidencias";
      setMessage(`❌ ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-orange-500">
          📄 Cierre exitoso de orden #{id}
        </h1>

        {message && (
          <p className="text-sm font-semibold text-center text-blue-700 bg-blue-100 border border-blue-200 rounded p-2">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento firmado (imagen o PDF)
            </label>
            <input
              type="file"
              accept="image/*, .pdf"
              onChange={(e) => setDocSigned(e.target.files[0])}
              className="w-full border border-orange-300 rounded bg-orange-50 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento de identidad
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setDocId(e.target.files[0])}
              className="w-full border border-orange-300 rounded bg-orange-50 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JWT escaneado del QR
            </label>
            <input
              type="text"
              value={jwt}
              onChange={(e) => setJwt(e.target.value)}
              className="w-full border border-orange-300 rounded bg-orange-50 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ¿Titular presente?
            </label>
            <select
              value={titularPresent}
              onChange={(e) => setTitularPresent(e.target.value === "true")}
              className="w-full border border-orange-300 rounded bg-orange-50 p-2"
            >
              <option value="true">Sí</option>
              <option value="false">No (familiar autorizado)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-orange-300 rounded bg-orange-50 p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 shadow"
          >
            Subir y cerrar orden
          </button>
        </form>
      </div>
    </div>
  );
}

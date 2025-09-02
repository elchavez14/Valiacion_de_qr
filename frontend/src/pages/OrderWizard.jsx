import { useEffect, useState } from "react";
import api from "../api";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function OrderWizard() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const id = params.get("id");

  const [step, setStep] = useState(0);
  const [jwt, setJwt] = useState("");
  const [loading, setLoading] = useState(false);

  // NO
  const [photoAddress, setPhotoAddress] = useState(null);
  const [justification, setJustification] = useState("ausencia_titular");
  const [notesNo, setNotesNo] = useState("");

  // SI
  const [titularPresent, setTitularPresent] = useState(true);
  const [docSigned, setDocSigned] = useState(null);
  const [docId, setDocId] = useState(null);
  const [notesYes, setNotesYes] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await api.post(`/orders/${id}/start/`);
      } catch (e) {
        console.error("Error al iniciar orden", e);
      }
    })();
  }, [id]);

  function resetForms() {
    setJwt("");
    setPhotoAddress(null);
    setJustification("ausencia_titular");
    setNotesNo("");
    setTitularPresent(true);
    setDocSigned(null);
    setDocId(null);
    setNotesYes("");
  }

  async function submitNo() {
    if (!jwt) return toast.error("Pega el JWT");
    if (!photoAddress) return toast.error("Sube la foto del domicilio");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("jwt", jwt);
      form.append("justification", justification);
      form.append("photo_address", photoAddress);
      form.append("notes", notesNo || "");
      await api.post(`/orders/${id}/fail/`, form);
      toast.success("Orden cerrada como fallida");
      setStep(0);
      resetForms();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Error al cerrar");
    } finally {
      setLoading(false);
    }
  }

  async function submitYes() {
    if (!jwt) return toast.error("Pega el JWT");
    if (!docSigned) return toast.error("Sube el documento firmado");
    if (!docId) return toast.error("Sube el documento de identidad");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("jwt", jwt);
      form.append("titular_present", String(titularPresent));
      form.append("doc_signed", docSigned);
      form.append("doc_id", docId);
      form.append("notes", notesYes || "");
      await api.post(`/orders/${id}/succeed/`, form);
      toast.success("Orden cerrada como exitosa");
      setStep(0);
      resetForms();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Error al cerrar");
    } finally {
      setLoading(false);
    }
  }

  if (!id) {
    return <div className="p-6 text-red-600">⚠️ Falta el parámetro <code>id</code> en la URL.</div>;
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-orange-500">🔧 Cierre de Orden #{id}</h1>

        {/* Paso 0 */}
        {step === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">¿La instalación fue satisfactoria?</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep(2)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 rounded shadow"
              >
                ✅ Sí, fue exitosa
              </button>
              <button
                onClick={() => setStep(1)}
                className="bg-red-600 hover:bg-red-700 text-white py-2 rounded shadow"
              >
                ❌ No, fue fallida
              </button>
            </div>
          </div>
        )}

        {/* Paso NO */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-red-600">📸 Cierre Fallido</h2>

            <label className="block text-sm font-medium text-gray-700">
              Foto del domicilio:
              <input type="file" accept="image/*" capture="environment"
                onChange={e => setPhotoAddress(e.target.files?.[0] || null)}
                className="mt-1 block w-full"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Justificación:
              <select value={justification} onChange={e => setJustification(e.target.value)}
                className="mt-1 p-2 border border-orange-300 rounded w-full bg-orange-50"
              >
                <option value="ausencia_titular">Ausencia del titular</option>
                <option value="familiar_ausente">Familiar ausente</option>
                <option value="menor_de_edad">Menor de edad</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              JWT:
              <textarea value={jwt} onChange={e => setJwt(e.target.value)}
                className="mt-1 border border-orange-300 rounded w-full p-2 bg-orange-50" rows={3}
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Notas (opcional):
              <input value={notesNo} onChange={e => setNotesNo(e.target.value)}
                className="mt-1 border border-orange-300 rounded w-full p-2 bg-orange-50"
              />
            </label>

            <button
              disabled={loading}
              onClick={submitNo}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
            >
              {loading ? "Enviando..." : "Confirmar como Fallida"}
            </button>
          </div>
        )}

        {/* Paso SI */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-600">📑 Cierre Exitoso</h2>

            <label className="block text-sm font-medium text-gray-700">
              ¿Titular presente?
              <select
                value={String(titularPresent)}
                onChange={e => setTitularPresent(e.target.value === "true")}
                className="mt-1 p-2 border border-orange-300 rounded w-full bg-orange-50"
              >
                <option value="true">Sí</option>
                <option value="false">No (familiar autorizado)</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Documento firmado (imagen o PDF):
              <input type="file" accept="image/*,.pdf"
                onChange={e => setDocSigned(e.target.files?.[0] || null)}
                className="mt-1 block w-full"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Documento de identidad:
              <input type="file" accept="image/*" capture="environment"
                onChange={e => setDocId(e.target.files?.[0] || null)}
                className="mt-1 block w-full"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              JWT:
              <textarea value={jwt} onChange={e => setJwt(e.target.value)}
                className="mt-1 border border-orange-300 rounded w-full p-2 bg-orange-50" rows={3}
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Notas (opcional):
              <input value={notesYes} onChange={e => setNotesYes(e.target.value)}
                className="mt-1 border border-orange-300 rounded w-full p-2 bg-orange-50"
              />
            </label>

            <button
              disabled={loading}
              onClick={submitYes}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              {loading ? "Enviando..." : "Confirmar como Exitosa"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

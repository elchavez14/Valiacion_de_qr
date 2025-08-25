import { useEffect, useState } from "react";
import { api } from "../api";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function OrderWizard() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const id = params.get("id");

  const [step, setStep] = useState(0); // 0 pregunta, 1 NO, 2 SI
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
  (async () => {
    if (!id) return;   // 👈 evita la llamada si id es null
    try {
      await api.post(`/orders/${id}/start/`);
    } catch (e) {
      console.error("Error al iniciar orden", e);
    }
  })();
}, [id]);


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

  if (!id) {
    return <div className="p-6">Falta el parámetro <code>id</code> en la URL.</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <h1 className="text-xl font-bold text-indigo-800">Orden #{id}</h1>

      {step === 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">¿Instalación satisfactoria?</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setStep(2)} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded shadow">Sí</button>
            <button onClick={() => setStep(1)} className="bg-red-600 hover:bg-red-700 text-white py-2 rounded shadow">No</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Marcar como <span className="text-red-600">Fallida</span></h2>
          <label className="block">
            Foto del domicilio:
            <input type="file" accept="image/*" capture="environment" onChange={e => setPhotoAddress(e.target.files?.[0] || null)} />
          </label>
          <label className="block">
            Justificación:
            <select value={justification} onChange={e=>setJustification(e.target.value)} className="border p-2 w-full">
              <option value="ausencia_titular">Ausencia del titular</option>
              <option value="familiar_ausente">Familiar ausente</option>
              <option value="menor_de_edad">Menor de edad</option>
            </select>
          </label>
          <label className="block">
            JWT (pégalo):
            <textarea value={jwt} onChange={e=>setJwt(e.target.value)} className="border p-2 w-full" rows={3} />
          </label>
          <label className="block">
            Notas (opcional):
            <input value={notesNo} onChange={e=>setNotesNo(e.target.value)} className="border p-2 w-full" />
          </label>

          <button disabled={loading} onClick={submitNo} className="bg-black text-white w-full py-2 rounded">
            {loading ? "Enviando..." : "Confirmar Fallida"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Marcar como <span className="text-green-600">Exitosa</span></h2>
          <label className="block">
            ¿Titular presente?
            <select value={String(titularPresent)} onChange={e=>setTitularPresent(e.target.value==="true")} className="border p-2 w-full">
              <option value="true">Sí</option>
              <option value="false">No (familiar autorizado)</option>
            </select>
          </label>
          <label className="block">
            Documento firmado (imagen o PDF):
            <input type="file" accept="image/*,.pdf" onChange={e=>setDocSigned(e.target.files?.[0] || null)} />
          </label>
          <label className="block">
            Documento de identidad:
            <input type="file" accept="image/*" capture="environment" onChange={e=>setDocId(e.target.files?.[0] || null)} />
          </label>
          <label className="block">
            JWT (pégalo):
            <textarea value={jwt} onChange={e=>setJwt(e.target.value)} className="border p-2 w-full" rows={3} />
          </label>
          <label className="block">
            Notas (opcional):
            <input value={notesYes} onChange={e=>setNotesYes(e.target.value)} className="border p-2 w-full" />
          </label>

          <button disabled={loading} onClick={submitYes} className="bg-black text-white w-full py-2 rounded">
            {loading ? "Enviando..." : "Confirmar Exitosa"}
          </button>
        </div>
      )}
      <button className="bg-indigo-800 text-white px-4 py-2 rounded hover:bg-indigo-900 transition">
  Acción
</button>
    </div>
  );
}

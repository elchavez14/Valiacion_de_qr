import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function Open() {
  const [jwt, setJwt] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const id = params.get("id");

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const hp = new URLSearchParams(hash);
    setJwt(hp.get("jwt") || "");
  }, []);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(jwt);
      else {
        const ta = document.createElement("textarea");
        ta.value = jwt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("JWT copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Orden #{id}</h1>
      <div>
        <div className="text-sm text-gray-600">JWT recibido:</div>
        <code className="block break-all border p-2 rounded">{jwt || "(vacío)"}</code>
      </div>
      <button onClick={copy} className="bg-black text-white px-4 py-2 rounded w-full">
        Copiar JWT
      </button>
      <button
        onClick={() => nav(`/order?id=${id}`)}
        className="border px-4 py-2 rounded w-full"
      >
        Continuar →
      </button>
    </div>
  );
}

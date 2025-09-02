import { useState } from "react";
import api, { setAuth } from "../api";
import { saveTokens } from "../store/auth";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Completa usuario y contraseña");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login/", { username, password });
      saveTokens(data);
      setAuth(data.access);
      toast.success("Sesión iniciada");
      const params = new URLSearchParams(loc.search);
      const id = params.get("id");
      if (loc.pathname === "/open") nav(`/open${loc.search}${loc.hash}`, { replace: true });
      else if (id) nav(`/order?${params}`, { replace: true });
      else nav("/order", { replace: true });
    } catch (err) {
      toast.error("Login fallido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-white to-orange-400">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xs border-4 border-orange-500">
        {/* Icono usuarios */}
        <div className="flex justify-center mb-6">
          <div className="bg-orange-400 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="8" r="4" fill="white" />
              <ellipse cx="12" cy="17" rx="7" ry="4" fill="white" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-orange-500 mb-6">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-orange-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 border-2 border-orange-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-orange-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2V7a2 2 0 10-4 0v2c0 1.104.896 2 2 2zm6 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6" />
              </svg>
            </span>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 border-2 border-orange-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-400" />
              Recuérdame
            </label>
            <a href="#" className="text-orange-400 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-400 text-white font-semibold py-2 rounded-full border-2 border-orange-400 transition hover:bg-white hover:text-orange-400"
          >
            {loading ? "Ingresando..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}


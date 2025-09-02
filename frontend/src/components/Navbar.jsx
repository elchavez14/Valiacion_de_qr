import { Link, useNavigate } from "react-router-dom";
import { clearTokens, getRole } from "../store/auth";
import toast from "react-hot-toast";

export default function Navbar() {
  const role = getRole();
  const nav = useNavigate();

  function logout() {
    clearTokens();
    toast.success("Sesión cerrada");
    nav("/login", { replace: true });
  }

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-orange-500 text-white shadow-lg">
      {/* Logo o nombre del sistema */}
      <div className="flex items-center gap-4 font-bold text-xl">
        <Link to="/" className="hover:text-orange-100 transition">
          🧠 Sistema QR
        </Link>
      </div>

      {/* Enlaces según rol */}
      <div className="flex items-center gap-6 text-sm font-medium">
        {role === "ADMIN" && (
          <>
            <Link to="/admin/users" className="hover:underline">
              Usuarios
            </Link>
            <Link to="/admin/orders" className="hover:underline">
              Órdenes
            </Link>
            <Link to="/admin/dashboard" className="hover:underline">
              Dashboard
            </Link>
          </>
        )}
        {role === "TECNICO" && (
          <Link to="/my-orders" className="hover:underline">
            Mis Órdenes
          </Link>
        )}
        {role && (
          <button
            onClick={logout}
            className="bg-white text-orange-500 hover:bg-orange-100 px-3 py-1 rounded shadow-sm transition"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}

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
    <nav className="sticky top-0 z-10 flex gap-4 items-center p-3 border-b bg-white shadow">
      <Link to="/" className="font-bold text-indigo-800">Inicio</Link>
      {role === "ADMIN" && (
        <>
          <Link to="/admin/users" className="hover:text-indigo-800">Usuarios</Link>
          <Link to="/admin/orders" className="hover:text-indigo-800">Órdenes</Link>
          <Link to="/admin/dashboard" className="hover:text-indigo-800">Dashboard</Link>
        </>
      )}
      {role === "TECNICO" && (
        <Link to="/my-orders" className="hover:text-indigo-800">Mis Órdenes</Link>
      )}
      {role && (
        <button onClick={logout} className="ml-auto underline text-red-600 hover:text-red-800">
          Cerrar sesión
        </button>
      )}
    </nav>
  );
}

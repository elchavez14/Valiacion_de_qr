import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TECNICO");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const { data } = await api.get("/auth/users/");
      setUsers(data);
    } catch {
      toast.error("Error cargando usuarios");
    }
  }

  async function createUser(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/users/", { username, password, role });
      toast.success("Usuario creado");
      setUsername(""); setPassword(""); setRole("TECNICO");
      loadUsers();
    } catch {
      toast.error("Error creando usuario");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id, active) {
    try {
      await api.post(`/auth/users/${id}/set_active/`, { active: !active });
      toast.success("Estado actualizado");
      loadUsers();
    } catch {
      toast.error("Error cambiando estado");
    }
  }

  async function changeRole(id, newRole) {
    try {
      await api.post(`/auth/users/${id}/set_role/`, { role: newRole });
      toast.success("Rol actualizado");
      loadUsers();
    } catch {
      toast.error("Error cambiando rol");
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-orange-500">👤 Gestión de Usuarios</h1>

        {/* FORMULARIO */}
        <form onSubmit={createUser} className="space-y-4 border border-orange-200 bg-orange-100 p-4 rounded">
          <h2 className="text-xl font-semibold text-orange-600">➕ Crear nuevo usuario</h2>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            className="w-full p-2 border border-orange-300 rounded bg-orange-50 focus:outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            type="password"
            className="w-full p-2 border border-orange-300 rounded bg-orange-50 focus:outline-none"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-orange-300 rounded bg-orange-50 focus:outline-none"
          >
            <option value="TECNICO">Técnico</option>
            <option value="ADMIN">Administrador</option>
          </select>

          <button
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded shadow font-medium transition"
          >
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </form>

        {/* TABLA */}
        <h2 className="text-xl font-semibold text-orange-600">📄 Usuarios existentes</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-orange-200 shadow-sm rounded">
            <thead className="bg-orange-100 text-orange-700 uppercase text-xs">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Username</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Activo</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-orange-50">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.is_active ? "✅" : "❌"}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => toggleActive(u.id, u.is_active)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {u.is_active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => changeRole(u.id, u.role === "ADMIN" ? "TECNICO" : "ADMIN")}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Cambiar rol
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

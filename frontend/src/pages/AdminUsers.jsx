import { useEffect, useState } from "react";
import { api } from "../api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TECNICO");
  const [loading, setLoading] = useState(false);

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
      await api.post("/auth/users/", {
        username,
        password,
        role,
      });
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
      toast.success("Estado cambiado");
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

  useEffect(() => { loadUsers(); }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>

      <form onSubmit={createUser} className="space-y-3 border p-4 rounded">
        <h2 className="font-semibold">Crear nuevo usuario</h2>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username"
               className="border p-2 w-full"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"
               type="password" className="border p-2 w-full"/>
        <select value={role} onChange={e=>setRole(e.target.value)} className="border p-2 w-full">
          <option value="TECNICO">Técnico</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">
          {loading ? "Creando..." : "Crear"}
        </button>
      </form>

      <h2 className="font-semibold">Usuarios existentes</h2>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">ID</th>
            <th className="border px-2">Username</th>
            <th className="border px-2">Rol</th>
            <th className="border px-2">Activo</th>
            <th className="border px-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u=>(
            <tr key={u.id}>
              <td className="border px-2">{u.id}</td>
              <td className="border px-2">{u.username}</td>
              <td className="border px-2">{u.role}</td>
              <td className="border px-2">{u.is_active ? "✅" : "❌"}</td>
              <td className="border px-2 space-x-2">
                <button onClick={()=>toggleActive(u.id, u.is_active)} className="underline text-blue-600">
                  {u.is_active ? "Desactivar" : "Activar"}
                </button>
                <button onClick={()=>changeRole(u.id, u.role==="ADMIN"?"TECNICO":"ADMIN")}
                        className="underline text-green-600">
                  Cambiar rol
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function saveTokens({ access, refresh, role }) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
  if (role) localStorage.setItem("role", role);
}

export function getAccess() {
  return localStorage.getItem("access") || "";
}

export function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("role");
}

export function getRole() {
  return localStorage.getItem("role") || "";
}

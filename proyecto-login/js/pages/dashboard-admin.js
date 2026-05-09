/**
 * dashboard-admin.js
 * Guard de ruta y configuración del dashboard para el rol Administrador.
 */

import { requireRole, setupLogout } from "../utils/auth.js";

const user = requireRole("admin"); // redirige si no es admin

if (user) {
  const name = user.full_name || user.name || "Admin";

  /* ── Nombre en el chip del header ── */
  const nameChip = document.getElementById("admin-name");
  if (nameChip) nameChip.textContent = name;

  /* ── Avatar con iniciales ── */
  const avatarEl = document.getElementById("admin-avatar");
  if (avatarEl) avatarEl.textContent = getInitials(name);
}

setupLogout();

/* ── Utilidad ── */
function getInitials(name) {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

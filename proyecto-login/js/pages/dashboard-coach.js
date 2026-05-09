/**
 * dashboard-coach.js
 * Guard de ruta y configuración del dashboard para el rol Entrenador.
 */

import { requireRole, setupLogout } from "../utils/auth.js";

const user = requireRole("coach"); // redirige si no es coach

if (user) {
  const name = user.full_name || user.name || "Coach";

  /* ── Saludo en el hero ── */
  const greetingNode = document.getElementById("coach-greeting");
  if (greetingNode) greetingNode.textContent = "Bienvenido, " + name;

  /* ── Avatar con iniciales en header chip ── */
  const avatarEl = document.getElementById("coach-avatar");
  if (avatarEl) avatarEl.textContent = getInitials(name);

  /* ── Nombre en el chip ── */
  const chipNameEl = document.getElementById("coach-chip-name");
  if (chipNameEl) chipNameEl.textContent = name;
}

setupLogout();

/* ── Utilidad ── */
function getInitials(name) {
  if (!name) return "CO";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

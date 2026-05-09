/**
 * dashboard-usuario.js
 * Guard de ruta y configuración del dashboard para el rol Usuario.
 */

import { requireRole, setupLogout } from "../utils/auth.js";

const user = requireRole("user"); // redirige si no es usuario

if (user) {
  /* ── Nombre y email en sidebar ── */
  const nameNode  = document.getElementById("user-name");
  const emailNode = document.getElementById("user-email");

  if (nameNode)  nameNode.textContent  = user.full_name || user.name || "Usuario";
  if (emailNode) emailNode.textContent = user.email || "";

  /* ── Avatar con iniciales ── */
  const avatarEl = document.getElementById("user-avatar");
  if (avatarEl) avatarEl.textContent = getInitials(user.full_name || user.name || "");

  /* ── Badge de deporte (si existe en metadata) ── */
  const badgeEl = document.querySelector(".badge");
  if (badgeEl) {
    const sport = getSportLabel(user);
    if (sport) badgeEl.textContent = sport;
  }
}

setupLogout();

/* ── Utilidades ── */

/**
 * Genera las iniciales del nombre (máx. 2 letras).
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return "US";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

/**
 * Obtiene el nombre del primer deporte del usuario desde metadata.
 * @param {object} user
 * @returns {string}
 */
function getSportLabel(user) {
  try {
    const sports = user?.metadata?.sports;
    if (Array.isArray(sports) && sports.length > 0 && sports[0].name) {
      return sports[0].name.charAt(0).toUpperCase() + sports[0].name.slice(1);
    }
  } catch {
    // silencio — metadata puede no existir
  }
  return "";
}

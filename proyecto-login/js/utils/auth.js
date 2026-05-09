/**
 * auth.js
 * Utilidades de autenticación y guardias de ruta.
 * Importar desde cualquier página con:
 *   import { requireRole, getStoredUser, setupLogout } from "../utils/auth.js";
 */

import { logout } from "../services/api-client.js";

/** Mapa de roles a sus páginas de dashboard */
const ROLE_ROUTES = {
  user:  "dashboard-usuario.html",
  coach: "dashboard-coach.html",
  admin: "dashboard-admin.html",
};

/**
 * Obtiene el usuario almacenado en localStorage.
 * @returns {object|null}
 */
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

/**
 * Guard de ruta: verifica que el usuario esté autenticado y tenga el rol requerido.
 * Si no está autenticado, redirige a login.html.
 * Si tiene otro rol, redirige a su dashboard correspondiente.
 * @param {string|null} [requiredRole=null] - Rol requerido (null = cualquier rol autenticado)
 * @returns {object|null} El objeto usuario si pasa la verificación, null si redirige
 */
export function requireRole(requiredRole = null) {
  const user  = getStoredUser();
  const token = localStorage.getItem("token");

  if (!user || !token) {
    window.location.href = "login.html";
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    window.location.href = ROLE_ROUTES[user.role] || "login.html";
    return null;
  }

  return user;
}

/**
 * Registra el evento de logout en todos los elementos de la página que actúen
 * como botón o link de cierre de sesión.
 * Intercepta:
 *  - El elemento con id="logout-btn"
 *  - Todos los <a> con href="login.html" que contengan texto "Cerrar Sesión" o "Salir"
 * Llama a logout() (limpia localStorage) antes de redirigir.
 */
export function setupLogout() {
  /** Ejecuta el logout y navega al login */
  function doLogout(e) {
    e.preventDefault();
    logout();
    window.location.href = "login.html";
  }

  // Botón/enlace con id específico
  const btn = document.getElementById("logout-btn");
  if (btn) btn.addEventListener("click", doLogout);

  // Links de tipo <a href="login.html"> que sean de cerrar sesión (texto o clase)
  document.querySelectorAll('a[href="login.html"]').forEach((link) => {
    const text = link.textContent.trim().toLowerCase();
    const isCerrarSesion = text.includes("cerrar") || text.includes("salir") || text.includes("logout");
    if (isCerrarSesion || link.id === "logout-btn") {
      link.addEventListener("click", doLogout);
    }
  });
}

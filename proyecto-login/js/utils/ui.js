/**
 * ui.js
 * Funciones de interfaz de usuario reutilizables para todos los módulos del proyecto.
 * Importar desde cualquier página con:
 *   import { showToast, markInvalid, clearInputErrors, showMessage } from "../utils/ui.js";
 */

/**
 * Muestra un toast flotante en el contenedor #toast-container.
 * Se elimina automáticamente después de 3.8 segundos.
 * @param {string} message - Texto a mostrar
 * @param {"success"|"error"|"info"} [type="info"] - Tipo de toast
 */
export function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconMap = { success: "check_circle", error: "error", info: "info" };
  toast.innerHTML = `
    <span class="material-symbols-outlined">${iconMap[type] || "info"}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 3800);
}

/**
 * Marca un input como inválido añadiendo la clase CSS "input-error".
 * @param {HTMLElement} inputEl - Elemento input a marcar
 */
export function markInvalid(inputEl) {
  if (inputEl) inputEl.classList.add("input-error");
}

/**
 * Elimina las marcas de error de un conjunto de inputs e IDs de error.
 * @param {string[]} inputIds - IDs de los inputs a limpiar
 * @param {string[]} [errorIds=[]] - IDs de los spans de error a limpiar
 */
export function clearInputErrors(inputIds, errorIds = []) {
  inputIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("input-error");
  });
  errorIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

/**
 * Muestra un mensaje de estado en un elemento contenedor (ej: formularios simples).
 * @param {HTMLElement} boxEl - Elemento donde mostrar el mensaje
 * @param {string} text - Texto del mensaje (vacío para ocultarlo)
 * @param {"error"|"success"|"info"} [type="error"] - Tipo de mensaje
 */
export function showMessage(boxEl, text, type = "error") {
  if (!boxEl) return;
  boxEl.textContent = text;
  boxEl.className = "form-message";
  if (!text) return;

  boxEl.classList.add(type);

  if (type === "success") {
    setTimeout(() => {
      boxEl.textContent = "";
      boxEl.className = "form-message";
    }, 5000);
  }
}

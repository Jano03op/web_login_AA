/**
 * validations.js
 * Funciones de validación reutilizables para todos los formularios del proyecto.
 * Importar desde cualquier página con:
 *   import { isValidEmail, isValidPassword, isValidFullName } from "../utils/validations.js";
 */

/**
 * Valida el formato básico de un email.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida que una contraseña tenga el mínimo de caracteres requerido.
 * @param {string} password
 * @param {number} [minLength=8]
 * @returns {boolean}
 */
export function isValidPassword(password, minLength = 8) {
  return typeof password === "string" && password.length >= minLength;
}

/**
 * Valida que un nombre completo tenga al menos 3 caracteres.
 * @param {string} name
 * @param {number} [minLength=3]
 * @returns {boolean}
 */
export function isValidFullName(name, minLength = 3) {
  return typeof name === "string" && name.trim().length >= minLength;
}

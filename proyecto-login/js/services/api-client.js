/**
 * API Client Service
 * Centraliza la lógica de fetch y manejo de errores para consumir la API backend
 */

// Configuración de la URL base de la API
const API_BASE_URL = localStorage.getItem("apiUrl") || "http://localhost:3000/api";

/**
 * Realiza una llamada a la API
 * @param {string} endpoint - Ruta del endpoint (ej: '/auth/login')
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} body - Datos a enviar (opcional)
 * @param {string} token - Token JWT para autorización (opcional)
 * @returns {Promise<{ok: boolean, message: string, data: any, errors: any}>}
 */
export async function apiCall(endpoint, method = "GET", body = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Agregar token si existe
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    // Agregar body si es método POST/PUT/PATCH
    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      options.body = JSON.stringify(body);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, options);

    // Intentar parsear la respuesta JSON
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // Si no es JSON válido, crear respuesta genérica
      data = {
        ok: false,
        message: "Error al procesar la respuesta del servidor",
      };
    }

    // Si el status no es 2xx, marcar como error
    if (!response.ok) {
      return {
        ok: false,
        message: data.message || `Error ${response.status}`,
        data: null,
        errors: data.errors || null,
      };
    }

    return {
      ok: true,
      message: data.message || "Operación exitosa",
      data: data.data || data,
      errors: null,
    };
  } catch (error) {
    // Errores de red, timeout, etc.
    console.error("API Error:", error);

    let message = "Error de conexión. Intenta más tarde.";

    // Diferenciar tipos de error
    if (error instanceof TypeError) {
      message = "No se puede conectar al servidor. Verifica tu conexión.";
    } else if (error.name === "AbortError") {
      message = "La solicitud tardó demasiado. Intenta nuevamente.";
    }

    return {
      ok: false,
      message,
      data: null,
      errors: error.message,
    };
  }
}

/**
 * Guarda el token JWT en localStorage
 * @param {string} token - Token JWT a guardar
 */
export function saveToken(token) {
  localStorage.setItem("authToken", token);
}

/**
 * Obtiene el token JWT desde localStorage
 * @returns {string|null} Token JWT o null si no existe
 */
export function getToken() {
  return localStorage.getItem("authToken");
}

/**
 * Elimina el token JWT de localStorage
 */
export function clearToken() {
  localStorage.removeItem("authToken");
}

/**
 * Guarda los datos del usuario en localStorage
 * @param {object} user - Datos del usuario
 */
export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Obtiene los datos del usuario desde localStorage
 * @returns {object|null} Datos del usuario o null si no existe
 */
export function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

/**
 * Elimina los datos del usuario de localStorage
 */
export function clearUser() {
  localStorage.removeItem("user");
}

/**
 * Realiza logout eliminando token y usuario
 */
export function logout() {
  clearToken();
  clearUser();
}

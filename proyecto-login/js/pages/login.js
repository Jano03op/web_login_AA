/**
 * login.js
 * Página de inicio de sesión.
 */

import { apiCall, saveToken, saveUser } from "../services/api-client.js";
import { isValidEmail } from "../utils/validations.js";
import { markInvalid, showMessage } from "../utils/ui.js";

const form          = document.getElementById("form-login");
const emailInput    = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageBox    = document.getElementById("login-message");
const submitButton  = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearValidation();

  const email    = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  // Validación local
  const errors = getLoginErrors(email, password);
  if (errors.length > 0) {
    showMessage(messageBox, errors.join(" "));
    return;
  }

  // Deshabilitar botón durante fetch
  submitButton.disabled = true;
  showMessage(messageBox, "Procesando...");

  try {
    const result = await apiCall("/auth/login", "POST", { email, password });

    if (result.ok && result.data) {
      const { token, user } = result.data;

      saveToken(token);
      saveUser(user);

      showMessage(messageBox, "Ingreso exitoso. Redirigiendo...", "success");

      setTimeout(() => {
        redirectByRole(user.role);
      }, 1500);
    } else {
      markInvalid(emailInput);
      markInvalid(passwordInput);
      showMessage(messageBox, result.message || "Error al iniciar sesión.");
      submitButton.disabled = false;
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage(messageBox, "Error inesperado. Intenta más tarde.");
    submitButton.disabled = false;
  }
});

/* ── Validaciones locales ── */
function getLoginErrors(email, password) {
  const errors = [];

  if (!email) {
    errors.push("El correo es obligatorio.");
    markInvalid(emailInput);
  } else if (!isValidEmail(email)) {
    errors.push("Ingresa un correo válido.");
    markInvalid(emailInput);
  }

  if (!password) {
    errors.push("La contraseña es obligatoria.");
    markInvalid(passwordInput);
  }

  return errors;
}

function clearValidation() {
  emailInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");
  showMessage(messageBox, "");
}

/* ── Redirección por rol ── */
function redirectByRole(role) {
  const roleRoutes = {
    user:  "dashboard-usuario.html",
    coach: "dashboard-coach.html",
    admin: "dashboard-admin.html",
  };
  window.location.href = roleRoutes[role] || "login.html";
}

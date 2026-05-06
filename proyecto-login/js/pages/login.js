import { apiCall, saveToken, saveUser } from "../services/api-client.js";

const form = document.getElementById("form-login");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageBox = document.getElementById("login-message");
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearValidation();

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  // Validación local
  const errors = getLoginErrors(email, password);
  if (errors.length > 0) {
    showMessage(errors.join(" "));
    return;
  }

  // Deshabilitar botón durante fetch
  submitButton.disabled = true;
  showMessage("Procesando...");

  try {
    // Llamar a la API
    const result = await apiCall("/auth/login", "POST", {
      email,
      password,
    });

    if (result.ok && result.data) {
      // Login exitoso
      const { token, user } = result.data;

      // Guardar token y usuario
      saveToken(token);
      saveUser(user);

      showMessage("Ingreso exitoso. Redirigiendo...", "success");

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        redirectByRole(user.role);
      }, 1500);
    } else {
      // Error en credenciales o validación
      markInvalid(emailInput);
      markInvalid(passwordInput);
      showMessage(result.message || "Error al iniciar sesión.");
      submitButton.disabled = false;
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage("Error inesperado. Intenta más tarde.");
    submitButton.disabled = false;
  }
});

function getLoginErrors(email, password) {
  const errors = [];

  // Validar que no estén vacíos
  if (!email) {
    errors.push("El correo es obligatorio.");
    markInvalid(emailInput);
  }

  if (!password) {
    errors.push("La contraseña es obligatoria.");
    markInvalid(passwordInput);
  }

  // Validar formato de email (si no está vacío)
  if (email && !isValidEmail(email)) {
    errors.push("Ingresa un correo válido.");
    markInvalid(emailInput);
  }

  return errors;
}

/**
 * Valida formato básico de email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function markInvalid(input) {
  input.classList.add("input-error");
}

function clearValidation() {
  emailInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");
  showMessage("");
}

function showMessage(text, type = "error") {
  messageBox.textContent = text;
  messageBox.className = "form-message";
  if (!text) return;

  messageBox.classList.add(type);

  // Auto-limpiar mensajes de éxito después de 5 segundos
  if (type === "success") {
    setTimeout(() => {
      messageBox.textContent = "";
      messageBox.className = "form-message";
    }, 5000);
  }
}

function redirectByRole(role) {
  const roleRoutes = {
    user: "dashboard-usuario.html",
    coach: "dashboard-coach.html",
    admin: "dashboard-admin.html",
  };

  const target = roleRoutes[role] || "login.html";
  window.location.href = target;
}

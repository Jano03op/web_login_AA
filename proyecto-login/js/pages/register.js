/**
 * register.js
 * Página de registro de nuevos usuarios.
 *
 * Payload que acepta el backend POST /api/auth/register:
 *   { full_name, email, password, birth_date?, metadata?: { sports: [{name, frequency_per_week?}] } }
 */

import { apiCall } from "../services/api-client.js";
import { isValidEmail, isValidPassword, isValidFullName } from "../utils/validations.js";
import { markInvalid, showMessage } from "../utils/ui.js";

/* ── Referencias al DOM ── */
const form                 = document.getElementById("form-register");
const nameInput            = document.getElementById("full_name");
const emailInput           = document.getElementById("email");
const passwordInput        = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm_password");
const birthDateInput       = document.getElementById("birth_date");
const sportSelect          = document.getElementById("tipoDeporte");
const messageBox           = document.getElementById("register-message");
const submitButton         = form?.querySelector('button[type="submit"]');

if (
  form &&
  nameInput &&
  emailInput &&
  passwordInput &&
  confirmPasswordInput &&
  messageBox &&
  submitButton
) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearValidation();

    /* ── Leer y normalizar valores ── */
    const fullName        = nameInput.value.trim().replace(/\s+/g, " ");
    const email           = emailInput.value.trim().toLowerCase();
    const password        = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const birthDate       = birthDateInput?.value || "";         // YYYY-MM-DD o vacío
    const sportName       = sportSelect?.value || "";            // string o vacío

    // Actualizar campos normalizados en el DOM
    nameInput.value  = fullName;
    emailInput.value = email;

    /* ── Validación local ── */
    const errors = getRegisterErrors(fullName, email, password, confirmPassword);
    if (errors.length > 0) {
      showMessage(messageBox, errors.join(" "));
      return;
    }

    submitButton.disabled = true;
    showMessage(messageBox, "Registrando usuario...");

    /* ── Construir payload ── */
    const payload = {
      full_name: fullName,
      email,
      password,
      // metadata.sports: el backend espera un array de objetos { name }
      // Si el usuario seleccionó un deporte, lo incluimos; si no, enviamos array vacío
      metadata: {
        sports: sportName ? [{ name: sportName }] : [],
      },
    };

    // birth_date: solo incluir si el usuario completó el campo
    if (birthDate) {
      payload.birth_date = birthDate; // formato YYYY-MM-DD que el backend acepta
    }

    try {
      const result = await apiCall("/auth/register", "POST", payload);

      if (result.ok) {
        showMessage(
          messageBox,
          "Usuario registrado correctamente. Redirigiendo al login...",
          "success",
        );
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
        return;
      }

      markInvalid(emailInput);
      markInvalid(passwordInput);
      markInvalid(confirmPasswordInput);
      showMessage(messageBox, formatApiErrors(result));
    } catch (error) {
      console.error("Register error:", error);
      showMessage(messageBox, "No fue posible completar el registro. Intenta nuevamente.");
    } finally {
      submitButton.disabled = false;
    }
  });
}

/* ══════════════════════════════════════════════════
   Validaciones locales
══════════════════════════════════════════════════ */
function getRegisterErrors(fullName, email, password, confirmPassword) {
  const errors = [];

  if (!fullName) {
    errors.push("El nombre es obligatorio.");
    markInvalid(nameInput);
  } else if (!isValidFullName(fullName)) {
    errors.push("El nombre debe tener al menos 3 caracteres.");
    markInvalid(nameInput);
  }

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
  } else if (!isValidPassword(password)) {
    errors.push("La contraseña debe tener mínimo 8 caracteres.");
    markInvalid(passwordInput);
  }

  if (!confirmPassword) {
    errors.push("Debes confirmar la contraseña.");
    markInvalid(confirmPasswordInput);
  } else if (password && confirmPassword !== password) {
    errors.push("Las contraseñas no coinciden.");
    markInvalid(passwordInput);
    markInvalid(confirmPasswordInput);
  }

  return errors;
}

function clearValidation() {
  [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach((el) =>
    el.classList.remove("input-error"),
  );
  showMessage(messageBox, "");
}

/* ── Formatear errores de la API ── */
function formatApiErrors(result) {
  if (result?.errors && typeof result.errors === "object") {
    const messages = Object.values(result.errors).flat().filter(Boolean);
    if (messages.length > 0) return messages.join(" ");
  }
  return result?.message || "No fue posible completar el registro.";
}

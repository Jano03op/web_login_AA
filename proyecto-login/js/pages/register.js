import { apiCall } from "../services/api-client.js";

const form = document.getElementById("form-register");
const nameInput = document.getElementById("full_name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm_password");
const messageBox = document.getElementById("register-message");
const submitButton = form?.querySelector('button[type="submit"]');

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

    const fullName = nameInput.value.trim().replace(/\s+/g, " ");
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    nameInput.value = fullName;
    emailInput.value = email;
    passwordInput.value = password;
    confirmPasswordInput.value = confirmPassword;

    const errors = getRegisterErrors(
      fullName,
      email,
      password,
      confirmPassword,
    );
    if (errors.length > 0) {
      showMessage(errors.join(" "));
      return;
    }

    submitButton.disabled = true;
    showMessage("Registrando usuario...");

    try {
      const result = await apiCall("/auth/register", "POST", {
        full_name: fullName,
        email,
        password,
      });

      if (result.ok) {
        showMessage(
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
      showMessage(formatApiErrors(result));
    } catch (error) {
      console.error("Register error:", error);
      showMessage("No fue posible completar el registro. Intenta nuevamente.");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function getRegisterErrors(fullName, email, password, confirmPassword) {
  const errors = [];

  if (!fullName) {
    errors.push("El nombre es obligatorio.");
    markInvalid(nameInput);
  } else if (fullName.length < 3) {
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
  } else if (password.length < 8) {
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

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function markInvalid(input) {
  input.classList.add("input-error");
}

function clearValidation() {
  nameInput.classList.remove("input-error");
  emailInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");
  confirmPasswordInput.classList.remove("input-error");
  showMessage("");
}

function showMessage(text, type = "error") {
  messageBox.textContent = text;
  messageBox.className = "form-message";

  if (!text) {
    return;
  }

  messageBox.classList.add(type);
}

function formatApiErrors(result) {
  if (result?.errors && typeof result.errors === "object") {
    const messages = Object.values(result.errors).flat().filter(Boolean);
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return result?.message || "No fue posible completar el registro.";
}

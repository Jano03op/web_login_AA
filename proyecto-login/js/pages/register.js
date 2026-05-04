const form = document.querySelector("form");
const nameInput = document.getElementById("nombre");
const emailInput = document.getElementById("correo");
const passwordInput = document.getElementById("contraseña");
const messageBox = document.getElementById("register-message");

const API_URL = "http://localhost:3000/api";

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearValidation();

    // Validar inputs
    if (nameInput) {
      nameInput.value = nameInput.value.trim().replace(/\s+/g, " ");
    }

    if (emailInput) {
      emailInput.value = emailInput.value.trim().toLowerCase();
    }

    if (passwordInput) {
      passwordInput.value = passwordInput.value.trim();
    }

    const errors = getRegisterErrors();
    if (errors.length > 0) {
      showMessage(errors.join(" "));
      return;
    }

    try {
      showMessage("Registrando usuario...", "info");

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: nameInput.value,
          email: emailInput.value,
          password: passwordInput.value,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        showMessage(result.message || "Error en el registro");
        if (result.errors) {
          Object.values(result.errors).forEach((error) => {
            showMessage(error, "error");
          });
        }
        return;
      }

      showMessage("Registro exitoso. Redirigiendo al login...", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (error) {
      console.error("Error al registrar:", error);
      showMessage("Error de conexión. Verifica que el servidor esté corriendo");
    }
  });
}

function getRegisterErrors() {
  const errors = [];

  if (!nameInput || !nameInput.value.trim()) {
    errors.push("El nombre es obligatorio.");
    markInvalid(nameInput);
  }

  if (!emailInput || !emailInput.value.trim()) {
    errors.push("El correo es obligatorio.");
    markInvalid(emailInput);
  }

  if (!passwordInput || !passwordInput.value.trim()) {
    errors.push("La contraseña es obligatoria.");
    markInvalid(passwordInput);
  }

  if (passwordInput && passwordInput.value.trim().length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres.");
    markInvalid(passwordInput);
  }

  return errors;
}

function markInvalid(input) {
  if (input) {
    input.classList.add("input-error");
  }
}

function clearValidation() {
  if (nameInput) nameInput.classList.remove("input-error");
  if (emailInput) emailInput.classList.remove("input-error");
  if (passwordInput) passwordInput.classList.remove("input-error");
  showMessage("");
}

function showMessage(text, type = "error") {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.className = "form-message";
  if (!text) return;
  messageBox.classList.add(type);
}

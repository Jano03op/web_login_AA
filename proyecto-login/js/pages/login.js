const form = document.getElementById("form-login");
const correoInput = document.getElementById("correo");
const contrasenaInput = document.getElementById("contraseña");
const messageBox = document.getElementById("login-message");

const API_URL = "http://localhost:3000/api";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearValidation();

  const email = correoInput.value.trim().toLowerCase();
  const password = contrasenaInput.value.trim();

  const errors = getLoginErrors(email, password);
  if (errors.length > 0) {
    showMessage(errors.join(" "));
    return;
  }

  try {
    showMessage("Procesando ingreso...", "info");

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      markInvalid(correoInput);
      markInvalid(contrasenaInput);
      showMessage(result.message || "Error en el login");
      return;
    }

    // Guardar token y usuario en localStorage
    const { token, user } = result.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    showMessage("Ingreso exitoso. Redirigiendo...", "success");
    setTimeout(() => redirectByRole(user.role), 1500);
  } catch (error) {
    console.error("Error al intentar login:", error);
    showMessage(
      "Error de conexión. Verifica que el servidor esté corriendo en http://localhost:3000",
    );
    markInvalid(correoInput);
    markInvalid(contrasenaInput);
  }
});

function getLoginErrors(email, password) {
  const errors = [];

  if (!email) {
    errors.push("El correo es obligatorio.");
    markInvalid(correoInput);
  }

  if (!password) {
    errors.push("La contraseña es obligatoria.");
    markInvalid(contrasenaInput);
  }

  return errors;
}

function markInvalid(input) {
  input.classList.add("input-error");
}

function clearValidation() {
  correoInput.classList.remove("input-error");
  contrasenaInput.classList.remove("input-error");
  showMessage("");
}

function showMessage(text, type = "error") {
  messageBox.textContent = text;
  messageBox.className = "form-message";
  if (!text) return;
  messageBox.classList.add(type);
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

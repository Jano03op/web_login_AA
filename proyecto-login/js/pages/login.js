import { users } from "../data/mock-db.js";

const form = document.getElementById("form-login");
const correoInput = document.getElementById("correo");
const contrasenaInput = document.getElementById("contraseña");
const messageBox = document.getElementById("login-message");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  clearValidation();

  const correo = correoInput.value.trim().toLowerCase();
  const contrasena = contrasenaInput.value.trim();

  const errors = getLoginErrors(correo, contrasena);
  if (errors.length > 0) {
    showMessage(errors.join(" "));
    return;
  }

  const user = users.find(
    (u) => u.user.toLowerCase() === correo && u.password === contrasena,
  );

  if (!user) {
    markInvalid(correoInput);
    markInvalid(contrasenaInput);
    showMessage("Correo o contraseña incorrectos.");
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));
  showMessage("Ingreso exitoso. Redirigiendo...", "success");
  redirectByRole(user.role);
});

function getLoginErrors(correo, contrasena) {
  const errors = [];

  if (!correo) {
    errors.push("El correo es obligatorio.");
    markInvalid(correoInput);
  }

  if (!contrasena) {
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

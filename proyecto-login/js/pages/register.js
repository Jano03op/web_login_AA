const form = document.querySelector("form");
const nameInput = document.getElementById("nombre");
const emailInput = document.getElementById("correo");
const passwordInput = document.getElementById("contraseña");

if (form) {
  form.addEventListener("submit", () => {
    if (nameInput) {
      nameInput.value = nameInput.value.trim().replace(/\s+/g, " ");
    }

    if (emailInput) {
      emailInput.value = emailInput.value.trim().toLowerCase();
    }

    if (passwordInput) {
      passwordInput.value = passwordInput.value.trim();
    }
  });
}

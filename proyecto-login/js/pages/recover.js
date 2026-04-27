const form = document.querySelector("form");
const emailInput = document.getElementById("correo");

if (form && emailInput) {
  form.addEventListener("submit", () => {
    emailInput.value = emailInput.value.trim().toLowerCase();
  });
}

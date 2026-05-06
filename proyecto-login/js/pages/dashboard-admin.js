const user  = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const routes = {
  user:  "dashboard-usuario.html",
  coach: "dashboard-coach.html",
  admin: "dashboard-admin.html",
};

// Redirigir si no autenticado o no es admin
if (!user || !token) {
  window.location.href = "login.html";
} else if (user.role !== "admin") {
  window.location.href = routes[user.role] || "login.html";
} else {
  // Mostrar nombre en chip del header
  const nameChip = document.getElementById("admin-name");
  if (nameChip) nameChip.textContent = user.full_name || user.name || "Admin";
}

// Logout: limpiar localStorage
document.getElementById("logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
});

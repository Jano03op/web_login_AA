const user = JSON.parse(localStorage.getItem("user"));

const routes = {
  user: "dashboard-usuario.html",
  coach: "dashboard-coach.html",
  admin: "dashboard-admin.html",
};

if (!user) {
  window.location.href = "login.html";
} else if (user.role !== "admin") {
  window.location.href = routes[user.role] || "login.html";
} else {
  const greetingNode = document.getElementById("admin-greeting");
  if (greetingNode) greetingNode.textContent = "Bienvenido, " + user.name;
}

document.querySelectorAll('a[href="login.html"]').forEach((link) => {
  link.addEventListener("click", () => {
    localStorage.removeItem("user");
  });
});

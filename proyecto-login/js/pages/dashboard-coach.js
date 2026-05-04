const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const routes = {
  user: "dashboard-usuario.html",
  coach: "dashboard-coach.html",
  admin: "dashboard-admin.html",
};

if (!user || !token) {
  window.location.href = "login.html";
} else if (user.role !== "coach") {
  window.location.href = routes[user.role] || "login.html";
} else {
  const greetingNode = document.getElementById("coach-greeting");
  if (greetingNode)
    greetingNode.textContent = "Bienvenido, " + (user.full_name || user.name);
}

document.querySelectorAll('a[href="login.html"]').forEach((link) => {
  link.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  });
});

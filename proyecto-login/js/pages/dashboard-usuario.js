const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const routes = {
  user: "dashboard-usuario.html",
  coach: "dashboard-coach.html",
  admin: "dashboard-admin.html",
};

if (!user || !token) {
  window.location.href = "login.html";
} else if (user.role !== "user") {
  window.location.href = routes[user.role] || "login.html";
} else {
  const nameNode = document.getElementById("user-name");
  const emailNode = document.getElementById("user-email");

  if (nameNode) nameNode.textContent = user.full_name || user.name;
  if (emailNode) emailNode.textContent = user.email || user.user;
}

document.querySelectorAll('a[href="login.html"]').forEach((link) => {
  link.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  });
});

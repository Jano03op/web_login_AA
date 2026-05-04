const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const routes = {
  user: "dashboard-usuario.html",
  coach: "dashboard-coach.html",
  admin: "dashboard-admin.html",
};

if (user && token && routes[user.role]) {
  const dashboardHref = routes[user.role];

  const loginButtons = document.querySelectorAll('a[href="login.html"]');
  loginButtons.forEach((link) => {
    link.href = dashboardHref;
    if (link.textContent.trim().toLowerCase().includes("iniciar")) {
      link.textContent = "Mi Dashboard";
    }
  });
}

/**
 * perfil.js
 * Módulo Mi Perfil — todos los roles
 *
 * Endpoints utilizados:
 *   GET  /api/auth/me               → datos del usuario autenticado
 *   PUT  /api/auth/me               → actualizar perfil (full_name, email, birth_date, metadata)
 *   PUT  /api/auth/me/password      → cambiar contraseña { current_password, new_password, confirm_password }
 */

import { apiCall } from "../services/api-client.js";

/* ══════════════════════════════════════════════════
   1. Auth guard — cualquier rol autenticado
══════════════════════════════════════════════════ */
const storedUser  = JSON.parse(localStorage.getItem("user"));
const storedToken = localStorage.getItem("token");

if (!storedUser || !storedToken) {
  window.location.href = "login.html";
}

// Logout
document.getElementById("logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
});

/* ══════════════════════════════════════════════════
   2. Utilidades
══════════════════════════════════════════════════ */
function getToken() {
  return localStorage.getItem("token");
}

function getStoredUser() {
  return JSON.parse(localStorage.getItem("user"));
}

/**
 * Formatea fecha YYYY-MM-DD → DD/MM/YYYY
 * Evita el desplazamiento de zona horaria parseando como fecha local.
 */
function formatDate(str) {
  if (!str) return "—";
  const [year, month, day] = str.split("T")[0].split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}

/** Capitaliza la primera letra de cada palabra */
function capitalize(str) {
  if (!str) return "—";
  return str.toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

/** Genera iniciales del nombre (máx. 2 letras) */
function initials(name) {
  if (!name) return "US";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

/** Clase de role badge */
function roleBadgeClass(role) {
  const map = { admin: "role-admin", coach: "role-coach", user: "role-user" };
  return map[role] || "role-user";
}

/** Texto descriptivo del rol */
function roleLabelText(role) {
  const labels = { admin: "Administrador", coach: "Entrenador", user: "Usuario del Sistema" };
  return labels[role] || "Usuario";
}

/* ── Toast ─────────────────────────────── */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icons = { success: "check_circle", error: "error", info: "info" };
  toast.innerHTML = `
    <span class="material-symbols-outlined">${icons[type] || "info"}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 3800);
}

/* ── Validaciones de formulario ─────────────────────────────── */
function setError(inputEl, errorId, msg) {
  const errEl = document.getElementById(errorId);
  if (errEl) errEl.textContent = msg;
  if (inputEl) inputEl.classList.add("input-error");
}

function clearPwErrors() {
  ["err-current-pw", "err-new-pw", "err-confirm-pw"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
  ["f-current-pw", "f-new-pw", "f-confirm-pw"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("input-error");
  });
}

/* ══════════════════════════════════════════════════
   3. Carga y render del perfil
      GET /api/auth/me
══════════════════════════════════════════════════ */
let currentUser = null;

async function loadProfile() {
  const base = getStoredUser();
  if (!base) return;

  // Datos frescos desde el backend
  const result = await apiCall("/auth/me", "GET", null, getToken());

  if (result.ok && result.data) {
    currentUser = result.data;
    // Sincronizar localStorage con datos frescos
    const merged = { ...base, ...currentUser };
    localStorage.setItem("user", JSON.stringify(merged));
  } else {
    currentUser = base;
  }

  renderProfile(currentUser);
}

function renderProfile(u) {
  const name      = u.full_name || "";
  const email     = (u.email || "").toLowerCase();
  const role      = u.role || "user";
  const birthdate = u.birth_date || "";
  const createdAt = u.created_at || u.createdAt || "";

  // Extraer deporte y notas del objeto metadata del backend
  // El modelo espera: { sports: [{ name, frequency_per_week }], ...otros }
  const meta         = u.metadata || {};
  const firstSport   = Array.isArray(meta.sports) && meta.sports[0]
    ? meta.sports[0].name || ""
    : "";
  const metaDisplay  = Array.isArray(meta.sports) && meta.sports.length
    ? meta.sports.map((s) => `${s.name}${s.frequency_per_week ? ` (${s.frequency_per_week}x/semana)` : ""}`).join(", ")
    : "—";

  // ── Sidebar card
  setText("avatar-initials",  initials(name));
  setText("card-name",        capitalize(name));
  setText("card-role-label",  roleLabelText(role));
  setText("card-email",       email || "—");
  setText("card-birthdate",   formatDate(birthdate));
  setText("card-role",        role);
  setText("card-created",     formatDate(createdAt));

  const badge = document.getElementById("card-role-badge");
  if (badge) {
    badge.textContent = role;
    badge.className   = `role-badge ${roleBadgeClass(role)}`;
  }

  // ── Readonly view
  setText("ro-name",      capitalize(name));
  setText("ro-email",     email || "—");
  setText("ro-birthdate", formatDate(birthdate));
  setText("ro-metadata",  metaDisplay);

  // ── Pre-rellenar formulario de edición
  setValue("f-full-name", name);
  setValue("f-email",     email);
  setValue("f-birthdate", birthdate ? birthdate.split("T")[0] : "");
  setValue("f-sport",     firstSport);

  // "Otros/metadata" como JSON legible si hay campos extra además de sports
  const extraMeta = Object.keys(meta)
    .filter((k) => k !== "sports")
    .map((k) => `${k}: ${JSON.stringify(meta[k])}`)
    .join("\n");
  setValue("f-metadata", extraMeta);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? "";
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
}

/* ══════════════════════════════════════════════════
   4. Modo edición — Información Personal
══════════════════════════════════════════════════ */
const infoReadonly    = document.getElementById("info-readonly");
const formInfo        = document.getElementById("form-info");
const btnEditarPerfil = document.getElementById("btn-editar-perfil");
const btnCancelarInfo = document.getElementById("btn-cancelar-info");

function enterEditMode() {
  infoReadonly.classList.add("hidden");
  formInfo.classList.remove("hidden");
  btnEditarPerfil.classList.add("hidden");
  document.getElementById("f-full-name").focus();
}

function exitEditMode() {
  formInfo.classList.add("hidden");
  infoReadonly.classList.remove("hidden");
  btnEditarPerfil.classList.remove("hidden");
  // Limpiar errores del formulario de info
  ["err-full-name", "err-email", "err-birthdate"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
  ["f-full-name", "f-email", "f-birthdate"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("input-error");
  });
}

btnEditarPerfil?.addEventListener("click", enterEditMode);
btnCancelarInfo?.addEventListener("click", exitEditMode);

/* ── Submit: actualizar perfil ──────────────────────────────────
   PUT /api/auth/me
   Payload aceptado: { full_name, email, birth_date, metadata }
   metadata debe ser objeto JSON: { sports: [{ name, frequency_per_week }] }
────────────────────────────────────────────────────────────────── */
formInfo?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Limpiar errores
  ["err-full-name", "err-email", "err-birthdate"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
  ["f-full-name", "f-email", "f-birthdate"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("input-error");
  });

  const fullName = document.getElementById("f-full-name").value.trim();
  const email    = document.getElementById("f-email").value.trim();

  let valid = true;

  if (!fullName) {
    setError(document.getElementById("f-full-name"), "err-full-name", "El nombre es obligatorio.");
    valid = false;
  } else if (fullName.length < 3) {
    setError(document.getElementById("f-full-name"), "err-full-name", "El nombre debe tener al menos 3 caracteres.");
    valid = false;
  }

  if (!email) {
    setError(document.getElementById("f-email"), "err-email", "El email es obligatorio.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError(document.getElementById("f-email"), "err-email", "Email inválido.");
    valid = false;
  }

  if (!valid) return;

  // Construir payload
  const payload = { full_name: fullName, email };

  const birthdate = document.getElementById("f-birthdate").value;
  if (birthdate) payload.birth_date = birthdate; // YYYY-MM-DD ← formato que acepta el backend

  // Construir metadata como objeto con sports[]
  const sportName = document.getElementById("f-sport").value.trim();
  const existingMeta = currentUser?.metadata || {};
  payload.metadata = {
    ...existingMeta,
    sports: sportName
      ? [{ name: sportName }]
      : (existingMeta.sports || []),
  };

  const btnGuardar = document.getElementById("btn-guardar-info");
  btnGuardar.disabled = true;
  btnGuardar.innerHTML = `<span class="material-symbols-outlined spin">sync</span> Guardando…`;

  // PUT /api/auth/me
  const result = await apiCall("/auth/me", "PUT", payload, getToken());

  btnGuardar.disabled = false;
  btnGuardar.innerHTML = `<span class="material-symbols-outlined">check</span> Guardar cambios`;

  if (!result.ok) {
    showToast(result.message || "No se pudo actualizar el perfil.", "error");
    return;
  }

  // Actualizar estado local
  currentUser = { ...currentUser, ...payload };
  const stored = getStoredUser();
  localStorage.setItem("user", JSON.stringify({ ...stored, ...payload }));

  renderProfile(currentUser);
  exitEditMode();
  showToast("Perfil actualizado correctamente.", "success");
});

/* ══════════════════════════════════════════════════
   5. Cambio de contraseña
      PUT /api/auth/me/password
      Payload: { current_password, new_password, confirm_password }
      El backend valida la contraseña actual con bcrypt internamente.
      Si es incorrecta devuelve 401 con message 'La contraseña actual es incorrecta.'
══════════════════════════════════════════════════ */
document.getElementById("form-password")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearPwErrors();

  const currentPw = document.getElementById("f-current-pw").value;
  const newPw     = document.getElementById("f-new-pw").value;
  const confirmPw = document.getElementById("f-confirm-pw").value;

  // ── Validaciones frontend ──
  let valid = true;

  if (!currentPw) {
    setError(document.getElementById("f-current-pw"), "err-current-pw", "Ingresa tu contraseña actual.");
    valid = false;
  }

  if (!newPw) {
    setError(document.getElementById("f-new-pw"), "err-new-pw", "La nueva contraseña es obligatoria.");
    valid = false;
  } else if (newPw.length < 8) {
    setError(document.getElementById("f-new-pw"), "err-new-pw", "La contraseña debe tener mínimo 8 caracteres.");
    valid = false;
  }

  if (!confirmPw) {
    setError(document.getElementById("f-confirm-pw"), "err-confirm-pw", "Confirma tu nueva contraseña.");
    valid = false;
  } else if (newPw && newPw !== confirmPw) {
    setError(document.getElementById("f-confirm-pw"), "err-confirm-pw", "Las contraseñas no coinciden.");
    valid = false;
  }

  if (!valid) return;

  const btnActualizar = document.getElementById("btn-actualizar-pw");
  btnActualizar.disabled = true;
  btnActualizar.innerHTML = `<span class="material-symbols-outlined spin">sync</span> Actualizando…`;

  // PUT /api/auth/me/password
  // El backend valida current_password con bcrypt y responde 401 si es incorrecta
  const result = await apiCall("/auth/me/password", "PUT", {
    current_password: currentPw,
    new_password:     newPw,
    confirm_password: confirmPw,
  }, getToken());

  btnActualizar.disabled = false;
  btnActualizar.innerHTML = `<span class="material-symbols-outlined">lock_reset</span> Actualizar contraseña`;

  if (!result.ok) {
    // Intentar mapear el error al campo correspondiente
    const msg = result.message || "No se pudo cambiar la contraseña.";

    if (msg.toLowerCase().includes("actual") || msg.toLowerCase().includes("incorrecta")) {
      setError(document.getElementById("f-current-pw"), "err-current-pw", msg);
    } else if (msg.toLowerCase().includes("nueva") || msg.toLowerCase().includes("8")) {
      setError(document.getElementById("f-new-pw"), "err-new-pw", msg);
    } else if (msg.toLowerCase().includes("coinciden")) {
      setError(document.getElementById("f-confirm-pw"), "err-confirm-pw", msg);
    } else {
      showToast(msg, "error");
    }
    return;
  }

  // Limpiar campos tras éxito
  document.getElementById("f-current-pw").value = "";
  document.getElementById("f-new-pw").value     = "";
  document.getElementById("f-confirm-pw").value  = "";

  showToast("Contraseña actualizada correctamente.", "success");
});

/* ══════════════════════════════════════════════════
   6. Toggle visibilidad contraseñas
══════════════════════════════════════════════════ */
document.querySelectorAll(".toggle-pw").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const icon  = btn.querySelector(".material-symbols-outlined");
    if (!input) return;
    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "visibility_off";
    } else {
      input.type = "password";
      icon.textContent = "visibility";
    }
  });
});

/* ══════════════════════════════════════════════════
   7. Inicialización
══════════════════════════════════════════════════ */
loadProfile();

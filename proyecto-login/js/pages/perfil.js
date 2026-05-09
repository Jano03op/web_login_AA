/**
 * perfil.js
 * Módulo Mi Perfil — todos los roles
 *
 * Endpoints utilizados:
 *   GET  /api/auth/me               → datos del usuario autenticado
 *   PUT  /api/auth/me               → actualizar perfil (full_name, email, birth_date, metadata)
 *   PUT  /api/auth/me/password      → cambiar contraseña { current_password, new_password, confirm_password }
 */

import { apiCall, getToken } from "../services/api-client.js";
import { isValidEmail, isValidPassword, isValidFullName } from "../utils/validations.js";
import { showToast, clearInputErrors } from "../utils/ui.js";
import { requireRole, getStoredUser, setupLogout } from "../utils/auth.js";

/* ══════════════════════════════════════════════════
   1. Auth guard — cualquier rol autenticado
══════════════════════════════════════════════════ */
requireRole(); // redirige a login si no hay sesión
setupLogout();

/* ══════════════════════════════════════════════════
   2. Utilidades de formato
══════════════════════════════════════════════════ */

/**
 * Formatea fecha YYYY-MM-DD → DD/MM/YYYY.
 * Evita el desplazamiento de zona horaria parseando como fecha local.
 * @param {string} str
 * @returns {string}
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

/** Clase CSS del role badge */
function roleBadgeClass(role) {
  const map = { admin: "role-admin", coach: "role-coach", user: "role-user" };
  return map[role] || "role-user";
}

/** Texto descriptivo del rol */
function roleLabelText(role) {
  const labels = { admin: "Administrador", coach: "Entrenador", user: "Usuario del Sistema" };
  return labels[role] || "Usuario";
}

/* ══════════════════════════════════════════════════
   3. Utilidades DOM
══════════════════════════════════════════════════ */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? "";
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
}

function setError(inputEl, errorId, msg) {
  const errEl = document.getElementById(errorId);
  if (errEl) errEl.textContent = msg;
  if (inputEl) inputEl.classList.add("input-error");
}

/* ══════════════════════════════════════════════════
   4. Carga y render del perfil
      GET /api/auth/me
══════════════════════════════════════════════════ */
let currentUser = null;

async function loadProfile() {
  const base = getStoredUser();
  if (!base) return;

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

  // Extraer deporte y notas del objeto metadata
  // El modelo espera: { sports: [{ name, frequency_per_week }], ...otros }
  const meta        = u.metadata || {};
  const firstSport  = Array.isArray(meta.sports) && meta.sports[0]
    ? meta.sports[0].name || ""
    : "";
  const metaDisplay = Array.isArray(meta.sports) && meta.sports.length
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

  // ── Vista de solo lectura
  setText("ro-name",      capitalize(name));
  setText("ro-email",     email || "—");
  setText("ro-birthdate", formatDate(birthdate));
  setText("ro-metadata",  metaDisplay);

  // ── Pre-rellenar formulario de edición
  setValue("f-full-name", name);
  setValue("f-email",     email);
  setValue("f-birthdate", birthdate ? birthdate.split("T")[0] : "");
  setValue("f-sport",     firstSport);

  // Campos extra de metadata como texto plano
  const extraMeta = Object.keys(meta)
    .filter((k) => k !== "sports")
    .map((k) => `${k}: ${JSON.stringify(meta[k])}`)
    .join("\n");
  setValue("f-metadata", extraMeta);
}

/* ══════════════════════════════════════════════════
   5. Modo edición — Información Personal
══════════════════════════════════════════════════ */
const infoReadonly    = document.getElementById("info-readonly");
const formInfo        = document.getElementById("form-info");
const btnEditarPerfil = document.getElementById("btn-editar-perfil");
const btnCancelarInfo = document.getElementById("btn-cancelar-info");

const INFO_INPUT_IDS = ["f-full-name", "f-email", "f-birthdate"];
const INFO_ERROR_IDS = ["err-full-name", "err-email", "err-birthdate"];

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
  clearInputErrors(INFO_INPUT_IDS, INFO_ERROR_IDS);
}

btnEditarPerfil?.addEventListener("click", enterEditMode);
btnCancelarInfo?.addEventListener("click", exitEditMode);

/* ── Submit: actualizar perfil ────────────────────────────────
   PUT /api/auth/me
   Payload aceptado: { full_name, email, birth_date, metadata }
   metadata debe ser objeto JSON: { sports: [{ name, frequency_per_week }] }
──────────────────────────────────────────────────────────────── */
function validateInfoForm(fullName, email) {
  clearInputErrors(INFO_INPUT_IDS, INFO_ERROR_IDS);
  let valid = true;

  if (!isValidFullName(fullName)) {
    setError(document.getElementById("f-full-name"), "err-full-name",
      fullName ? "El nombre debe tener al menos 3 caracteres." : "El nombre es obligatorio.");
    valid = false;
  }

  if (!email) {
    setError(document.getElementById("f-email"), "err-email", "El email es obligatorio.");
    valid = false;
  } else if (!isValidEmail(email)) {
    setError(document.getElementById("f-email"), "err-email", "Email inválido.");
    valid = false;
  }

  return valid;
}

formInfo?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("f-full-name").value.trim();
  const email    = document.getElementById("f-email").value.trim();

  if (!validateInfoForm(fullName, email)) return;

  const payload = { full_name: fullName, email };

  const birthdate = document.getElementById("f-birthdate").value;
  if (birthdate) payload.birth_date = birthdate;

  // Construir metadata con sports[]
  const sportName    = document.getElementById("f-sport").value.trim();
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
   6. Cambio de contraseña
      PUT /api/auth/me/password
      Payload: { current_password, new_password, confirm_password }
══════════════════════════════════════════════════ */
const PW_INPUT_IDS = ["f-current-pw", "f-new-pw", "f-confirm-pw"];
const PW_ERROR_IDS = ["err-current-pw", "err-new-pw", "err-confirm-pw"];

function validatePasswordForm(currentPw, newPw, confirmPw) {
  clearInputErrors(PW_INPUT_IDS, PW_ERROR_IDS);
  let valid = true;

  if (!currentPw) {
    setError(document.getElementById("f-current-pw"), "err-current-pw", "Ingresa tu contraseña actual.");
    valid = false;
  }

  if (!newPw) {
    setError(document.getElementById("f-new-pw"), "err-new-pw", "La nueva contraseña es obligatoria.");
    valid = false;
  } else if (!isValidPassword(newPw)) {
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

  return valid;
}

document.getElementById("form-password")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentPw = document.getElementById("f-current-pw").value;
  const newPw     = document.getElementById("f-new-pw").value;
  const confirmPw = document.getElementById("f-confirm-pw").value;

  if (!validatePasswordForm(currentPw, newPw, confirmPw)) return;

  const btnActualizar = document.getElementById("btn-actualizar-pw");
  btnActualizar.disabled = true;
  btnActualizar.innerHTML = `<span class="material-symbols-outlined spin">sync</span> Actualizando…`;

  const result = await apiCall("/auth/me/password", "PUT", {
    current_password: currentPw,
    new_password:     newPw,
    confirm_password: confirmPw,
  }, getToken());

  btnActualizar.disabled = false;
  btnActualizar.innerHTML = `<span class="material-symbols-outlined">lock_reset</span> Actualizar contraseña`;

  if (!result.ok) {
    const msg = result.message || "No se pudo cambiar la contraseña.";
    const msgLower = msg.toLowerCase();

    if (msgLower.includes("actual") || msgLower.includes("incorrecta")) {
      setError(document.getElementById("f-current-pw"), "err-current-pw", msg);
    } else if (msgLower.includes("nueva") || msgLower.includes("8")) {
      setError(document.getElementById("f-new-pw"), "err-new-pw", msg);
    } else if (msgLower.includes("coinciden")) {
      setError(document.getElementById("f-confirm-pw"), "err-confirm-pw", msg);
    } else {
      showToast(msg, "error");
    }
    return;
  }

  // Limpiar campos tras éxito
  PW_INPUT_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  showToast("Contraseña actualizada correctamente.", "success");
});

/* ══════════════════════════════════════════════════
   7. Toggle visibilidad contraseñas
══════════════════════════════════════════════════ */
document.querySelectorAll(".toggle-pw").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const icon  = btn.querySelector(".material-symbols-outlined");
    if (!input) return;
    if (input.type === "password") {
      input.type       = "text";
      icon.textContent = "visibility_off";
    } else {
      input.type       = "password";
      icon.textContent = "visibility";
    }
  });
});

/* ══════════════════════════════════════════════════
   8. Inicialización
══════════════════════════════════════════════════ */
loadProfile();

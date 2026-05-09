/**
 * usuarios.js
 * Módulo de Gestión de Usuarios — rol Administrador
 * Conectado al backend: http://localhost:3000/api
 */

import { apiCall, getToken } from "../services/api-client.js";
import { isValidEmail, isValidPassword, isValidFullName } from "../utils/validations.js";
import { showToast } from "../utils/ui.js";

/* ══════════════════════════════════════════════════
   1. Estado global del módulo
══════════════════════════════════════════════════ */
let allUsers       = [];
let editingUserId  = null;
let pendingDeleteId = null;

/* ══════════════════════════════════════════════════
   2. Referencias al DOM
══════════════════════════════════════════════════ */
const tableLoading  = document.getElementById("table-loading");
const tableError    = document.getElementById("table-error");
const tableErrorMsg = document.getElementById("table-error-msg");
const tableWrapper  = document.getElementById("table-wrapper");
const tbody         = document.getElementById("users-tbody");
const noResults     = document.getElementById("no-results");
const searchInput   = document.getElementById("search-input");
const filterRole    = document.getElementById("filter-role");

// Modal crear/editar
const modalOverlay    = document.getElementById("modal-overlay");
const modalTitle      = document.getElementById("modal-title");
const userForm        = document.getElementById("user-form");
const formUserId      = document.getElementById("form-user-id");
const formFullName    = document.getElementById("form-full-name");
const formEmail       = document.getElementById("form-email");
const formRole        = document.getElementById("form-role");
const formPassword    = document.getElementById("form-password");
const formConfirmPw   = document.getElementById("form-confirm-password");
const passwordSection = document.getElementById("password-section");

// Modal confirmar eliminación
const confirmOverlay = document.getElementById("confirm-overlay");
const confirmMsg     = document.getElementById("confirm-msg");

/* ══════════════════════════════════════════════════
   3. Utilidades de formato
══════════════════════════════════════════════════ */

/**
 * Formatea una fecha ISO a DD/MM/YYYY.
 * Parsea YYYY-MM-DD directamente para evitar desfase de zona horaria.
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const raw = String(dateStr).split("T")[0];
  const [year, month, day] = raw.split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}

/**
 * Genera un badge HTML para el rol.
 * @param {string} role
 * @returns {string}
 */
function roleBadge(role) {
  const map = { admin: "role-admin", coach: "role-coach", user: "role-user" };
  const cls = map[role] || "role-user";
  return `<span class="role-badge ${cls}">${role || "user"}</span>`;
}

/* ══════════════════════════════════════════════════
   4. Validaciones del formulario
══════════════════════════════════════════════════ */
function clearErrors() {
  document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".input-error").forEach((el) =>
    el.classList.remove("input-error"),
  );
}

function setError(inputEl, errorEl, msg) {
  errorEl.textContent = msg;
  inputEl.classList.add("input-error");
}

function validateForm(isEdit) {
  clearErrors();
  let valid = true;

  if (!isValidFullName(formFullName.value.trim())) {
    setError(formFullName, document.getElementById("err-full-name"),
      formFullName.value.trim() ? "El nombre debe tener al menos 3 caracteres." : "El nombre completo es obligatorio.");
    valid = false;
  }

  if (!formEmail.value.trim()) {
    setError(formEmail, document.getElementById("err-email"), "El email es obligatorio.");
    valid = false;
  } else if (!isValidEmail(formEmail.value.trim())) {
    setError(formEmail, document.getElementById("err-email"), "Ingresa un email válido.");
    valid = false;
  }

  if (!formRole.value) {
    setError(formRole, document.getElementById("err-role"), "Debes seleccionar un rol.");
    valid = false;
  }

  // Contraseña solo en modo creación
  if (!isEdit) {
    if (!formPassword.value) {
      setError(formPassword, document.getElementById("err-password"), "La contraseña es obligatoria.");
      valid = false;
    } else if (!isValidPassword(formPassword.value)) {
      setError(formPassword, document.getElementById("err-password"), "La contraseña debe tener mínimo 8 caracteres.");
      valid = false;
    }

    if (!formConfirmPw.value) {
      setError(formConfirmPw, document.getElementById("err-confirm-password"), "Debes confirmar la contraseña.");
      valid = false;
    } else if (formPassword.value !== formConfirmPw.value) {
      setError(formConfirmPw, document.getElementById("err-confirm-password"), "Las contraseñas no coinciden.");
      valid = false;
    }
  }

  return valid;
}

/* ══════════════════════════════════════════════════
   5. Render de la tabla
══════════════════════════════════════════════════ */
function renderTable(users) {
  tbody.innerHTML = "";

  if (!users.length) {
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");

  users.forEach((u) => {
    const tr = document.createElement("tr");
    tr.dataset.userId = u.id;
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.full_name || u.name || "—"}</td>
      <td>${u.email || "—"}</td>
      <td>${roleBadge(u.role)}</td>
      <td>${formatDate(u.created_at || u.createdAt)}</td>
      <td>
        <div class="action-btns">
          <button
            class="btn-action btn-edit"
            data-id="${u.id}"
            title="Editar usuario"
            aria-label="Editar usuario ${u.full_name || u.name}"
          >
            <span class="material-symbols-outlined">edit</span>
            Editar
          </button>
          <button
            class="btn-action btn-delete"
            data-id="${u.id}"
            data-name="${u.full_name || u.name || "este usuario"}"
            title="Eliminar usuario"
            aria-label="Eliminar usuario ${u.full_name || u.name}"
          >
            <span class="material-symbols-outlined">delete</span>
            Eliminar
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ── Filtrar lista según búsqueda y rol ── */
function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const role  = filterRole.value;

  const filtered = allUsers.filter((u) => {
    const nameMatch  = (u.full_name || u.name || "").toLowerCase().includes(query);
    const emailMatch = (u.email || "").toLowerCase().includes(query);
    const roleMatch  = !role || u.role === role;
    return (nameMatch || emailMatch) && roleMatch;
  });

  renderTable(filtered);
}

/* ══════════════════════════════════════════════════
   6. Carga de usuarios desde el API
══════════════════════════════════════════════════ */
async function loadUsers() {
  tableLoading.classList.remove("hidden");
  tableError.classList.add("hidden");
  tableWrapper.classList.add("hidden");

  const result = await apiCall("/users", "GET", null, getToken());

  tableLoading.classList.add("hidden");

  if (!result.ok) {
    tableErrorMsg.textContent = result.message || "No se pudo cargar la lista de usuarios.";
    tableError.classList.remove("hidden");
    return;
  }

  allUsers = Array.isArray(result.data)
    ? result.data
    : (result.data?.users || []);

  tableWrapper.classList.remove("hidden");
  applyFilters();
}

/* ══════════════════════════════════════════════════
   7. Abrir / cerrar modal crear/editar
══════════════════════════════════════════════════ */
function openModalCreate() {
  editingUserId = null;
  modalTitle.textContent = "Nuevo Usuario";
  userForm.reset();
  clearErrors();
  formUserId.value = "";
  passwordSection.classList.remove("hidden");
  formPassword.required    = true;
  formConfirmPw.required   = true;
  modalOverlay.classList.remove("hidden");
  formFullName.focus();
}

function openModalEdit(user) {
  editingUserId = user.id;
  modalTitle.textContent = "Editar Usuario";
  userForm.reset();
  clearErrors();
  formUserId.value   = user.id;
  formFullName.value = user.full_name || user.name || "";
  formEmail.value    = user.email || "";
  formRole.value     = user.role || "user";
  // Ocultar campos de contraseña en modo edición
  passwordSection.classList.add("hidden");
  formPassword.required  = false;
  formConfirmPw.required = false;
  modalOverlay.classList.remove("hidden");
  formFullName.focus();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  editingUserId = null;
  userForm.reset();
  clearErrors();
}

/* ══════════════════════════════════════════════════
   8. Submit del formulario (crear o editar)
══════════════════════════════════════════════════ */
async function handleFormSubmit(e) {
  e.preventDefault();

  const isEdit = Boolean(editingUserId);
  if (!validateForm(isEdit)) return;

  const btnGuardar = document.getElementById("btn-guardar");
  btnGuardar.disabled = true;
  btnGuardar.innerHTML = `<span class="material-symbols-outlined spin">sync</span> Guardando…`;

  const payload = {
    full_name: formFullName.value.trim(),
    email:     formEmail.value.trim(),
    role:      formRole.value,
  };

  if (!isEdit) {
    payload.password = formPassword.value;
    payload.metadata = { sports: [] };
  }

  const endpoint = isEdit ? `/users/${editingUserId}` : "/users";
  const method   = isEdit ? "PUT" : "POST";
  const result   = await apiCall(endpoint, method, payload, getToken());

  btnGuardar.disabled = false;
  btnGuardar.innerHTML = `<span class="material-symbols-outlined">save</span> Guardar`;

  if (!result.ok) {
    showToast(result.message || "Ocurrió un error.", "error");
    return;
  }

  showToast(
    isEdit ? "Usuario actualizado correctamente." : "Usuario creado correctamente.",
    "success",
  );
  closeModal();
  await loadUsers();
}

/* ══════════════════════════════════════════════════
   9. Eliminar usuario
══════════════════════════════════════════════════ */
function openConfirmDelete(id, name) {
  pendingDeleteId = id;
  confirmMsg.textContent = `¿Estás seguro de que deseas eliminar al usuario "${name}"? Esta acción no se puede deshacer.`;
  confirmOverlay.classList.remove("hidden");
}

function closeConfirmModal() {
  confirmOverlay.classList.add("hidden");
  pendingDeleteId = null;
}

async function handleConfirmDelete() {
  if (!pendingDeleteId) return;

  const btnDel = document.getElementById("btn-confirm-delete");
  btnDel.disabled = true;
  btnDel.innerHTML = `<span class="material-symbols-outlined spin">sync</span> Eliminando…`;

  const result = await apiCall(`/users/${pendingDeleteId}`, "DELETE", null, getToken());

  btnDel.disabled = false;
  btnDel.innerHTML = `<span class="material-symbols-outlined">delete</span> Eliminar`;

  if (!result.ok) {
    showToast(result.message || "No se pudo eliminar el usuario.", "error");
    closeConfirmModal();
    return;
  }

  showToast("Usuario eliminado correctamente.", "success");
  closeConfirmModal();
  await loadUsers();
}

/* ══════════════════════════════════════════════════
   10. Password toggle (visibility)
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
   11. Delegación de eventos (tabla)
══════════════════════════════════════════════════ */
tbody.addEventListener("click", (e) => {
  const editBtn   = e.target.closest(".btn-edit");
  const deleteBtn = e.target.closest(".btn-delete");

  if (editBtn) {
    const id   = Number(editBtn.dataset.id);
    const user = allUsers.find((u) => u.id === id);
    if (user) openModalEdit(user);
  }

  if (deleteBtn) {
    const id   = Number(deleteBtn.dataset.id);
    const name = deleteBtn.dataset.name || "este usuario";
    openConfirmDelete(id, name);
  }
});

/* ══════════════════════════════════════════════════
   12. Eventos generales
══════════════════════════════════════════════════ */
document.getElementById("btn-nuevo-usuario").addEventListener("click", openModalCreate);

document.getElementById("modal-close-btn").addEventListener("click", closeModal);
document.getElementById("btn-cancelar").addEventListener("click", closeModal);
document.getElementById("confirm-close-btn").addEventListener("click", closeConfirmModal);
document.getElementById("btn-cancel-delete").addEventListener("click", closeConfirmModal);
document.getElementById("btn-confirm-delete").addEventListener("click", handleConfirmDelete);
document.getElementById("btn-retry").addEventListener("click", loadUsers);

// Click fuera del modal → cerrar
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
confirmOverlay.addEventListener("click", (e) => {
  if (e.target === confirmOverlay) closeConfirmModal();
});

// Escape → cerrar modales
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeConfirmModal();
  }
});

// Submit formulario
userForm.addEventListener("submit", handleFormSubmit);

// Filtros en tiempo real
searchInput.addEventListener("input", applyFilters);
filterRole.addEventListener("change", applyFilters);

/* ══════════════════════════════════════════════════
   13. Inicialización
══════════════════════════════════════════════════ */
loadUsers();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "RemovedKEY",
  authDomain: "hc-testing-center.firebaseapp.com",
  databaseURL: "https://hc-testing-center-default-rtdb.firebaseio.com",
  projectId: "hc-testing-center",
  storageBucket: "hc-testing-center.firebasestorage.app",
  messagingSenderId: "555153286496",
  appId: "1:555153286496:web:76dddf80bd00af838f2a05"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const instructorsRef = ref(db, "instructors");

const firstNameInput = document.getElementById("firstNameInput");
const lastNameInput = document.getElementById("lastNameInput");
const departmentInput = document.getElementById("departmentInput");
const codeInput = document.getElementById("codeInput");
const extensionInput = document.getElementById("extensionInput");
const alternatePhoneInput = document.getElementById("alternatePhoneInput");
const addInstructorBtn = document.getElementById("addInstructorBtn");
const instructorError = document.getElementById("instructorError");

const instructorList = document.getElementById("instructorList");
const instructorCount = document.getElementById("instructorCount");
const instructorSearchInput = document.getElementById("instructorSearchInput");
const departmentFilter = document.getElementById("departmentFilter");

const editInstructorModalElement = document.getElementById("editInstructorModal");
const editInstructorModal = new bootstrap.Modal(editInstructorModalElement);
const editFirstNameInput = document.getElementById("editFirstNameInput");
const editLastNameInput = document.getElementById("editLastNameInput");
const editDepartmentInput = document.getElementById("editDepartmentInput");
const editCodeInput = document.getElementById("editCodeInput");
const editExtensionInput = document.getElementById("editExtensionInput");
const editAlternatePhoneInput = document.getElementById("editAlternatePhoneInput");
const editInstructorError = document.getElementById("editInstructorError");
const saveEditInstructorBtn = document.getElementById("saveEditInstructorBtn");

const deleteInstructorModalElement = document.getElementById("deleteInstructorModal");
const deleteInstructorModal = new bootstrap.Modal(deleteInstructorModalElement);
const deleteInstructorMessage = document.getElementById("deleteInstructorMessage");
const confirmDeleteInstructorBtn = document.getElementById("confirmDeleteInstructorBtn");

let instructors = [];
let editingInstructorId = null;
let deletingInstructorId = null;

function getInstructorName(instructor) {
  return `${instructor.lastName || ""}, ${instructor.firstName || ""}`.trim();
}

function isRecentlyAdded(instructor) {
  const RECENT_MS = 48 * 60 * 60 * 1000;

  return instructor.createdAtMs &&
    Date.now() - instructor.createdAtMs <= RECENT_MS;
}

function renderInstructors() {
  instructorList.innerHTML = "";

  const searchTerm = instructorSearchInput.value.trim().toLowerCase();
  const selectedDepartment = departmentFilter.value;

  const filteredInstructors = instructors.filter(instructor => {
    const searchableText = [
      instructor.firstName,
      instructor.lastName,
      instructor.department,
      instructor.code,
      instructor.extension,
      instructor.alternatePhone
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm);

    const matchesDepartment =
      !selectedDepartment ||
      instructor.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  instructorCount.textContent =
    `${filteredInstructors.length} ${filteredInstructors.length === 1 ? "instructor" : "instructors"}`;

  if (!filteredInstructors.length) {
    instructorList.innerHTML =
      `<div class="empty-state">No instructors found.</div>`;
    return;
  }

  filteredInstructors.forEach(instructor => {
    const item = document.createElement("div");
    item.className = "resource-item";

    item.innerHTML = `
      <div class="resource-main">
        <div class="resource-title-row">
          <div class="resource-title">
            ${getInstructorName(instructor)}
          </div>

          ${
            instructor.pinned
              ? `<span class="resource-pin-badge">📌 Pinned</span>`
              : ""
          }

          ${
            isRecentlyAdded(instructor)
              ? `<span class="resource-new-badge">New</span>`
              : ""
          }
        </div>

        <div class="resource-meta">
          ${instructor.department || "No department"}${instructor.code ? ` • ${instructor.code}` : ""}
        </div>

        <div class="resource-description">
          <strong>Extension:</strong> ${instructor.extension || "-"}
          ${
            instructor.alternatePhone
              ? `<br><strong>Alternate Phone:</strong> ${instructor.alternatePhone}`
              : ""
          }
          ${
            instructor.updatedAt
              ? `<br><span class="resource-meta">Last edited ${instructor.updatedAt}</span>`
              : ""
          }
        </div>
      </div>

      <div class="resource-actions">
        <button
          class="resource-edit-btn"
          onclick="toggleInstructorPin('${instructor.id}')"
        >
          ${instructor.pinned ? "Unpin" : "Pin"}
        </button>

        <button
          class="resource-edit-btn"
          onclick="openEditInstructorModal('${instructor.id}')"
        >
          Edit
        </button>

        <button
          class="resource-delete-btn"
          onclick="openDeleteInstructorModal('${instructor.id}')"
        >
          Delete
        </button>
      </div>
    `;

    instructorList.appendChild(item);
  });
}

function updateDepartmentFilter() {
  const currentValue = departmentFilter.value;

  const departments = [
    ...new Set(
      instructors
        .map(instructor => instructor.department)
        .filter(Boolean)
        .sort()
    )
  ];

  departmentFilter.innerHTML =
    `<option value="">All Departments</option>`;

  departments.forEach(department => {
    const option = document.createElement("option");
    option.value = department;
    option.textContent = department;
    departmentFilter.appendChild(option);
  });

  departmentFilter.value = currentValue;
}

function addInstructor() {
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const department = departmentInput.value.trim();
  const code = codeInput.value.trim();
  const extension = extensionInput.value.trim();
  const alternatePhone = alternatePhoneInput.value.trim();

  instructorError.textContent = "";

  if (!firstName || !lastName || !department) {
    instructorError.textContent =
      "First name, last name, and department are required.";
    return;
  }

  const newInstructorRef = push(instructorsRef);

  const instructor = {
    id: newInstructorRef.key,
    firstName,
    lastName,
    department,
    code,
    extension,
    alternatePhone,
    pinned: false,
    createdAt: new Date().toLocaleString(),
    createdAtMs: Date.now()
  };

  set(newInstructorRef, instructor);

  firstNameInput.value = "";
  lastNameInput.value = "";
  departmentInput.value = "";
  codeInput.value = "";
  extensionInput.value = "";
  alternatePhoneInput.value = "";
}

window.toggleInstructorPin = function(id) {
  const instructor = instructors.find(item => item.id === id);
  if (!instructor) return;

  update(ref(db, `instructors/${id}`), {
    pinned: !instructor.pinned
  });
};

window.openEditInstructorModal = function(id) {
  const instructor = instructors.find(item => item.id === id);
  if (!instructor) return;

  editingInstructorId = id;
  editInstructorError.textContent = "";

  editFirstNameInput.value = instructor.firstName || "";
  editLastNameInput.value = instructor.lastName || "";
  editDepartmentInput.value = instructor.department || "";
  editCodeInput.value = instructor.code || "";
  editExtensionInput.value = instructor.extension || "";
  editAlternatePhoneInput.value = instructor.alternatePhone || "";

  editInstructorModal.show();
};

saveEditInstructorBtn.addEventListener("click", () => {
  const instructor = instructors.find(item => item.id === editingInstructorId);
  if (!instructor) return;

  const firstName = editFirstNameInput.value.trim();
  const lastName = editLastNameInput.value.trim();
  const department = editDepartmentInput.value.trim();
  const code = editCodeInput.value.trim();
  const extension = editExtensionInput.value.trim();
  const alternatePhone = editAlternatePhoneInput.value.trim();

  editInstructorError.textContent = "";

  if (!firstName || !lastName || !department) {
    editInstructorError.textContent =
      "First name, last name, and department are required.";
    return;
  }

  update(ref(db, `instructors/${editingInstructorId}`), {
    firstName,
    lastName,
    department,
    code,
    extension,
    alternatePhone,
    updatedAt: new Date().toLocaleString(),
    updatedAtMs: Date.now()
  });

  editInstructorModal.hide();
  editingInstructorId = null;
});

window.openDeleteInstructorModal = function(id) {
  const instructor = instructors.find(item => item.id === id);
  if (!instructor) return;

  deletingInstructorId = id;

  deleteInstructorMessage.textContent =
    `Delete instructor "${getInstructorName(instructor)}"?`;

  deleteInstructorModal.show();
};

confirmDeleteInstructorBtn.addEventListener("click", () => {
  if (!deletingInstructorId) return;

  remove(ref(db, `instructors/${deletingInstructorId}`));

  deleteInstructorModal.hide();
  deletingInstructorId = null;
});

addInstructorBtn.addEventListener("click", addInstructor);
instructorSearchInput.addEventListener("input", renderInstructors);
departmentFilter.addEventListener("change", renderInstructors);

onValue(instructorsRef, snapshot => {
  const data = snapshot.val() || {};

  instructors = Object.values(data).sort((a, b) => {
    if ((a.pinned || false) !== (b.pinned || false)) {
      return (b.pinned || false) - (a.pinned || false);
    }

    const lastNameA = (a.lastName || "").toLowerCase();
    const lastNameB = (b.lastName || "").toLowerCase();

    return lastNameA.localeCompare(lastNameB);
  });

  updateDepartmentFilter();
  renderInstructors();
});

async function loadVersion() {
  try {
    const response = await fetch("./assets/data/version.txt");
    const version = (await response.text()).trim();

    document.querySelectorAll(".app-version").forEach(el => {
      el.textContent = version;
    });
  } catch (error) {
    console.error("Unable to load version.", error);
  }
}

loadVersion();

const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const appSidebar = document.getElementById("appSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function openSidebar() {
  appSidebar.classList.add("open");
  sidebarOverlay.classList.add("show");
}

function closeSidebar() {
  appSidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
}

sidebarToggleBtn?.addEventListener("click", openSidebar);
sidebarCloseBtn?.addEventListener("click", closeSidebar);
sidebarOverlay?.addEventListener("click", closeSidebar);
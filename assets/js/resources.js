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

// Firebase configuration
const firebaseConfig = {
  apiKey: "RemovedKEY",
  authDomain: "hc-testing-center.firebaseapp.com",
  databaseURL: "https://hc-testing-center-default-rtdb.firebaseio.com",
  projectId: "hc-testing-center",
  storageBucket: "hc-testing-center.firebasestorage.app",
  messagingSenderId: "555153286496",
  appId: "1:555153286496:web:76dddf80bd00af838f2a05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Firebase Refs
const resourcesRef = ref(db, "resources");

// DOM Elements
const resourceTitleInput = document.getElementById("resourceTitleInput");
const resourceUrlInput = document.getElementById("resourceUrlInput");
const resourceCategoryInput = document.getElementById("resourceCategoryInput");
const resourceDescriptionInput = document.getElementById("resourceDescriptionInput");
const addResourceBtn = document.getElementById("addResourceBtn");
const resourceError = document.getElementById("resourceError");
const resourceList = document.getElementById("resourceList");
const resourceCount = document.getElementById("resourceCount");

// For future search/filter functionality
const resourceSearchInput = document.getElementById("resourceSearchInput");
const resourceCategoryFilter = document.getElementById("resourceCategoryFilter");

// Edit Resource Modal Elements
const editResourceModalElement = document.getElementById("editResourceModal");
const editResourceModal = new bootstrap.Modal(editResourceModalElement);

// Edit Resource Modal Inputs
const editResourceTitleInput = document.getElementById("editResourceTitleInput");
const editResourceUrlInput = document.getElementById("editResourceUrlInput");
const editResourceCategoryInput = document.getElementById("editResourceCategoryInput");
const editResourceDescriptionInput = document.getElementById("editResourceDescriptionInput");
const editResourceError = document.getElementById("editResourceError");
const saveEditResourceBtn = document.getElementById("saveEditResourceBtn");

// Delete Resource Modal Elements
const deleteResourceModalElement = document.getElementById("deleteResourceModal");
const deleteResourceModal = new bootstrap.Modal(deleteResourceModalElement);
const deleteResourceMessage = document.getElementById("deleteResourceMessage");
const confirmDeleteResourceBtn = document.getElementById("confirmDeleteResourceBtn");

let editingResourceId = null;
let deletingResourceId = null;

// Local state
let resources = [];

// Render resources to the page
function renderResources() {
  resourceList.innerHTML = "";

  const searchTerm =
    resourceSearchInput.value.trim().toLowerCase();

  const selectedCategory =
    resourceCategoryFilter.value;

  const filteredResources = resources.filter(resource => {
    const matchesSearch =
      [
        resource.title,
        resource.category,
        resource.description,
        resource.url
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);

    const matchesCategory =
      !selectedCategory ||
      resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  resourceCount.textContent =
    `${filteredResources.length} ${
      filteredResources.length === 1
        ? "resource"
        : "resources"
    }`;

  if (!filteredResources.length) {
    resourceList.innerHTML =
      `<div class="empty-state">No resources found.</div>`;

    return;
  }

  const RECENT_RESOURCE_MS = 48 * 60 * 60 * 1000;
  const now = Date.now();

  filteredResources.forEach(resource => {
    const item = document.createElement("div");
    item.className = "resource-item";

item.innerHTML = `
  <div class="resource-main">
    <div class="resource-title-row">
  <a
    class="resource-title-link"
    href="${resource.url}"
    target="_blank"
    rel="noopener noreferrer"
    onclick="trackResourceOpen('${resource.id}')"
  >
    ${resource.title}
  </a>

  ${
    resource.pinned
      ? `<span class="resource-pin-badge">📌 Pinned</span>`
      : ""
  }

  ${
  resource.createdAtMs &&
  now - resource.createdAtMs <= RECENT_RESOURCE_MS
    ? `<span class="resource-new-badge">New</span>`
    : ""
}
</div>

    <div class="resource-meta">
      ${resource.category || "Uncategorized"} • ${resource.createdAt || "-"} • Opened ${resource.openCount || 0} times
    </div>

    ${
      resource.description
        ? `<div class="resource-description">${resource.description}</div>`
        : ""
    }

    <!-- <div class="resource-url">${resource.url}</div> -->
  </div>

  <div class="resource-actions">
    <a
      class="btn btn-primary-custom resource-open-btn"
      href="${resource.url}"
      target="_blank"
      rel="noopener noreferrer"
      onclick="trackResourceOpen('${resource.id}')"
    >
      Open
    </a>

    <button
      class="resource-edit-btn"
      onclick="openEditResourceModal('${resource.id}')"
    >
      Edit
    </button>

    <button
        class="resource-edit-btn"
        onclick="toggleResourcePin('${resource.id}')"
        >
        ${resource.pinned ? "Unpin" : "Pin"}
    </button>

    <button
      class="resource-delete-btn"
      onclick="openDeleteResourceModal('${resource.id}')"
    >
      Delete
    </button>
  </div>
`;

    resourceList.appendChild(item);
  });
}

// Update category filter options based on existing resource categories
function updateCategoryFilter() {
  const currentValue = resourceCategoryFilter.value;

  const categories = [
    ...new Set(
      resources
        .map(r => r.category)
        .filter(Boolean)
        .sort()
    )
  ];

  resourceCategoryFilter.innerHTML =
    `<option value="">All Categories</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");

    option.value = category;
    option.textContent = category;

    resourceCategoryFilter.appendChild(option);
  });

  resourceCategoryFilter.value = currentValue;
}

// Add new resource to Firebase
function addResource() {
  const title = resourceTitleInput.value.trim();
  const url = resourceUrlInput.value.trim();
  const category = resourceCategoryInput.value.trim();
  const description = resourceDescriptionInput.value.trim();

  resourceError.textContent = "";

  if (!title || !url) {
    resourceError.textContent = "Title and URL are required.";
    return;
  }

  const newResourceRef = push(resourcesRef);

  const resource = {
    id: newResourceRef.key,
    title,
    url,
    category,
    description,
    createdAt: new Date().toLocaleString(),
    createdAtMs: Date.now()
  };

  set(newResourceRef, resource);

  resourceTitleInput.value = "";
  resourceUrlInput.value = "";
  resourceCategoryInput.value = "";
  resourceDescriptionInput.value = "";
}

addResourceBtn.addEventListener("click", addResource);

// Re-render resources when search input or category filter changes
resourceSearchInput.addEventListener("input", renderResources);
resourceCategoryFilter.addEventListener("change", renderResources);

onValue(resourcesRef, snapshot => {
  const data = snapshot.val() || {};

  resources = Object.values(data).sort((a, b) => {
  if ((a.pinned || false) !== (b.pinned || false)) {
    return (b.pinned || false) - (a.pinned || false);
  }

  return (b.createdAtMs || 0) - (a.createdAtMs || 0);
});

  updateCategoryFilter();
  renderResources();
});

// Toggle pin/unpin resource
window.toggleResourcePin = function(id) {
  const resource = resources.find(r => r.id === id);
  if (!resource) return;

  update(ref(db, `resources/${id}`), {
    pinned: !resource.pinned
  });
};

window.openEditResourceModal = function(id) {
  const resource = resources.find(r => r.id === id);
  if (!resource) return;

  editingResourceId = id;
  editResourceError.textContent = "";

  editResourceTitleInput.value = resource.title || "";
  editResourceUrlInput.value = resource.url || "";
  editResourceCategoryInput.value = resource.category || "";
  editResourceDescriptionInput.value = resource.description || "";

  editResourceModal.show();
};

saveEditResourceBtn.addEventListener("click", () => {
  const resource = resources.find(r => r.id === editingResourceId);
  if (!resource) return;

  const title = editResourceTitleInput.value.trim();
  const url = editResourceUrlInput.value.trim();
  const category = editResourceCategoryInput.value.trim();
  const description = editResourceDescriptionInput.value.trim();

  editResourceError.textContent = "";

  if (!title || !url) {
    editResourceError.textContent = "Title and URL are required.";
    return;
  }

  update(ref(db, `resources/${editingResourceId}`), {
    title,
    url,
    category,
    description,
    updatedAt: new Date().toLocaleString(),
    updatedAtMs: Date.now()
  });

  editResourceModal.hide();
  editingResourceId = null;
});

// Track resource opens by updating open count and last opened timestamp in Firebase
window.trackResourceOpen = function(id) {
  const resource = resources.find(r => r.id === id);
  if (!resource) return;

  update(ref(db, `resources/${id}`), {
    openCount: (resource.openCount || 0) + 1,
    lastOpenedAt: new Date().toLocaleString(),
    lastOpenedAtMs: Date.now()
  });
};

window.openDeleteResourceModal = function(id) {
  const resource = resources.find(r => r.id === id);
  if (!resource) return;

  deletingResourceId = id;

  deleteResourceMessage.textContent =
    `Delete resource "${resource.title}"?`;

  deleteResourceModal.show();
};

confirmDeleteResourceBtn.addEventListener("click", () => {
  if (!deletingResourceId) return;

  remove(ref(db, `resources/${deletingResourceId}`));

  deleteResourceModal.hide();
  deletingResourceId = null;
});

// Load app version from version.txt and display it in the UI
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

//Sidebar toggle functionality
const sidebarToggleBtn =
  document.getElementById("sidebarToggleBtn");

const sidebarCloseBtn =
  document.getElementById("sidebarCloseBtn");

const appSidebar =
  document.getElementById("appSidebar");

const sidebarOverlay =
  document.getElementById("sidebarOverlay");

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

loadVersion();
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Database References
const guidesRef = ref(db, "guides");

// UI Elements
const guideTitleInput = document.getElementById("guideTitleInput");
const guideCategoryInput = document.getElementById("guideCategoryInput");
const guideContentInput = document.getElementById("guideContentInput");
const addGuideBtn = document.getElementById("addGuideBtn");
const guideError = document.getElementById("guideError");
const guideList = document.getElementById("guideList");
const guideCount = document.getElementById("guideCount");
const guideSearchInput = document.getElementById("guideSearchInput");
const guideCategoryFilter = document.getElementById("guideCategoryFilter");

const guideImageModalElement =
  document.getElementById("guideImageModal");

const guideImageModal =
  new bootstrap.Modal(guideImageModalElement);

const guideImageViewer =
  document.getElementById("guideImageViewer");

// Modals
const viewGuideModalElement = document.getElementById("viewGuideModal");
const viewGuideModal = new bootstrap.Modal(viewGuideModalElement);
const viewGuideTitle = document.getElementById("viewGuideTitle");
const viewGuideMeta = document.getElementById("viewGuideMeta");
const viewGuideContent = document.getElementById("viewGuideContent");

// Edit Modal Elements
const editGuideModalElement = document.getElementById("editGuideModal");
const editGuideModal = new bootstrap.Modal(editGuideModalElement);
const editGuideTitleInput = document.getElementById("editGuideTitleInput");
const editGuideCategoryInput = document.getElementById("editGuideCategoryInput");
const editGuideContentInput = document.getElementById("editGuideContentInput");
const editGuideError = document.getElementById("editGuideError");
const saveEditGuideBtn = document.getElementById("saveEditGuideBtn");

// Delete Modal Elements
const deleteGuideModalElement = document.getElementById("deleteGuideModal");
const deleteGuideModal = new bootstrap.Modal(deleteGuideModalElement);
const deleteGuideMessage = document.getElementById("deleteGuideMessage");
const confirmDeleteGuideBtn = document.getElementById("confirmDeleteGuideBtn");

let editingGuideId = null;
let deletingGuideId = null;

let guides = [];

function getGuideSummary(content) {
  const plainText = (content || "")
    .replace(/[#*_>`~-]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) return "No summary available.";

  return plainText.length > 220
    ? `${plainText.slice(0, 220)}...`
    : plainText;
}

function renderGuides() {
  guideList.innerHTML = "";

  const RECENT_GUIDE_MS = 48 * 60 * 60 * 1000;
  const now = Date.now();

  const searchTerm = guideSearchInput.value.trim().toLowerCase();
  const selectedCategory = guideCategoryFilter.value;

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = [
      guide.title,
      guide.category,
      guide.content
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm);

    const matchesCategory =
      !selectedCategory || guide.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  guideCount.textContent =
    `${filteredGuides.length} ${filteredGuides.length === 1 ? "guide" : "guides"}`;

  if (!filteredGuides.length) {
    guideList.innerHTML =
      `<div class="empty-state">No guides found.</div>`;
    return;
  }

  filteredGuides.forEach(guide => {
    const item = document.createElement("div");
    item.className = "resource-item";

    item.innerHTML = `
      <div class="resource-main">
        <div class="resource-title-row">
          <button
            type="button"
            class="guide-title-button"
            onclick="openGuideModal('${guide.id}')"
          >
            ${guide.title}
          </button>

          ${
            guide.pinned
              ? `<span class="resource-pin-badge">📌 Pinned</span>`
              : ""
          }

          ${
            guide.createdAtMs &&
            now - guide.createdAtMs <= RECENT_GUIDE_MS
              ? `<span class="resource-new-badge">New</span>`
              : ""
          }
        </div>

        <div class="resource-meta">
          ${guide.category || "Uncategorized"} • Created ${guide.createdAt || "-"} • Opened ${guide.openCount || 0} times
        </div>

        ${
          guide.updatedAt
            ? `<div class="resource-meta">Last edited ${guide.updatedAt}</div>`
            : ""
        }

        <div class="resource-description">
          ${getGuideSummary(guide.content)}
        </div>
      </div>

      <div class="resource-actions">
        <button
          class="btn btn-primary-custom resource-open-btn"
          onclick="openGuideModal('${guide.id}')"
        >
          Open
        </button>

        <button
          class="resource-edit-btn"
          onclick="openEditGuideModal('${guide.id}')"
        >
          Edit
        </button>

        <button
          class="resource-edit-btn"
          onclick="toggleGuidePin('${guide.id}')"
        >
          ${guide.pinned ? "Unpin" : "Pin"}
        </button>

        <button
          class="resource-delete-btn"
          onclick="openDeleteGuideModal('${guide.id}')"
        >
          Delete
        </button>
      </div>
    `;

    guideList.appendChild(item);
  });
}

function updateGuideCategoryFilter() {
  const currentValue = guideCategoryFilter.value;

  const categories = [
    ...new Set(
      guides
        .map(g => g.category)
        .filter(Boolean)
        .sort()
    )
  ];

  guideCategoryFilter.innerHTML =
    `<option value="">All Categories</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    guideCategoryFilter.appendChild(option);
  });

  guideCategoryFilter.value = currentValue;
}

function addGuide() {
  const title = guideTitleInput.value.trim();
  const category = guideCategoryInput.value.trim();
  const content = guideContentInput.value.trim();

  guideError.textContent = "";

  if (!title || !content) {
    guideError.textContent = "Title and guide content are required.";
    return;
  }

  const newGuideRef = push(guidesRef);

  const guide = {
    id: newGuideRef.key,
    title,
    category,
    content,
    createdAt: new Date().toLocaleString(),
    createdAtMs: Date.now()
  };

  set(newGuideRef, guide);

  guideTitleInput.value = "";
  guideCategoryInput.value = "";
  guideContentInput.value = "";
}

addGuideBtn.addEventListener("click", addGuide);
guideSearchInput.addEventListener("input", renderGuides);
guideCategoryFilter.addEventListener("change", renderGuides);


window.openGuideModal = function(id) {
  const guide = guides.find(g => g.id === id);
  if (!guide) return;

  update(ref(db, `guides/${id}`), {
    openCount: (guide.openCount || 0) + 1,
    lastOpenedAt: new Date().toLocaleString(),
    lastOpenedAtMs: Date.now()
  });

  viewGuideTitle.textContent = guide.title || "Guide";

  viewGuideMeta.textContent =
    `${guide.category || "Uncategorized"} • Opened ${(guide.openCount || 0) + 1} times`;

  viewGuideContent.innerHTML =
    marked.parse(guide.content || "");

  viewGuideModal.show();
};

window.openEditGuideModal = function(id) {
  const guide = guides.find(g => g.id === id);
  if (!guide) return;

  editingGuideId = id;
  editGuideError.textContent = "";

  editGuideTitleInput.value = guide.title || "";
  editGuideCategoryInput.value = guide.category || "";
  editGuideContentInput.value = guide.content || "";

  editGuideModal.show();
};

saveEditGuideBtn.addEventListener("click", () => {
  const guide = guides.find(g => g.id === editingGuideId);
  if (!guide) return;

  const title = editGuideTitleInput.value.trim();
  const category = editGuideCategoryInput.value.trim();
  const content = editGuideContentInput.value.trim();

  editGuideError.textContent = "";

  if (!title || !content) {
    editGuideError.textContent = "Title and guide content are required.";
    return;
  }

  update(ref(db, `guides/${editingGuideId}`), {
    title,
    category,
    content,
    updatedAt: new Date().toLocaleString(),
    updatedAtMs: Date.now()
  });

  editGuideModal.hide();
  editingGuideId = null;
});

window.toggleGuidePin = function(id) {
  const guide = guides.find(g => g.id === id);
  if (!guide) return;

  update(ref(db, `guides/${id}`), {
    pinned: !guide.pinned
  });
};

window.openDeleteGuideModal = function(id) {
  const guide = guides.find(g => g.id === id);
  if (!guide) return;

  deletingGuideId = id;

  deleteGuideMessage.textContent =
    `Delete guide "${guide.title}"?`;

  deleteGuideModal.show();
};

confirmDeleteGuideBtn.addEventListener("click", () => {
  if (!deletingGuideId) return;

  remove(ref(db, `guides/${deletingGuideId}`));

  deleteGuideModal.hide();
  deletingGuideId = null;
});

onValue(guidesRef, snapshot => {
  const data = snapshot.val() || {};

  guides = Object.values(data).sort((a, b) => {
  if ((a.pinned || false) !== (b.pinned || false)) {
    return (b.pinned || false) - (a.pinned || false);
  }

  return (b.createdAtMs || 0) - (a.createdAtMs || 0);
});

  updateGuideCategoryFilter();
  renderGuides();
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

document.addEventListener("click", event => {

  const image =
    event.target.closest("#viewGuideContent img");

  if (!image) return;

  guideImageViewer.src = image.src;

  guideImageModal.show();

});

loadVersion();
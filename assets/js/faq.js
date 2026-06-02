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

const faqsRef = ref(db, "faqs");

const faqQuestionInput = document.getElementById("faqQuestionInput");
const faqCategoryInput = document.getElementById("faqCategoryInput");
const faqAnswerInput = document.getElementById("faqAnswerInput");
const addFaqBtn = document.getElementById("addFaqBtn");
const faqError = document.getElementById("faqError");

const faqList = document.getElementById("faqList");
const faqCount = document.getElementById("faqCount");
const faqSearchInput = document.getElementById("faqSearchInput");
const faqCategoryFilter = document.getElementById("faqCategoryFilter");

const editFaqModalElement = document.getElementById("editFaqModal");
const editFaqModal = new bootstrap.Modal(editFaqModalElement);
const editFaqQuestionInput = document.getElementById("editFaqQuestionInput");
const editFaqCategoryInput = document.getElementById("editFaqCategoryInput");
const editFaqAnswerInput = document.getElementById("editFaqAnswerInput");
const editFaqError = document.getElementById("editFaqError");
const saveEditFaqBtn = document.getElementById("saveEditFaqBtn");

const deleteFaqModalElement = document.getElementById("deleteFaqModal");
const deleteFaqModal = new bootstrap.Modal(deleteFaqModalElement);
const deleteFaqMessage = document.getElementById("deleteFaqMessage");
const confirmDeleteFaqBtn = document.getElementById("confirmDeleteFaqBtn");

const viewFaqModalElement = document.getElementById("viewFaqModal");
const viewFaqModal = new bootstrap.Modal(viewFaqModalElement);
const viewFaqTitle = document.getElementById("viewFaqTitle");
const viewFaqMeta = document.getElementById("viewFaqMeta");
const viewFaqAnswer = document.getElementById("viewFaqAnswer");

let faqs = [];
let editingFaqId = null;
let deletingFaqId = null;

window.openFaqModal = function(id) {
  const faq = faqs.find(item => item.id === id);
  if (!faq) return;

  viewFaqTitle.textContent = faq.question || "FAQ";

  viewFaqMeta.textContent =
    `${faq.category || "Uncategorized"} • Created ${faq.createdAt || "-"}`;

  viewFaqAnswer.textContent = faq.answer || "";

  viewFaqModal.show();
};

function isRecentlyAdded(faq) {
  const RECENT_MS = 48 * 60 * 60 * 1000;

  return faq.createdAtMs &&
    Date.now() - faq.createdAtMs <= RECENT_MS;
}

function getFaqSummary(answer) {
  const text = (answer || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "No answer added.";

  return text.length > 220
    ? `${text.slice(0, 220)}...`
    : text;
}

function renderFaqs() {
  faqList.innerHTML = "";

  const searchTerm = faqSearchInput.value.trim().toLowerCase();
  const selectedCategory = faqCategoryFilter.value;

  const filteredFaqs = faqs.filter(faq => {
    const searchableText = [
      faq.question,
      faq.category,
      faq.answer
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm);

    const matchesCategory =
      !selectedCategory ||
      faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  faqCount.textContent =
    `${filteredFaqs.length} ${filteredFaqs.length === 1 ? "FAQ" : "FAQs"}`;

  if (!filteredFaqs.length) {
    faqList.innerHTML =
      `<div class="empty-state">No FAQs found.</div>`;
    return;
  }

  filteredFaqs.forEach(faq => {
    const item = document.createElement("div");
    item.className = "resource-item";

    item.innerHTML = `
      <div class="resource-main">
        <div class="resource-title-row">
          <button
  type="button"
  class="guide-title-button"
  onclick="openFaqModal('${faq.id}')"
>
  ${faq.question}
</button>

          ${
            faq.pinned
              ? `<span class="resource-pin-badge">📌 Pinned</span>`
              : ""
          }

          ${
            isRecentlyAdded(faq)
              ? `<span class="resource-new-badge">New</span>`
              : ""
          }
        </div>

        <div class="resource-meta">
          ${faq.category || "Uncategorized"} • Created ${faq.createdAt || "-"}
        </div>

        ${
          faq.updatedAt
            ? `<div class="resource-meta">Last edited ${faq.updatedAt}</div>`
            : ""
        }

        <div class="resource-description">
          ${getFaqSummary(faq.answer)}
        </div>
      </div>

      <div class="resource-actions">
        <button
          class="resource-edit-btn"
          onclick="toggleFaqPin('${faq.id}')"
        >
          ${faq.pinned ? "Unpin" : "Pin"}
        </button>

        <button
          class="resource-edit-btn"
          onclick="openEditFaqModal('${faq.id}')"
        >
          Edit
        </button>

        <button
          class="resource-delete-btn"
          onclick="openDeleteFaqModal('${faq.id}')"
        >
          Delete
        </button>
      </div>
    `;

    faqList.appendChild(item);
  });
}

function updateFaqCategoryFilter() {
  const currentValue = faqCategoryFilter.value;

  const categories = [
    ...new Set(
      faqs
        .map(faq => faq.category)
        .filter(Boolean)
        .sort()
    )
  ];

  faqCategoryFilter.innerHTML =
    `<option value="">All Categories</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    faqCategoryFilter.appendChild(option);
  });

  faqCategoryFilter.value = currentValue;
}

function addFaq() {
  const question = faqQuestionInput.value.trim();
  const category = faqCategoryInput.value.trim();
  const answer = faqAnswerInput.value.trim();

  faqError.textContent = "";

  if (!question || !answer) {
    faqError.textContent = "Question and answer are required.";
    return;
  }

  const newFaqRef = push(faqsRef);

  const faq = {
    id: newFaqRef.key,
    question,
    category,
    answer,
    pinned: false,
    createdAt: new Date().toLocaleString(),
    createdAtMs: Date.now()
  };

  set(newFaqRef, faq);

  faqQuestionInput.value = "";
  faqCategoryInput.value = "";
  faqAnswerInput.value = "";
}

window.toggleFaqPin = function(id) {
  const faq = faqs.find(item => item.id === id);
  if (!faq) return;

  update(ref(db, `faqs/${id}`), {
    pinned: !faq.pinned
  });
};

window.openEditFaqModal = function(id) {
  const faq = faqs.find(item => item.id === id);
  if (!faq) return;

  editingFaqId = id;
  editFaqError.textContent = "";

  editFaqQuestionInput.value = faq.question || "";
  editFaqCategoryInput.value = faq.category || "";
  editFaqAnswerInput.value = faq.answer || "";

  editFaqModal.show();
};

saveEditFaqBtn.addEventListener("click", () => {
  const faq = faqs.find(item => item.id === editingFaqId);
  if (!faq) return;

  const question = editFaqQuestionInput.value.trim();
  const category = editFaqCategoryInput.value.trim();
  const answer = editFaqAnswerInput.value.trim();

  editFaqError.textContent = "";

  if (!question || !answer) {
    editFaqError.textContent = "Question and answer are required.";
    return;
  }

  update(ref(db, `faqs/${editingFaqId}`), {
    question,
    category,
    answer,
    updatedAt: new Date().toLocaleString(),
    updatedAtMs: Date.now()
  });

  editFaqModal.hide();
  editingFaqId = null;
});

window.openDeleteFaqModal = function(id) {
  const faq = faqs.find(item => item.id === id);
  if (!faq) return;

  deletingFaqId = id;

  deleteFaqMessage.textContent =
    `Delete FAQ "${faq.question}"?`;

  deleteFaqModal.show();
};

confirmDeleteFaqBtn.addEventListener("click", () => {
  if (!deletingFaqId) return;

  remove(ref(db, `faqs/${deletingFaqId}`));

  deleteFaqModal.hide();
  deletingFaqId = null;
});

addFaqBtn.addEventListener("click", addFaq);
faqSearchInput.addEventListener("input", renderFaqs);
faqCategoryFilter.addEventListener("change", renderFaqs);

onValue(faqsRef, snapshot => {
  const data = snapshot.val() || {};

  faqs = Object.values(data).sort((a, b) => {
    if ((a.pinned || false) !== (b.pinned || false)) {
      return (b.pinned || false) - (a.pinned || false);
    }

    return (b.createdAtMs || 0) - (a.createdAtMs || 0);
  });

  updateFaqCategoryFilter();
  renderFaqs();
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
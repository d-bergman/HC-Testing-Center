import {
  ref,
  push,
  set
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const actions = {
  instructor: {
    title: "Add Instructor",
    path: "instructors",
    fields: ["firstName", "lastName", "department", "code", "extension", "alternatePhone"],
    required: ["firstName", "lastName", "department"],
    defaults: { pinned: false }
  },
  resource: {
    title: "Add Resource",
    path: "resources",
    fields: ["title", "url", "category", "description"],
    required: ["title", "url"]
  },
  guide: {
    title: "Add Guide",
    path: "guides",
    fields: ["title", "category", "content"],
    required: ["title", "content"]
  },
  faq: {
    title: "Add FAQ",
    path: "faqs",
    fields: ["question", "category", "answer"],
    required: ["question", "answer"],
    defaults: { pinned: false }
  }
};

export function setupDashboardActions(db) {
  const modalElement = document.getElementById("quickActionModal");
  const modal = new bootstrap.Modal(modalElement);
  const title = document.getElementById("quickActionTitle");
  const forms = [...modalElement.querySelectorAll("[data-action-form]")];
  let activeForm = null;

  document.querySelectorAll("[data-quick-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.quickAction;
      activeForm = forms.find(form => form.dataset.actionForm === action);
      if (!activeForm) return;

      forms.forEach(form => form.classList.toggle("d-none", form !== activeForm));
      title.textContent = actions[action].title;
      modal.show();
    });
  });

  modalElement.addEventListener("shown.bs.modal", () => {
    activeForm?.querySelector("input, textarea")?.focus();
  });

  modalElement.addEventListener("hidden.bs.modal", () => {
    forms.forEach(form => {
      form.reset();
      form.querySelector("[data-action-error]").textContent = "";
    });
    activeForm = null;
  });

  forms.forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const action = actions[form.dataset.actionForm];
      const data = Object.fromEntries(
        action.fields.map(field => [field, String(new FormData(form).get(field) || "").trim()])
      );
      const error = form.querySelector("[data-action-error]");
      error.textContent = "";

      if (action.required.some(field => !data[field])) {
        error.textContent = "Please complete all required fields.";
        return;
      }

      const saveButton = form.querySelector('button[type="submit"]');
      saveButton.disabled = true;

      try {
        const recordRef = push(ref(db, action.path));
        await set(recordRef, {
          id: recordRef.key,
          ...data,
          ...action.defaults,
          createdAt: new Date().toLocaleString(),
          createdAtMs: Date.now()
        });
        modal.hide();
      } catch (saveError) {
        console.error(`Unable to add ${form.dataset.actionForm}.`, saveError);
        error.textContent = "Could not save. Please try again.";
      } finally {
        saveButton.disabled = false;
      }
    });
  });
}

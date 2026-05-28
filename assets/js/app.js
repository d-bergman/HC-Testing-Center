import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue,
  onDisconnect,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

fetch("./assets/data/changelog.txt")
  .then(res => res.text())
  .then(text => {
    document.getElementById("changeLogContent").textContent = text;
  })
  .catch(() => {
    document.getElementById("changeLogContent").textContent =
      "Unable to load changelog.";
  });

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

const timersRef = ref(db, "timers");
const historyRef = ref(db, "history");
const presenceRef = ref(db, "presence");
const seatStatusesRef = ref(db, "seatStatuses");

const timerList = document.getElementById("timerList");
const historyList = document.getElementById("historyList");
const seatGrid = document.getElementById("seatGrid");

const startTimerBtn = document.getElementById("startTimerBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const testOptionalField = document.getElementById("testOptionalField");

const currentTime = document.getElementById("currentTime");
const currentDate = document.getElementById("currentDate");
const timerSound = document.getElementById("timerSound");
const enableSoundBtn = document.getElementById("enableSoundBtn");
let soundEnabled = false;
const mapButtons = document.querySelectorAll(".map-btn");

const seatConflictModalElement =
  document.getElementById("seatConflictModal");

const seatConflictModal =
  new bootstrap.Modal(seatConflictModalElement);

const seatConflictMessage =
  document.getElementById("seatConflictMessage");

const confirmSeatConflictBtn =
  document.getElementById("confirmSeatConflictBtn");

const TEMP_PASSWORD = "148TEST6541";

const passwordScreen = document.getElementById("passwordScreen");
const passwordInput = document.getElementById("passwordInput");
const passwordBtn = document.getElementById("passwordBtn");
const passwordError = document.getElementById("passwordError");

const historySearch = document.getElementById("historySearch");
const loadMoreHistoryBtn = document.getElementById("loadMoreHistoryBtn");

let historyVisibleCount = 10;

const timerModeBtn = document.getElementById("timerModeBtn");
const seatStatusModeBtn = document.getElementById("seatStatusModeBtn");
const formTitle = document.getElementById("formTitle");
const timerFields = document.getElementById("timerFields");
const seatStatusFields = document.getElementById("seatStatusFields");
const addSeatStatusBtn = document.getElementById("addSeatStatusBtn");

const timerTimeFields = document.getElementById("timerTimeFields");

//Delete Timer Constants

const deleteTimerModalElement = document.getElementById("deleteTimerModal");
const deleteTimerModal = new bootstrap.Modal(deleteTimerModalElement);
const deleteTimerMessage = document.getElementById("deleteTimerMessage");
const confirmDeleteTimerBtn = document.getElementById("confirmDeleteTimerBtn");

//Delete Timer Constants
const editTimerModalElement = document.getElementById("editTimerModal");
const editTimerModal = new bootstrap.Modal(editTimerModalElement);

const editLabInput = document.getElementById("editLabInput");
const editSeatInput = document.getElementById("editSeatInput");
const editStudentInput = document.getElementById("editStudentInput");
const editTestInput = document.getElementById("editTestInput");
const editHoursInput = document.getElementById("editHoursInput");
const editMinutesInput = document.getElementById("editMinutesInput");
const editTimerError = document.getElementById("editTimerError");
const saveEditTimerBtn = document.getElementById("saveEditTimerBtn");

let editingTimerId = null;

// Admin Unlock Constants
const ADMIN_PASSWORD = "bd13311";

const adminUnlockModalElement = document.getElementById("adminUnlockModal");
const adminUnlockModal = new bootstrap.Modal(adminUnlockModalElement);
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminPasswordError = document.getElementById("adminPasswordError");
const adminUnlockBtn = document.getElementById("adminUnlockBtn");

// Delete History Constants
const deleteHistoryModalElement = document.getElementById("deleteHistoryModal");
const deleteHistoryModal = new bootstrap.Modal(deleteHistoryModalElement);
const deleteHistoryMessage = document.getElementById("deleteHistoryMessage");
const confirmDeleteHistoryBtn = document.getElementById("confirmDeleteHistoryBtn");

// Info Modal Constants
const infoModalElement = document.getElementById("infoModal");
const infoModal = new bootstrap.Modal(infoModalElement);
const infoModalMessage = document.getElementById("infoModalMessage");

// Clear All Timers Constants
const clearAllTimersModalElement =
  document.getElementById("clearAllTimersModal");

const clearAllTimersModal =
  new bootstrap.Modal(clearAllTimersModalElement);

const confirmClearAllTimersBtn =
  document.getElementById("confirmClearAllTimersBtn");


// Quick Seat Add Modal Constants
const seatQuickAddModalElement =
  document.getElementById("seatQuickAddModal");

const seatQuickAddModal =
  new bootstrap.Modal(seatQuickAddModalElement);

const quickSeatLabInput =
  document.getElementById("quickSeatLabInput");

const quickSeatSeatInput =
  document.getElementById("quickSeatSeatInput");

const quickSeatStudentInput =
  document.getElementById("quickSeatStudentInput");

const quickSeatTestInput =
  document.getElementById("quickSeatTestInput");

const quickSeatHoursInput =
  document.getElementById("quickSeatHoursInput");

const quickSeatMinutesInput =
  document.getElementById("quickSeatMinutesInput");

const quickSeatError =
  document.getElementById("quickSeatError");

const saveQuickSeatTimerBtn =
  document.getElementById("saveQuickSeatTimerBtn");

const quickSeatTimerModeBtn =
  document.getElementById("quickSeatTimerModeBtn");

const quickSeatStatusModeBtn =
  document.getElementById("quickSeatStatusModeBtn");

const quickSeatTimerFields =
  document.getElementById("quickSeatTimerFields");

const quickSeatStatusFields =
  document.getElementById("quickSeatStatusFields");

const quickSeatStatusInput =
  document.getElementById("quickSeatStatusInput");

const quickSeatTestTypeInput =
  document.getElementById("quickSeatTestTypeInput");

// Flag Modal Constants
const flagModalElement = document.getElementById("flagModal");
const flagModal = new bootstrap.Modal(flagModalElement);
const flagModalMessage = document.getElementById("flagModalMessage");
const flagSelectInput = document.getElementById("flagSelectInput");
const saveFlagBtn = document.getElementById("saveFlagBtn");

let pendingFlagTarget = null;

// Global state variables
const seatStatusList = document.getElementById("seatStatusList");

// Startup Sound Modal Constants
const startupSoundModalElement =
  document.getElementById("startupSoundModal");

const startupSoundModal =
  new bootstrap.Modal(startupSoundModalElement);

const dismissStartupSoundBtn =
  document.getElementById("dismissStartupSoundBtn");

let pendingAdminAction = null;

let activeLab = "C";
let timers = [];
let history = [];
let playedSounds = new Set();
let alarmInterval = null;
let activeAlarmTimerId = null;
let seatStatuses = [];

const seatCameraMap = {
  C1: "orange", C2: "orange", C3: "orange", C4: "orange",
  C5: "orange", C6: "orange", C7: "green", C8: "green",
  C9: "green", C10: "green", C11: "green", C12: "green",
  C13: "green", C14: "green", C15: "green", C16: "green",
  C17: "green", C18: "green", C19: "red", C20: "red",
  C21: "red", C22: "red", C23: "orange", C24: "green",
  C25: "green", C26: "green", C27: "green", C28: "green",
  C29: "orange", C30: "green", C31: "green", C32: "green",
  C33: "orange", C34: "orange", C35: "orange", C36: "orange",
  C37: "orange", C38: "orange", C39: "orange", C40: "orange",
  C41: "orange", C42: "orange", C43: "orange", C44: "orange",
  C45: "orange", C46: "orange", C47: "orange", C48: "orange",

  B1: "red", B2: "red", B3: "red", B4: "red",
  B5: "red", B6: "red", B7: "red", B8: "red",
  B9: "orange", B10: "orange", B11: "red", B12: "orange",
  B13: "green", B14: "green", B15: "green", B16: "green",
  B17: "green", B18: "green", B19: "green", B20: "red",
  B21: "red", B22: "green", B23: "orange", B24: "red",
  B25: "orange", B26: "orange", B27: "orange", B28: "green",
  B29: "green", B30: "green", B31: "green",
};

function updateClock() {
  const now = new Date();
  currentTime.textContent = now.toLocaleTimeString();
  currentDate.textContent = now.toLocaleDateString();
}

setInterval(updateClock, 1000);
updateClock();

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "00:00:00";
  }
  seconds = Math.max(0, Math.floor(seconds));

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hrs.toString().padStart(2, "0"),
    mins.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0")
  ].join(":");
}

function getRemainingSeconds(timer) {
  if (timer.paused) {
    return timer.pausedRemaining || 0;
  }

  return Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
}

function getTimerStatus(seconds) {
  if (seconds <= 300) return "red";
  if (seconds <= 900) return "orange";
  return "green";
}

function createNewTimerObject({
  lab,
  seat,
  student,
  test,
  minutes
}) {
  const newTimerRef = push(timersRef);

  const timer = {
    id: newTimerRef.key,
    lab,
    seat,
    student,
    test,
    durationSeconds: minutes * 60,
    endAt: null,
    paused: true,
    pausedRemaining: minutes * 60,
    alarmDismissed: false,
    flag: "none",
    createdAt: new Date().toLocaleString(),
    createdAtMs: Date.now()
  };

  set(newTimerRef, timer);
}

function normalizeSeat(lab, seatInput) {
  const cleaned = seatInput.trim().toUpperCase().replace(/\s+/g, "");

  if (!cleaned) return "";

  if (cleaned.startsWith("C") || cleaned.startsWith("B")) {
    return cleaned;
  }

  return `${lab}${cleaned}`;
}

function getClosingTimeToday() {
  const now = new Date();
  const day = now.getDay();

  const closing = new Date();

  // Friday
  if (day === 5) {
    closing.setHours(16, 30, 0, 0);
  } else {
    // Monday-Thursday + weekends fallback
    closing.setHours(19, 0, 0, 0);
  }

  return closing;
}

function createTimer() {
  const lab = document.getElementById("labInput").value;
  const rawSeat = document.getElementById("seatInput").value;
  const seat = normalizeSeat(lab, rawSeat);
  const student = document.getElementById("studentInput").value.trim();
  const test = document.getElementById("testInput").value.trim();
  const hours = parseInt(document.getElementById("hoursInput").value) || 0;
const minutes = parseInt(document.getElementById("minutesInput").value) || 0;
const totalMinutes = hours * 60 + minutes;

// Closing Time Enforcement
const closingTime = getClosingTimeToday();

const secondsUntilClose = Math.floor(
  (closingTime.getTime() - Date.now()) / 1000
);

const requestedSeconds = totalMinutes * 60;

const finalSeconds = Math.min(
  requestedSeconds,
  Math.max(0, secondsUntilClose)
);

const finalMinutes = Math.ceil(finalSeconds / 60);

  if (!seat || !student || totalMinutes <= 0) {
    alert("Please complete all required fields.");
    return;
  }

  const existingSeat = timers.find(
  t => t.seat.toUpperCase() === seat.toUpperCase()
);
const existingSeatStatus = seatStatuses.find(
  s => s.seat.toUpperCase() === seat.toUpperCase()
);


if (existingSeat) {

  seatConflictMessage.textContent =
    `${seat} already has an active timer for ${existingSeat.student}.`;

  seatConflictModal.show();

  confirmSeatConflictBtn.onclick = () => {

    deleteTimer(existingSeat.id);

    createNewTimerObject({
  lab,
  seat,
  student,
  test,
  minutes: finalMinutes
});

    seatConflictModal.hide();
  };

  return;
}

if (existingSeatStatus) {
  seatConflictMessage.textContent =
    `${seat} is currently ${existingSeatStatus.status} for ${existingSeatStatus.testType}.\n\nReplace seat status with timer?`;

  seatConflictModal.show();

  confirmSeatConflictBtn.onclick = () => {
    clearSeatStatus(existingSeatStatus.id);

    createNewTimerObject({
      lab,
      seat,
      student,
      test,
      minutes: finalMinutes
    });

    seatConflictModal.hide();

    document.getElementById("seatInput").value = "";
    document.getElementById("studentInput").value = "";
    document.getElementById("testInput").value = "";
    document.getElementById("hoursInput").value = "";
    document.getElementById("minutesInput").value = "";
  };

  return;
}
  createNewTimerObject({
  lab,
  seat,
  student,
  test,
  minutes: finalMinutes
});

  document.getElementById("seatInput").value = "";
  document.getElementById("studentInput").value = "";
  document.getElementById("testInput").value = "";
  document.getElementById("hoursInput").value = "";
  document.getElementById("minutesInput").value = "";
}

function createSeatStatusObject({
  lab,
  seat,
  student,
  testType,
  status
}) {
  const newSeatStatusRef = push(seatStatusesRef);

  const seatStatus = {
    id: newSeatStatusRef.key,
    lab,
    seat,
    student,
    testType,
    status,
    flag: "none",
    createdAt: new Date().toLocaleString(),
    createdAtMs: Date.now()
  };

  set(newSeatStatusRef, seatStatus);
}

function createSeatStatus() {
  const lab = document.getElementById("labInput").value;
  const rawSeat = document.getElementById("seatInput").value;
  const seat = normalizeSeat(lab, rawSeat);
  const student = document.getElementById("studentInput").value.trim();
  const testType = document.getElementById("testTypeInput").value;
  const status = document.getElementById("seatStatusInput").value;

  if (!seat || !testType || !status) {
    alert("Please complete the seat status fields.");
    return;
  }
  const existingSeatStatus = seatStatuses.find(
  s => s.seat.toUpperCase() === seat.toUpperCase()
);
const existingTimer = timers.find(
  t => t.seat.toUpperCase() === seat.toUpperCase()
);

if (existingTimer) {
  seatConflictMessage.textContent =
    `${seat} already has an active timer for ${existingTimer.student}.\n\nReplace timer with seat status?`;

  seatConflictModal.show();

  confirmSeatConflictBtn.onclick = () => {
    deleteTimer(existingTimer.id);

    createSeatStatusObject({
      lab,
      seat,
      student,
      testType,
      status
    });

    seatConflictModal.hide();
  };

  return;
}

if (existingSeatStatus) {
  seatConflictMessage.textContent =
    `${seat} already has a ${existingSeatStatus.status} status for ${existingSeatStatus.testType}.`;

  seatConflictModal.show();

  confirmSeatConflictBtn.onclick = () => {
    clearSeatStatus(existingSeatStatus.id);

    createSeatStatusObject({
      lab,
      seat,
      student,
      testType,
      status
    });

    seatConflictModal.hide();
  };

  return;
}

  createSeatStatusObject({
  lab,
  seat,
  student,
  testType,
  status
});

  document.getElementById("seatInput").value = "";
  document.getElementById("studentInput").value = "";
  document.getElementById("testInput").value = "";
  document.getElementById("hoursInput").value = "";
  document.getElementById("minutesInput").value = "";
}

startTimerBtn.addEventListener("click", createTimer);

function getProjectedEndTime(timer) {
  let endTime;

  if (timer.paused) {
    endTime = new Date(
      Date.now() + (timer.pausedRemaining || 0) * 1000
    );
  } else {
    endTime = new Date(timer.endAt);
  }

  return endTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function renderTimers() {
  timerList.innerHTML = "";

  const activeSeatStatuses = seatStatuses.filter(
  s => s.status !== "Reserved"
);

const totalActive =
  timers.length + activeSeatStatuses.length;

const typeCounts = {};

// Timers = Make-Up
if (timers.length > 0) {
  typeCounts["Make-Up"] = timers.length;
}

// Seat statuses
activeSeatStatuses.forEach(s => {
  const type = s.testType || "Other";

  typeCounts[type] = (typeCounts[type] || 0) + 1;
});

const typeSummary = Object.entries(typeCounts)
  .map(([type, count]) => `${count} ${type}`)
  .join(" • ");

document.getElementById("timerCount").textContent =
  typeSummary
    ? `${totalActive} active - ${typeSummary}`
    : `${totalActive} active`;

  if (!timers.length) {
    timerList.innerHTML = `<div class="empty-state">No active timers.</div>`;
    return;
  }

  timers.forEach(timer => {
    const remaining = getRemainingSeconds(timer);
    const status = getTimerStatus(remaining);

    const item = document.createElement("div");
    item.className = "timer-item";

    item.innerHTML = `
      <div>
        <div class="seat-badge ${timer.lab === "B" ? "lab-b" : ""}">
          ${timer.seat}
        </div>
      </div>

      <div>
  <strong>${timer.student}</strong>

  <div class="timer-link-row">
    <button
      type="button"
      class="timer-edit-link-btn"
      onclick="openEditTimer('${timer.id}')"
    >
      Edit
    </button>

    <span class="timer-link-divider">•</span>

    <button
      type="button"
      class="timer-edit-link-btn"
      onclick="openFlagModal('timer', '${timer.id}')"
    >
      Flag
    </button>
  </div>
</div>

      <div>
        ${timer.test || "-"}
      </div>

      <div>
  <div class="remaining ${status} ${timer.paused ? "paused-timer" : ""}">
    ${formatTime(remaining)}
  </div>
  <div class="projected-end">
    Ends ${getProjectedEndTime(timer)}
  </div>
</div>

      <div class="status-label">
        ${
          timer.paused
            ? "Paused"
            : remaining <= 0
            ? "Time Up"
            : "Running"
        }
      </div>

      <div class="action-buttons">

        <!--<button onclick="openEditTimer('${timer.id}')">
          ✏️
        </button>-->

        <button class="pause-btn" onclick="togglePause('${timer.id}')">
          ${timer.paused ? "▶" : "⏸"}
        </button>

        <button class="plus-btn" onclick="addFive('${timer.id}')">
          +5
        </button>

        <button class="delete-btn" onclick="deleteTimer('${timer.id}')">
          🗑
        </button>
      </div>
    `;

    timerList.appendChild(item);
  });
}

// New function to render seat statuses
function renderSeatStatuses() {
  seatStatusList.innerHTML = "";

  if (!seatStatuses.length) {
    seatStatusList.innerHTML =
      `<div class="empty-state">No active seat statuses.</div>`;
    return;
  }

  seatStatuses.forEach(status => {
    const item = document.createElement("div");
    item.className = "timer-item";

    item.innerHTML = `
      <div>
        <div class="seat-badge ${status.lab === "B" ? "lab-b" : ""}">
          ${status.seat}
        </div>
      </div>

      <div>
        <strong>
          ${status.student || status.testType}
        </strong>

        <div class="timer-link-row">
          <button
            type="button"
            class="timer-edit-link-btn"
            onclick="openFlagModal('seatStatus', '${status.id}')"
          >
            Flag
          </button>

          <span class="timer-link-divider">•</span>

          <button
            type="button"
            class="timer-edit-link-btn"
            onclick="clearSeatStatus('${status.id}')"
          >
            Clear
          </button>
        </div>
      </div>

      <div>
        ${status.testType || "-"}
      </div>

      <div>
        ${status.status}
      </div>

      <div class="status-label">
        Active
      </div>

      <div class="action-buttons ms-auto">
        <button
          class="delete-btn"
          onclick="clearSeatStatus('${status.id}')"
        >
          🗑
        </button>
      </div>
    `;

    seatStatusList.appendChild(item);
  });
}

// Determine seat class based on timer status and flags
function getTimerSeatClass(timer, remaining) {
  const flag = timer.flag || "none";

  if (flag === "ADS") return "active-ads";
  if (flag === "Misconduct") return "active-misconduct";

  const status = getTimerStatus(remaining);

  if (status === "green") return "active-green";
  if (status === "orange") return "active-orange";
  if (status === "red") return "active-red";

  return "";
}

// Determine seat class based on seat status and flags
function renderSeats() {
  seatGrid.innerHTML = "";
  seatGrid.className = `seat-grid lab-${activeLab.toLowerCase()}`;

  let seats = [];

  if (activeLab === "C") {
    seats = [
      "", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8",
      "", "C16", "C15", "C14", "C13", "C12", "C11", "C10", "C9",
      "", "C17", "C18", "C19", "C20", "C21", "C22", "C23", "C24",
      "", "C32", "C31", "C30", "C29", "C28", "C27", "C26", "C25",
      "", "", "C33", "C34", "C35", "C36", "C37", "C38", "C39",
      "C48", "C47", "C46", "C45", "C44", "C43", "C42", "C41", "C40"
    ];
  } else {
  seats = [
    "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10",
    "", "", "", "B17", "B16", "B15", "B14", "B13", "B12", "B11",
    "", "", "", "B18", "B19", "B20", "B21", "B22", "B23", "B24",
    "", "", "", "B31", "B30", "B29", "B28", "B27", "B26", "B25"
  ];
}

  seats.forEach(seatId => {
    const timer = timers.find(t => t.seat === seatId);
    const seatStatus = seatStatuses.find(s => s.seat === seatId);
    const seat = document.createElement("div");

    if (seatId === "") {
      seat.id = "noseat";
      seat.className = "isle";
      seatGrid.appendChild(seat);
      return;
    }

    let statusClass = "";

    if (timer) {
      const remaining = getRemainingSeconds(timer);
      statusClass = getTimerSeatClass(timer, remaining);

    } else if (seatStatus) {

      if (seatStatus.flag === "ADS") {
        statusClass = "active-ads";
      } else if (seatStatus.flag === "Misconduct") {
        statusClass = "active-misconduct";
      } else {
        statusClass =
          seatStatus.status === "Reserved"
            ? "seat-reserved"
            : "seat-occupied";
      }
    }

    seat.className = `seat ${statusClass}`;

    if (seatId.startsWith("C")) {
      const num = parseInt(seatId.slice(1));

      if (
        (num >= 1 && num <= 8) ||
        (num >= 17 && num <= 24) ||
        (num >= 33 && num <= 39)
      ) {
        seat.classList.add("isle");
      }
    }

  if (seatId.startsWith("B")) {
      const num = parseInt(seatId.slice(1));

      if (
        (num >= 1 && num <= 10) ||
        (num >= 18 && num <= 24)
      ) {
        seat.classList.add("isle");
      }
    }

    const cameraColor = seatCameraMap[seatId] || "green";

    seat.innerHTML = `
      <div class="camera-indicator ${cameraColor}"></div>

      <div>
        <div class="seat-id">${seatId}</div>

        ${
  timer
    ? `
      <div class="seat-name">${timer.student}</div>
      <div class="seat-time">${formatTime(getRemainingSeconds(timer))}</div>
      <!--<button class="seat-lock-btn" title="Seat is in use">🔒</button>-->
      <button class="seat-clear-btn" onclick="deleteTimer('${timer.id}')">Clear</button>
      
    `
    : seatStatus
    ? `
      <div class="seat-name">${seatStatus.student || seatStatus.testType}</div>
      <div class="seat-time">${seatStatus.student ? seatStatus.testType : seatStatus.status}</div>
      <!--<button class="seat-lock-btn" title="Seat is in use">🔒</button>-->
      <button class="seat-clear-btn" onclick="clearSeatStatus('${seatStatus.id}')">Clear</button>
    `
    : `
      <div class="seat-name">Empty</div>
      <button class="seat-add-btn" onclick="openSeatQuickAdd('${seatId}')">+</button>
    `
}
      </div>
    `;

    seatGrid.appendChild(seat);
  });
}

function formatHistoryDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const datePart = date.toLocaleDateString([], {
    year: "2-digit",
    month: "numeric",
    day: "numeric"
  });

  const timePart = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${datePart} • ${timePart}`;
}

function renderHistory() {
  historyList.innerHTML = "";

  const searchTerm = historySearch.value.trim().toLowerCase();

  const filteredHistory = history.filter(item => {
    const searchableText = [
      item.student,
      item.seat,
      item.lab,
      item.test,
      item.createdAt,
      item.removedAt
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm);
  });

  const visibleHistory = filteredHistory.slice(0, historyVisibleCount);

  if (!visibleHistory.length) {
    historyList.innerHTML = `<div class="empty-state">No history found.</div>`;
    loadMoreHistoryBtn.style.display = "none";
    return;
  }

  visibleHistory.forEach(item => {
    const isSeatStatus = item.type === "seatStatus";

const historyName = isSeatStatus
  ? item.student || "-"
  : item.student || "-";

const historyTest = isSeatStatus
  ? item.testType || "-"
  : item.test || "-";

    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <div>
        <div class="seat-badge ${item.lab === "B" ? "lab-b" : ""}">
          ${item.seat}
        </div>
      </div>

      <div>
        <strong>${historyName}</strong>
      </div>

      <div>
        ${historyTest}
      </div>

      <div class="history-meta">
        <span class="history-date-label">Started</span><br>${formatHistoryDate(item.createdAt)}
      </div>


      <div class="history-meta">
        <span class="history-date-label">Removed</span><br>${formatHistoryDate(item.removedAt)}
      </div>

      <div class="action-buttons">
        <button onclick="deleteHistoryItem('${item.historyId}')">
          🗑
        </button>
      </div>
    `;

    historyList.appendChild(div);
  });

  loadMoreHistoryBtn.style.display =
    visibleHistory.length < filteredHistory.length ? "block" : "none";
}

function refreshScreen() {
  renderTimers();
  renderSeatStatuses();
  renderSeats();
}

function startAlarmLoop(timer) {
  const stillExists = timers.some(t => t.id === timer.id);
if (!stillExists) return;

/*if (!soundEnabled) {
  alert("Timer completed, but sound is not enabled. Click Enable Sound.");
}*/

  if (activeAlarmTimerId) return;

  activeAlarmTimerId = timer.id;

  // Send message to iframe to trigger duck animation
  window.postMessage(
    {
      source: "testing-center-dashboard",
      action: "duck"
    },
    "*"
  );

  playedSounds.add(timer.id);

  const alarmMessage = document.getElementById("alarmMessage");
  alarmMessage.textContent = `${timer.seat} - ${timer.student} timer is complete.`;

  const alarmModalElement = document.getElementById("alarmModal");
  const alarmModal = new bootstrap.Modal(alarmModalElement, {
    backdrop: "static",
    keyboard: false
  });

  alarmModal.show();

  timerSound.currentTime = 0;
  timerSound.play().catch(() => {});

  alarmInterval = setInterval(() => {
    timerSound.currentTime = 0;
    timerSound.play().catch(() => {});
  }, 5000);
}

function stopAlarmLoop() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }

  timerSound.pause();
  timerSound.currentTime = 0;

  activeAlarmTimerId = null;

  const alarmModalElement = document.getElementById("alarmModal");
  const openAlarmModal = bootstrap.Modal.getInstance(alarmModalElement);

  if (openAlarmModal) {
    openAlarmModal.hide();
  }

  window.postMessage(
  {
    source: "testing-center-dashboard",
    action: "restore"
  },
  "*"
);
}

function checkTimerSounds() {
  timers.forEach(timer => {
    const remaining = getRemainingSeconds(timer);

    if (
      remaining <= 0 &&
      !timer.alarmDismissed &&
      !playedSounds.has(timer.id)
    ) {
      startAlarmLoop(timer);
    }
  });
}

setInterval(() => {
  refreshScreen();
  checkTimerSounds();
}, 1000);

window.togglePause = function(id) {
  const timer = timers.find(t => t.id === id);
  if (!timer) return;

  const timerRef = ref(db, `timers/${id}`);

  if (timer.paused) {
    const newEndAt = Date.now() + (timer.pausedRemaining || 0) * 1000;

    update(timerRef, {
      paused: false,
      pausedRemaining: null,
      endAt: newEndAt
    });
  } else {
    update(timerRef, {
      paused: true,
      pausedRemaining: getRemainingSeconds(timer)
    });
  }
};

//Chrome extensions link copy function
window.copyChromeExtensionsLink = async function() {
  try {
    await navigator.clipboard.writeText("chrome://extensions");

    const btn = document.querySelector(".copy-code-btn");

    if (btn) {
      const original = btn.textContent;

      btn.textContent = "Copied!";

      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    }
  } catch (error) {
    alert("Unable to copy.");
  }
};

// Expose openFlagModal to global scope for inline onclick handler
window.openFlagModal = function(type, id) {
  pendingFlagTarget = { type, id };

  let item = null;

  if (type === "timer") {
    item = timers.find(t => t.id === id);
  } else {
    item = seatStatuses.find(s => s.id === id);
  }

  if (!item) return;

  flagModalMessage.textContent =
    `Set flag for ${item.seat} - ${item.student || item.testType || "Seat Status"}`;

  flagSelectInput.value = item.flag || "none";

  flagModal.show();
};

window.addFive = function(id) {
  const timer = timers.find(t => t.id === id);
  if (!timer) return;

  const timerRef = ref(db, `timers/${id}`);

  if (timer.paused) {
    update(timerRef, {
      pausedRemaining: (timer.pausedRemaining || 0) + 300,
      alarmDismissed: false
    });
  } else {
    update(timerRef, {
      endAt: Math.max(timer.endAt, Date.now()) + 300000,
      alarmDismissed: false
    });
  }

  playedSounds.delete(id);
};

// Expose createSeatStatus to global scope for inline onclick handler
function showInfoModal(message) {
  infoModalMessage.textContent = message;
  infoModal.show();
}

// Expose functions to global scope for inline onclick handlers
window.openEditTimer = function(id) {
  const timer = timers.find(t => t.id === id);
  if (!timer) return;

  if (!timer.paused) {
    showInfoModal("Pause the timer before editing.");
    return;
  }

  editingTimerId = id;
  editTimerError.textContent = "";

  editLabInput.value = timer.lab || "C";
  editSeatInput.value = timer.seat || "";
  editStudentInput.value = timer.student || "";
  editTestInput.value = timer.test || "";

  const remaining = timer.pausedRemaining || 0;
  editHoursInput.value = Math.floor(remaining / 3600);
  editMinutesInput.value = Math.floor((remaining % 3600) / 60);

  editTimerModal.show();
};


window.deleteTimer = function(id) {
  const timer = timers.find(t => t.id === id);
  if (!timer) return;

  deleteTimerMessage.textContent =
    `Delete timer for ${timer.seat} - ${timer.student}?`;

  confirmDeleteTimerBtn.onclick = () => {
    const historyItem = {
      ...timer,
      type: "timer",
      removedAt: new Date().toLocaleString(),
      removedAtMs: Date.now()
    };

    push(historyRef, historyItem);
    remove(ref(db, `timers/${id}`));

    deleteTimerModal.hide();
  };

  deleteTimerModal.show();
};

// Expose createSeatStatus to global scope for inline onclick handler
window.openSeatQuickAdd = function(seatId) {
  quickSeatError.textContent = "";

  const lab = seatId.startsWith("B") ? "B" : "C";

  quickSeatLabInput.value = lab;
  quickSeatSeatInput.value = seatId;

  quickSeatStudentInput.value = "";
  quickSeatTestInput.value = "";
  quickSeatHoursInput.value = "";
  quickSeatMinutesInput.value = "";

  seatQuickAddModal.show();
};

window.deleteHistoryItem = function(historyId) {
  requireAdmin(() => {
    const item = history.find(h => h.historyId === historyId);
    if (!item) return;

    deleteHistoryMessage.textContent =
      `Delete history item for ${item.seat || "unknown seat"}?`;

    confirmDeleteHistoryBtn.onclick = () => {
      remove(ref(db, `history/${historyId}`));
      deleteHistoryModal.hide();
    };

    deleteHistoryModal.show();
  });
};

clearAllBtn.addEventListener("click", () => {
  if (!timers.length) return;

  clearAllTimersModal.show();
});

confirmClearAllTimersBtn.addEventListener("click", () => {
  timers.forEach(timer => {
    push(historyRef, {
      ...timer,
      type: "timer",
      removedAt: new Date().toLocaleString(),
      removedAtMs: Date.now()
    });
  });

  remove(timersRef);

  clearAllTimersModal.hide();
});

mapButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    mapButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    activeLab = btn.dataset.lab;

    document.getElementById("mapTitle").textContent = `Lab ${activeLab}`;

    renderSeats();
  });
});

onValue(timersRef, snapshot => {
  const data = snapshot.val() || {};

  timers = Object.values(data).sort((a, b) => {
    return (a.createdAtMs || 0) - (b.createdAtMs || 0);
  });

  if (activeAlarmTimerId) {
  const activeAlarmTimer = timers.find(t => t.id === activeAlarmTimerId);

  if (!activeAlarmTimer || activeAlarmTimer.alarmDismissed) {
    stopAlarmLoop();
  }
}

  renderTimers();
  renderSeatStatuses();
  renderSeats();

  document.getElementById("syncStatus").textContent = "Live Sync: Connected";
});

onValue(historyRef, snapshot => {
  const data = snapshot.val() || {};

  history = Object.entries(data)
  .map(([historyId, item]) => ({
    ...item,
    historyId
  }))
    .sort((a, b) => {
      return (b.removedAtMs || 0) - (a.removedAtMs || 0);
    });

  renderHistory();
});

onValue(seatStatusesRef, snapshot => {
  const data = snapshot.val() || {};

  seatStatuses = Object.values(data).sort((a, b) => {
    return (a.createdAtMs || 0) - (b.createdAtMs || 0);
  });

  renderSeats();
  renderSeatStatuses();
});

const userPresenceRef = push(presenceRef);

set(userPresenceRef, {
  connectedAt: serverTimestamp()
});

onDisconnect(userPresenceRef).remove();

onValue(presenceRef, snapshot => {
  const users = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  document.getElementById("connectedUsers").textContent = `Connected Users: ${users}`;
});

document.getElementById("dismissAlarmBtn").addEventListener("click", () => {
  const timerStillExists = timers.some(t => t.id === activeAlarmTimerId);

  if (activeAlarmTimerId && timerStillExists) {
    update(ref(db, `timers/${activeAlarmTimerId}`), {
      alarmDismissed: true
    });
  }

  stopAlarmLoop();
});

enableSoundBtn.addEventListener("click", async () => {
  try {
    timerSound.volume = 1;
    timerSound.currentTime = 0;
    await timerSound.play();
    timerSound.pause();
    timerSound.currentTime = 0;

    soundEnabled = true;
    enableSoundBtn.textContent = "🔊 Sound Enabled";
    enableSoundBtn.classList.add("enabled");
  } catch (error) {
    alert("Sound could not be enabled. Try clicking the page once, then click Enable Sound again.");
  }
});

dismissStartupSoundBtn.addEventListener("click", () => {
  sessionStorage.setItem("startupSoundReminderDismissed", "true");
});

function unlockDashboard() {
  sessionStorage.setItem("timerDashboardUnlocked", "true");
  passwordScreen.classList.add("hidden");

  setTimeout(() => {
    showStartupSoundReminder();
  }, 300);
}

if (sessionStorage.getItem("timerDashboardUnlocked") === "true") {
  passwordScreen.classList.add("hidden");
}

passwordBtn.addEventListener("click", () => {
  if (passwordInput.value === TEMP_PASSWORD) {
    unlockDashboard();
  } else {
    passwordError.textContent = "Incorrect password.";
    passwordInput.value = "";
    passwordInput.focus();
  }
});

passwordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    passwordBtn.click();
  }
});

historySearch.addEventListener("input", () => {
  historyVisibleCount = 25;
  renderHistory();
});

loadMoreHistoryBtn.addEventListener("click", () => {
  historyVisibleCount += 25;
  renderHistory();
});

window.clearSeatStatus = function(id) {
  const seatStatus = seatStatuses.find(s => s.id === id);
  if (!seatStatus) return;

  const shouldLogHistory =
    seatStatus.status === "Occupied" || seatStatus.student;

  if (shouldLogHistory) {
    push(historyRef, {
      ...seatStatus,
      type: "seatStatus",
      removedAt: new Date().toLocaleString(),
      removedAtMs: Date.now()
    });
  }

  remove(ref(db, `seatStatuses/${id}`));
};

timerModeBtn.addEventListener("click", () => {
  timerModeBtn.classList.add("active");
  seatStatusModeBtn.classList.remove("active");

  formTitle.textContent = "Add New Timer";

  timerFields.classList.remove("d-none");
  seatStatusFields.classList.add("d-none");
  testOptionalField.classList.remove("d-none");
  timerTimeFields.classList.remove("d-none");
});

seatStatusModeBtn.addEventListener("click", () => {
  seatStatusModeBtn.classList.add("active");
  timerModeBtn.classList.remove("active");

  formTitle.textContent = "Add Seat Status";

  timerFields.classList.add("d-none");
  seatStatusFields.classList.remove("d-none");
  testOptionalField.classList.add("d-none");
  timerTimeFields.classList.add("d-none");
});

addSeatStatusBtn.addEventListener("click", createSeatStatus);

function isAdminUnlocked() {
  return sessionStorage.getItem("historyAdminUnlocked") === "true";
}

function requireAdmin(action) {
  if (isAdminUnlocked()) {
    action();
    return;
  }

  pendingAdminAction = action;
  adminPasswordInput.value = "";
  adminPasswordError.textContent = "";
  adminUnlockModal.show();
}

adminUnlockBtn.addEventListener("click", () => {
  if (adminPasswordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem("historyAdminUnlocked", "true");
    adminUnlockModal.hide();

    if (pendingAdminAction) {
      pendingAdminAction();
      pendingAdminAction = null;
    }
  } else {
    adminPasswordError.textContent = "Incorrect admin password.";
    adminPasswordInput.value = "";
    adminPasswordInput.focus();
  }
});

adminPasswordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    adminUnlockBtn.click();
  }
});

saveEditTimerBtn.addEventListener("click", () => {
  const timer = timers.find(t => t.id === editingTimerId);
  if (!timer) return;

  const lab = editLabInput.value;
  const seat = normalizeSeat(lab, editSeatInput.value);
  const student = editStudentInput.value.trim();
  const test = editTestInput.value.trim();
  const hours = parseInt(editHoursInput.value) || 0;
  const minutes = parseInt(editMinutesInput.value) || 0;
  const totalSeconds = (hours * 60 + minutes) * 60;

  if (!seat || !student || totalSeconds <= 0) {
    editTimerError.textContent = "Please complete all required fields.";
    return;
  }

  const duplicateTimer = timers.find(
    t =>
      t.id !== editingTimerId &&
      t.seat.toUpperCase() === seat.toUpperCase()
  );

  const duplicateStatus = seatStatuses.find(
    s => s.seat.toUpperCase() === seat.toUpperCase()
  );

  if (duplicateTimer || duplicateStatus) {
    editTimerError.textContent = `${seat} is already in use.`;
    return;
  }

  update(ref(db, `timers/${editingTimerId}`), {
    lab,
    seat,
    student,
    test,
    durationSeconds: totalSeconds,
    paused: true,
    pausedRemaining: totalSeconds,
    endAt: null,
    alarmDismissed: false
  });

  editTimerModal.hide();
});

window.addEventListener("message", event => {
  if (event.source !== window) return;
  if (event.data?.source !== "testing-center-extension") return;

  if (event.data.action === "requestSeatMap") {
    window.postMessage(
      {
        source: "testing-center-dashboard",
        action: "seatMapData",
        data: {
          activeLab,
          timers,
          seatStatuses
        }
      },
      "*"
    );
  }
});

// Quick add mode for seats
quickSeatTimerModeBtn.addEventListener("click", () => {
  quickSeatTimerModeBtn.classList.add("active");
  quickSeatStatusModeBtn.classList.remove("active");

  quickSeatTimerFields.classList.remove("d-none");
  quickSeatStatusFields.classList.add("d-none");

  saveQuickSeatTimerBtn.textContent = "Add Timer";
  quickSeatError.textContent = "";
});

quickSeatStatusModeBtn.addEventListener("click", () => {
  quickSeatStatusModeBtn.classList.add("active");
  quickSeatTimerModeBtn.classList.remove("active");

  quickSeatStatusFields.classList.remove("d-none");
  quickSeatTimerFields.classList.add("d-none");

  saveQuickSeatTimerBtn.textContent = "Add Seat Status";
  quickSeatError.textContent = "";
});


saveQuickSeatTimerBtn.addEventListener("click", () => {
  const lab = quickSeatLabInput.value;
  const seat = normalizeSeat(lab, quickSeatSeatInput.value);
  const student = quickSeatStudentInput.value.trim();

  if (!seat) {
    quickSeatError.textContent = "Seat is required.";
    return;
  }

  if (quickSeatStatusModeBtn.classList.contains("active")) {
    const testType = quickSeatTestTypeInput.value;
    const status = quickSeatStatusInput.value;

    if (!testType || !status) {
      quickSeatError.textContent = "Please complete the seat status fields.";
      return;
    }

    createSeatStatusObject({
      lab,
      seat,
      student,
      testType,
      status
    });

    seatQuickAddModal.hide();
    return;
  }

  const test = quickSeatTestInput.value.trim();
  const hours = parseInt(quickSeatHoursInput.value) || 0;
  const minutes = parseInt(quickSeatMinutesInput.value) || 0;
  const totalMinutes = hours * 60 + minutes;

  if (!student || totalMinutes <= 0) {
    quickSeatError.textContent = "Please complete all timer fields.";
    return;
  }

  const closingTime = getClosingTimeToday();

const secondsUntilClose = Math.floor(
  (closingTime.getTime() - Date.now()) / 1000
);

const requestedSeconds = totalMinutes * 60;

const finalSeconds = Math.min(
  requestedSeconds,
  Math.max(0, secondsUntilClose)
);

const finalMinutes = Math.ceil(finalSeconds / 60);

createNewTimerObject({
  lab,
  seat,
  student,
  test,
  minutes: finalMinutes
});

  seatQuickAddModal.hide();
});

// Flagging functionality
saveFlagBtn.addEventListener("click", () => {
  if (!pendingFlagTarget) return;

  const { type, id } = pendingFlagTarget;

  const selectedFlag = flagSelectInput.value;

  const targetRef =
    type === "timer"
      ? ref(db, `timers/${id}`)
      : ref(db, `seatStatuses/${id}`);

  update(targetRef, {
    flag: selectedFlag
  });

  flagModal.hide();

  pendingFlagTarget = null;
});

function showStartupSoundReminder() {
  if (sessionStorage.getItem("startupSoundReminderDismissed") === "true") {
    return;
  }

  startupSoundModal.show();
}

renderTimers();
renderSeatStatuses();
renderSeats();
renderHistory();
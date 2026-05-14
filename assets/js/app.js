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

const deleteTimerModalElement = document.getElementById("deleteTimerModal");
const deleteTimerModal = new bootstrap.Modal(deleteTimerModalElement);
const deleteTimerMessage = document.getElementById("deleteTimerMessage");
const confirmDeleteTimerBtn = document.getElementById("confirmDeleteTimerBtn");

const ADMIN_PASSWORD = "bd13311";

const adminUnlockModalElement = document.getElementById("adminUnlockModal");
const adminUnlockModal = new bootstrap.Modal(adminUnlockModalElement);
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminPasswordError = document.getElementById("adminPasswordError");
const adminUnlockBtn = document.getElementById("adminUnlockBtn");

const deleteHistoryModalElement = document.getElementById("deleteHistoryModal");
const deleteHistoryModal = new bootstrap.Modal(deleteHistoryModalElement);
const deleteHistoryMessage = document.getElementById("deleteHistoryMessage");
const confirmDeleteHistoryBtn = document.getElementById("confirmDeleteHistoryBtn");

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
  C45: "orange", C46: "orange", C47: "green", C48: "green",

  B1: "red", B2: "red", B3: "red", B4: "red",
  B5: "red", B6: "red", B7: "red", B8: "red",
  B9: "orange", B10: "orange", B11: "red", B12: "orange",
  B13: "green", B14: "green", B15: "green", B16: "green",
  B17: "green", B18: "green", B19: "green", B20: "red",
  B21: "red", B22: "green", B23: "orange", B24: "red",
  B25: "green", B26: "green", B27: "green", B28: "green",
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

function createTimer() {
  const lab = document.getElementById("labInput").value;
  const rawSeat = document.getElementById("seatInput").value;
  const seat = normalizeSeat(lab, rawSeat);
  const student = document.getElementById("studentInput").value.trim();
  const test = document.getElementById("testInput").value.trim();
  const hours = parseInt(document.getElementById("hoursInput").value) || 0;
const minutes = parseInt(document.getElementById("minutesInput").value) || 0;
const totalMinutes = hours * 60 + minutes;

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
  minutes: totalMinutes
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
      minutes: totalMinutes
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
  minutes: totalMinutes
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

function renderTimers() {
  timerList.innerHTML = "";

  document.getElementById("timerCount").textContent = `${timers.length} active`;

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
      </div>

      <div>
        ${timer.test || "-"}
      </div>

      <div class="remaining ${status}">
        ${formatTime(remaining)}
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
        <button onclick="togglePause('${timer.id}')">
          ${timer.paused ? "▶" : "⏸"}
        </button>

        <button onclick="addFive('${timer.id}')">
          +5
        </button>

        <button onclick="deleteTimer('${timer.id}')">
          🗑
        </button>
      </div>
    `;

    timerList.appendChild(item);
  });
}

function getTimerSeatClass(timer, remaining) {
  const testCode = (timer.test || "").trim().toUpperCase();

  if (testCode.includes("ADS")) return "active-ads";
  if (testCode.includes("MISCONDUCT")) return "active-misconduct";

  const status = getTimerStatus(remaining);

  if (status === "green") return "active-green";
  if (status === "orange") return "active-orange";
  if (status === "red") return "active-red";

  return "";
}

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

      statusClass =
        seatStatus.status === "Reserved"
          ? "seat-reserved"
          : "seat-occupied";
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
    `
    : seatStatus
    ? `
      <div class="seat-name">${seatStatus.student || seatStatus.testType}</div>
<div class="seat-time">${seatStatus.student ? seatStatus.testType : seatStatus.status}</div>
<button class="seat-clear-btn" onclick="clearSeatStatus('${seatStatus.id}')">Clear</button>
    `
    : `
      <div class="seat-name">Empty</div>
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

  const confirmClear = confirm("Clear all active timers?");
  if (!confirmClear) return;

  timers.forEach(timer => {
    push(historyRef, {
      ...timer,
      removedAt: new Date().toLocaleString(),
      removedAtMs: Date.now()
    });
  });

  remove(timersRef);
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

  renderTimers();
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

function unlockDashboard() {
  sessionStorage.setItem("timerDashboardUnlocked", "true");
  passwordScreen.classList.add("hidden");
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

renderTimers();
renderSeats();
renderHistory();
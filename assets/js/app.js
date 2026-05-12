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

const timerList = document.getElementById("timerList");
const historyList = document.getElementById("historyList");
const seatGrid = document.getElementById("seatGrid");

const startTimerBtn = document.getElementById("startTimerBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

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

let activeLab = "C";
let timers = [];
let history = [];
let playedSounds = new Set();
let alarmInterval = null;
let activeAlarmTimerId = null;

const seatCameraMap = {
  C1: "green", C2: "orange", C3: "orange", C4: "green",
  C5: "red", C6: "green", C7: "orange", C8: "green",
  C9: "orange", C10: "green", C11: "green", C12: "orange",
  C13: "green", C14: "red", C15: "orange", C16: "green",
  C17: "orange", C18: "green", C19: "orange", C20: "red",
  C21: "red", C22: "green", C23: "green", C24: "green",
  C25: "green", C26: "green", C27: "green", C28: "green",
  C29: "green", C30: "green", C31: "green", C32: "green",
  C33: "green", C34: "green", C35: "green", C36: "green",
  C37: "green", C38: "green", C39: "green", C40: "green",
  C41: "green", C42: "green", C43: "green", C44: "green",
  C45: "green", C46: "green", C47: "green",

  B01: "green", B02: "green", B03: "orange", B04: "red",
  B05: "green", B06: "green", B07: "orange", B08: "green",
  B09: "orange", B10: "red"
};

function updateClock() {
  const now = new Date();
  currentTime.textContent = now.toLocaleTimeString();
  currentDate.textContent = now.toLocaleDateString();
}

setInterval(updateClock, 1000);
updateClock();

function formatTime(seconds) {
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
    endAt: Date.now() + minutes * 60 * 1000,
    paused: false,
    pausedRemaining: null,
    alarmDismissed: false,
    createdAt: new Date().toLocaleString(),
    createdAtMs: Date.now()
  };

  set(newTimerRef, timer);
}

function createTimer() {
  const lab = document.getElementById("labInput").value;
  const seat = document.getElementById("seatInput").value.trim().toUpperCase();
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

function renderSeats() {
  seatGrid.innerHTML = "";
  seatGrid.className = `seat-grid lab-${activeLab.toLowerCase()}`;

  let seats = [];

  if (activeLab === "C") {
    seats = [
      "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8",
      "C16", "C15", "C14", "C13", "C12", "C11", "C10", "C9",
      "C17", "C18", "C19", "C20", "C21", "C22", "C23", "C24",
      "C32", "C31", "C30", "C29", "C28", "C27", "C26", "C25",
      "", "C33", "C34", "C35", "C36", "C37", "C38", "C39",
      "C47", "C46", "C45", "C44", "C43", "C42", "C41", "C40"
    ];
  } else {
    for (let i = 1; i <= 10; i++) {
      seats.push(`B${String(i).padStart(2, "0")}`);
    }
  }

  seats.forEach(seatId => {
    const timer = timers.find(t => t.seat === seatId);
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
      const status = getTimerStatus(remaining);

      if (status === "green") statusClass = "active-green";
      if (status === "orange") statusClass = "active-orange";
      if (status === "red") statusClass = "active-red";
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
            : `
              <div class="seat-name">Empty</div>
            `
        }
      </div>
    `;

    seatGrid.appendChild(seat);
  });
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
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <div>
        <div class="seat-badge ${item.lab === "B" ? "lab-b" : ""}">
          ${item.seat}
        </div>
      </div>

      <div>
        <strong>${item.student}</strong>
      </div>

      <div>
        ${item.test || "-"}
      </div>

      <div>
        Started:<br>${item.createdAt || "-"}
      </div>

      <div>
        Removed:
      </div>

      <div>
        ${item.removedAt || "-"}
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
if (!soundEnabled) {
  alert("Timer completed, but sound is not enabled. Click Enable Sound.");
}

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

  const historyItem = {
    ...timer,
    removedAt: new Date().toLocaleString(),
    removedAtMs: Date.now()
  };

  push(historyRef, historyItem);
  remove(ref(db, `timers/${id}`));
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

  history = Object.values(data).sort((a, b) => {
    return (b.removedAtMs || 0) - (a.removedAtMs || 0);
  });

  renderHistory();
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
  if (activeAlarmTimerId) {
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

renderTimers();
renderSeats();
renderHistory();
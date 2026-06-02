import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue,
  update
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

const app = initializeApp(firebaseConfig, "globalAlarmApp");
const db = getDatabase(app);

const globalTimerSound =
  document.getElementById("globalTimerSound");

let globalAlarmInterval = null;

const timersRef = ref(db, "timers");

const modalElement =
  document.getElementById("globalAlarmModal");

if (!modalElement) {
  console.warn("Global alarm modal not found.");
}

const modal =
  modalElement
    ? new bootstrap.Modal(modalElement)
    : null;

const alarmMessage =
  document.getElementById("globalAlarmMessage");

const dismissBtn =
  document.getElementById("globalDismissAlarmBtn");

const openDashboardBtn =
  document.getElementById("globalOpenDashboardBtn");

let activeAlarmId = null;

dismissBtn?.addEventListener("click", () => {

  if (!activeAlarmId) return;
    
  update(
    ref(db, `timers/${activeAlarmId}`),
    {
      alarmDismissed: true
    }
  );

  modal.hide();

  stopGlobalAlarmSound();
});

openDashboardBtn?.addEventListener("click", () => {
    stopGlobalAlarmSound();

  if (!activeAlarmId) {
    window.location.href = "index.html";
    return;
  }

  update(
    ref(db, `timers/${activeAlarmId}`),
    {
      alarmDismissed: true
    }
  ).finally(() => {
    window.location.href = "index.html";
  });
});

let timers = [];

function checkGlobalAlarm() {
  const now = Date.now();

  const expiredTimer = timers.find(timer =>
    !timer.paused &&
    timer.endAt &&
    now >= timer.endAt &&
    !timer.alarmDismissed
  );

  if (!expiredTimer || activeAlarmId === expiredTimer.id) {
    return;
  }

  activeAlarmId = expiredTimer.id;

  const student = expiredTimer.student || "Unknown";
  const seat = expiredTimer.seat || "--";

  alarmMessage.textContent =
    `${student} • ${seat} timer has completed.`;

  modal.show();
  startGlobalAlarmSound();
}

onValue(timersRef, snapshot => {
  const data = snapshot.val() || {};
  timers = Object.values(data);

  checkGlobalAlarm();
});

setInterval(checkGlobalAlarm, 1000);

function startGlobalAlarmSound() {
  if (!globalTimerSound) return;

  if (localStorage.getItem("dashboardSoundEnabled") !== "true") {
    return;
  }

  globalTimerSound.currentTime = 0;
  globalTimerSound.play().catch(() => {});

  globalAlarmInterval = setInterval(() => {
    globalTimerSound.currentTime = 0;
    globalTimerSound.play().catch(() => {});
  }, 5000);
}

function stopGlobalAlarmSound() {
  if (globalAlarmInterval) {
    clearInterval(globalAlarmInterval);
    globalAlarmInterval = null;
  }

  if (globalTimerSound) {
    globalTimerSound.pause();
    globalTimerSound.currentTime = 0;
  }
}
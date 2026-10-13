import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, onValue, ref } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { getProjectedEndMs, getRemainingSeconds } from "./timer-closing.mjs";
import {
  getTimerPage,
  getUrgentTimers,
  MAX_TIMERS_PER_PAGE,
  PAGE_ROTATION_MS,
  sortTimersByCompletion
} from "./timer-monitor.mjs";

const accessMessage = document.getElementById("accessMessage");
const timerWindow = document.getElementById("timerWindow");

if (
  sessionStorage.getItem("timerDashboardUnlocked") !== "true" ||
  sessionStorage.getItem("staffCheckedIn") !== "true" ||
  !sessionStorage.getItem("staffName")
) {
  accessMessage.hidden = false;
} else {
  timerWindow.hidden = false;

  const firebaseConfig = {
    apiKey: "RemovedKEY",
    authDomain: "hc-testing-center.firebaseapp.com",
    databaseURL: "https://hc-testing-center-default-rtdb.firebaseio.com",
    projectId: "hc-testing-center",
    storageBucket: "hc-testing-center.firebasestorage.app",
    messagingSenderId: "555153286496",
    appId: "1:555153286496:web:76dddf80bd00af838f2a05"
  };

  const db = getDatabase(initializeApp(firebaseConfig));
  const list = document.getElementById("timerWindowList");
  const count = document.getElementById("timerWindowCount");
  const sync = document.getElementById("timerWindowSync");
  const scaleOutput = document.getElementById("timerFontScale");
  const fullScreenButton = document.getElementById("timerFullscreenBtn");
  const pageIndicator = document.getElementById("timerPageIndicator");
  const urgentStrip = document.getElementById("urgentTimerStrip");
  const urgentList = document.getElementById("urgentTimerList");
  let timers = [];
  let rows = new Map();
  let currentPage = 0;
  let pageCount = 1;
  let lastPageTurn = Date.now();

  const storedScale = Number(localStorage.getItem("activeTimerFontScale"));
  let fontScale = Number.isFinite(storedScale) && storedScale >= 80 && storedScale <= 160
    ? storedScale
    : 100;

  function setFontScale(value) {
    fontScale = Math.max(80, Math.min(160, value));
    document.documentElement.style.setProperty("--timer-scale", fontScale / 100);
    scaleOutput.textContent = `${fontScale}%`;
    localStorage.setItem("activeTimerFontScale", String(fontScale));
    if (timers.length) renderPage();
  }

  setFontScale(fontScale);

  document.getElementById("decreaseTimerFont").addEventListener("click", () => {
    setFontScale(fontScale - 10);
  });
  document.getElementById("increaseTimerFont").addEventListener("click", () => {
    setFontScale(fontScale + 10);
  });

  fullScreenButton.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await timerWindow.requestFullscreen();
      }
    } catch {
      sync.textContent = "Full screen is unavailable in this browser.";
    }
  });

  document.addEventListener("fullscreenchange", () => {
    const exiting = Boolean(document.fullscreenElement);
    fullScreenButton.setAttribute("aria-label", exiting ? "Exit full screen" : "Enter full screen");
    fullScreenButton.title = exiting ? "Exit full screen" : "Enter full screen";
  });

  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remaining = seconds % 60;
    return [hours, minutes, remaining]
      .map(value => String(value).padStart(2, "0"))
      .join(":");
  }

  function cell(className, value) {
    const element = document.createElement("div");
    element.className = className;
    element.textContent = value || "-";
    return element;
  }

  function createRow(timer) {
    const row = document.createElement("div");
    row.className = "monitor-row";
    row.dataset.timerId = timer.id;

    const seat = cell("monitor-seat", timer.seat);
    if (timer.lab === "B") seat.classList.add("lab-b");
    row.appendChild(seat);
    row.appendChild(cell("monitor-name", timer.student));
    row.appendChild(cell("monitor-instructor", timer.test));

    const clock = document.createElement("div");
    clock.className = "monitor-clock";
    clock.appendChild(cell("monitor-time", "00:00:00"));
    clock.appendChild(cell("monitor-end", "Ends --"));
    row.appendChild(clock);
    row.appendChild(cell("monitor-status", "Paused"));
    return row;
  }

  function getPageSize() {
    if (!timers.length) return MAX_TIMERS_PER_PAGE;

    const longestName = timers.reduce((a, b) =>
      String(a.student || "").length >= String(b.student || "").length ? a : b
    ).student;
    const longestInstructor = timers.reduce((a, b) =>
      String(a.test || "").length >= String(b.test || "").length ? a : b
    ).test;
    const probe = createRow({ ...timers[0], student: longestName, test: longestInstructor });
    list.replaceChildren(probe);
    const rowHeight = probe.getBoundingClientRect().height;
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    const available = list.clientHeight;
    list.replaceChildren();

    return Math.max(1, Math.min(
      MAX_TIMERS_PER_PAGE,
      Math.floor((available + gap - 2) / (rowHeight + gap))
    ));
  }

  function renderPage() {
    rows = new Map();
    count.textContent = `${timers.length} active`;

    if (!timers.length) {
      list.replaceChildren(cell("empty-state", "No active timers."));
      pageCount = 1;
      currentPage = 0;
      pageIndicator.textContent = "Page 1 of 1";
      return;
    }

    const pageSize = getPageSize();
    pageCount = Math.ceil(timers.length / pageSize);
    currentPage = Math.min(currentPage, pageCount - 1);
    pageIndicator.textContent = `Page ${currentPage + 1} of ${pageCount}`;

    const fragment = document.createDocumentFragment();
    for (const timer of getTimerPage(timers, currentPage, pageSize)) {
      const row = createRow(timer);
      rows.set(timer.id, row);
      fragment.appendChild(row);
    }
    list.replaceChildren(fragment);
    refreshTimers();
  }

  function updateUrgentStrip(nowMs = Date.now()) {
    const urgent = getUrgentTimers(timers, nowMs);
    const visibilityChanged = urgentStrip.hidden !== (urgent.length === 0);
    urgentStrip.hidden = urgent.length === 0;

    const fragment = document.createDocumentFragment();
    urgent.slice(0, 3).forEach(timer => {
      fragment.appendChild(cell(
        "timer-urgent-item",
        `${timer.seat}: ${formatTime(getRemainingSeconds(timer, nowMs))}`
      ));
    });
    if (urgent.length > 3) {
      fragment.appendChild(cell("timer-urgent-item", `+${urgent.length - 3} more`));
    }
    urgentList.replaceChildren(fragment);
    return visibilityChanged;
  }

  function refreshTimers() {
    for (const timer of timers) {
      const row = rows.get(timer.id);
      if (!row) continue;

      const remaining = getRemainingSeconds(timer);
      const time = row.querySelector(".monitor-time");
      const color = remaining <= 300 ? "red" : remaining <= 900 ? "orange" : "green";
      time.textContent = formatTime(remaining);
      time.className = `monitor-time ${timer.paused ? "paused-timer" : color}`;
      row.querySelector(".monitor-end").textContent = `Ends ${new Date(getProjectedEndMs(timer)).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
      })}`;
      row.querySelector(".monitor-status").textContent = timer.paused
        ? "Paused"
        : remaining <= 0 ? "Time Up" : "Running";
    }
  }

  onValue(ref(db, "timers"), snapshot => {
    timers = sortTimersByCompletion(Object.values(snapshot.val() || {}));
    updateUrgentStrip();
    renderPage();
    lastPageTurn = Date.now();
  }, () => {
    sync.textContent = "Timer data is unavailable.";
    sync.className = "timer-window-sync disconnected";
  });

  onValue(ref(db, ".info/connected"), snapshot => {
    const connected = snapshot.val() === true;
    sync.textContent = connected ? "Live · Synced" : "Disconnected";
    sync.className = `timer-window-sync ${connected ? "connected" : "disconnected"}`;
  });

  new ResizeObserver(() => {
    if (timers.length) renderPage();
  }).observe(list);

  setInterval(() => {
    const nowMs = Date.now();
    const sorted = sortTimersByCompletion(timers, nowMs);
    const orderChanged = sorted.some((timer, index) => timer.id !== timers[index]?.id);
    timers = sorted;
    const alertChanged = updateUrgentStrip(nowMs);

    if (orderChanged || alertChanged) renderPage();

    if (pageCount > 1 && nowMs - lastPageTurn >= PAGE_ROTATION_MS) {
      const elapsedPages = Math.floor((nowMs - lastPageTurn) / PAGE_ROTATION_MS);
      currentPage = (currentPage + elapsedPages) % pageCount;
      lastPageTurn += elapsedPages * PAGE_ROTATION_MS;
      renderPage();
    } else if (pageCount === 1) {
      lastPageTurn = nowMs;
    }

    refreshTimers();
  }, 1000);
}

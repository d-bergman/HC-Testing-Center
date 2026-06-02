import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
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

const historyRef = ref(db, "history");

const dayMetricsGrid = document.getElementById("dayMetricsGrid");
const weekMetricsGrid = document.getElementById("weekMetricsGrid");
const monthMetricsGrid = document.getElementById("monthMetricsGrid");
const lastMonthMetricsGrid = document.getElementById("lastMonthMetricsGrid");
const allTimeMetricsGrid = document.getElementById("allTimeMetricsGrid");

let historyItems = [];

const labCSeatHeatmap = document.getElementById("labCSeatHeatmap");
const labBSeatHeatmap = document.getElementById("labBSeatHeatmap");

function getSeatUsageCounts() {
  return countBy(
    historyItems
      .map(item => ({ seat: getSeat(item) }))
      .filter(item => item.seat),
    "seat"
  );
}

function getSeatHeatClass(count, maxCount) {
  if (!count) return "usage-none";

  const percent = count / maxCount;

  if (percent >= 0.75) return "usage-highest";
  if (percent >= 0.5) return "usage-high";
  if (percent >= 0.25) return "usage-medium";

  return "usage-low";
}

function renderSeatHeatmap(target, lab) {
  const seatCounts = getSeatUsageCounts();

  const maxCount = Math.max(
    1,
    ...Object.values(seatCounts)
  );

  const seats =
    lab === "C"
      ? [
          "", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8",
          "", "C16", "C15", "C14", "C13", "C12", "C11", "C10", "C9",
          "", "C17", "C18", "C19", "C20", "C21", "C22", "C23", "C24",
          "", "C32", "C31", "C30", "C29", "C28", "C27", "C26", "C25",
          "", "", "C33", "C34", "C35", "C36", "C37", "C38", "C39",
          "C48", "C47", "C46", "C45", "C44", "C43", "C42", "C41", "C40"
        ]
      : [
          "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10",
          "", "", "", "B17", "B16", "B15", "B14", "B13", "B12", "B11",
          "", "", "", "B18", "B19", "B20", "B21", "B22", "B23", "B24",
          "", "", "", "B31", "B30", "B29", "B28", "B27", "B26", "B25"
        ];

  target.innerHTML = "";

  seats.forEach(seatId => {
    const seat = document.createElement("div");

    if (!seatId) {
      seat.className = "seat-usage-empty";
      target.appendChild(seat);
      return;
    }

    const count = seatCounts[seatId] || 0;

    seat.className =
      `seat-usage-cell ${getSeatHeatClass(count, maxCount)}`;

    seat.innerHTML = `
      <strong>${seatId}</strong>
      <span>${count} uses</span>
    `;

    target.appendChild(seat);
  });
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  return d;
}

function startOfMonth(date) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

function getTestType(item) {
  if (item.type === "timer") return "Make-Up";
  return item.testType || item.test || "Other";
}

function getItemDate(item) {
  if (item.removedAtMs) return item.removedAtMs;
  if (item.createdAtMs) return item.createdAtMs;

  if (item.removedAt) {
    const parsed = new Date(item.removedAt).getTime();
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (item.createdAt) {
    const parsed = new Date(item.createdAt).getTime();
    if (!Number.isNaN(parsed)) return parsed;
  }

  return 0;
}

function filterByStartDate(items, startDate) {
  const startMs = startDate.getTime();

  return items.filter(item => {
    const itemDate = getItemDate(item);
    return itemDate >= startMs;
  });
}

function countBy(items, fieldName, fallback = "Unknown") {
  return items.reduce((acc, item) => {
    const key = item[fieldName] || fallback;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function topEntry(counts) {
  const entries = Object.entries(counts);

  if (!entries.length) return ["-", 0];

  return entries.sort((a, b) => b[1] - a[1])[0];
}

function topThree(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

function renderMetricCard(label, value, detail = "") {
  return `
    <div class="metric-card">
      <div class="metric-label">${label}</div>
      <div class="metric-value">${value}</div>
      ${detail ? `<div class="metric-detail">${detail}</div>` : ""}
    </div>
  `;
}

function renderPeriodMetrics(target, items, options = {}) {
  const testCounts = countBy(
    items.map(item => ({
      testType: getTestType(item)
    })),
    "testType"
  );

  const sortedTestTypes = Object.entries(testCounts)
    .sort((a, b) => b[1] - a[1]);

  const cards = [
    renderMetricCard("Students Processed", items.length)
  ];

  sortedTestTypes.forEach(([type, count]) => {
    if (count > 0) {
      cards.push(renderMetricCard(type, count));
    }
  });

  if (options.includeTopSeats) {
    const topSeats = topThree(
      countBy(
        items
          .map(item => ({ seat: getSeat(item) }))
          .filter(item => item.seat),
        "seat"
      )
    );

    cards.push(
      renderMetricCard("Top 1 Seat", topSeats[0]?.[0] || "-", `${topSeats[0]?.[1] || 0} uses`),
      renderMetricCard("Top 2 Seat", topSeats[1]?.[0] || "-", `${topSeats[1]?.[1] || 0} uses`),
      renderMetricCard("Top 3 Seat", topSeats[2]?.[0] || "-", `${topSeats[2]?.[1] || 0} uses`)
    );
  }

  target.innerHTML = cards.join("");
}

function renderExtraStats() {
  const allTestCounts = countBy(
    historyItems.map(item => ({
      testType: getTestType(item)
    })),
    "testType"
  );

  const [popularTest, popularTestCount] = topEntry(allTestCounts);

  const mostUsedResource = [...resources]
    .sort((a, b) => (b.openCount || 0) - (a.openCount || 0))[0];

  const mostUsedGuide = [...guides]
    .sort((a, b) => (b.openCount || 0) - (a.openCount || 0))[0];

  const topSeats = topThree(
  countBy(
    historyItems
      .map(item => ({ seat: getSeat(item) }))
      .filter(item => item.seat),
    "seat"
  )
);

  extraStatsGrid.innerHTML = `
    <div class="metrics-section-card">
      <h2>All-Time Totals</h2>

      <div class="metrics-grid mt-3">
        ${renderMetricCard("Total Students Processed", historyItems.length)}
        ${renderMetricCard("Most Popular Test", popularTest, `${popularTestCount} records`)}
        ${renderMetricCard("Most Used Resource", mostUsedResource?.title || "-", `${mostUsedResource?.openCount || 0} opens`)}
        ${renderMetricCard("Most Used Guide", mostUsedGuide?.title || "-", `${mostUsedGuide?.openCount || 0} opens`)}
      </div>
    </div>

    <div class="metrics-section-card">
      <h2>All-Time Top Seats</h2>

      <div class="metrics-grid mt-3">
        ${renderMetricCard("Top 1 Seat", topSeats[0]?.[0] || "-", `${topSeats[0]?.[1] || 0} uses`)}
        ${renderMetricCard("Top 2 Seat", topSeats[1]?.[0] || "-", `${topSeats[1]?.[1] || 0} uses`)}
        ${renderMetricCard("Top 3 Seat", topSeats[2]?.[0] || "-", `${topSeats[2]?.[1] || 0} uses`)}
      </div>
    </div>
  `;
}

function renderAllMetrics() {
  const now = new Date();

  renderPeriodMetrics(
    dayMetricsGrid,
    filterBetweenDates(
      historyItems,
      startOfDay(now),
      new Date()
    )
  );

  renderPeriodMetrics(
    weekMetricsGrid,
    filterBetweenDates(
      historyItems,
      startOfCurrentWeekMonday(now),
      new Date()
    )
  );

  renderPeriodMetrics(
    monthMetricsGrid,
    filterBetweenDates(
      historyItems,
      startOfMonth(now),
      new Date()
    )
  );

  renderPeriodMetrics(
    lastMonthMetricsGrid,
    filterBetweenDates(
      historyItems,
      startOfLastMonth(now),
      endOfLastMonth(now)
    )
  );

  renderPeriodMetrics(
    allTimeMetricsGrid,
    historyItems,
    { includeTopSeats: true }
  );

  renderSeatHeatmap(labCSeatHeatmap, "C");
renderSeatHeatmap(labBSeatHeatmap, "B");
}

onValue(historyRef, snapshot => {
  const data = snapshot.val() || {};
  historyItems = Object.values(data);
  renderAllMetrics();
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

function getSeat(item) {
  return (item.seat || "")
    .toString()
    .trim()
    .toUpperCase();
}

function startOfCurrentWeekMonday(date) {
  const d = startOfDay(date);
  const day = d.getDay();

  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);

  return d;
}

function startOfLastMonth(date) {
  const d = startOfMonth(date);
  d.setMonth(d.getMonth() - 1);
  return d;
}

function endOfLastMonth(date) {
  return startOfMonth(date);
}

function filterBetweenDates(items, startDate, endDate) {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  return items.filter(item => {
    const itemDate = getItemDate(item);
    return itemDate >= startMs && itemDate < endMs;
  });
}
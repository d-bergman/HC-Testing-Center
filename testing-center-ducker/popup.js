async function getDashboardTab() {
  const tabs = await chrome.tabs.query({
    url: [
      "http://127.0.0.1:5500/index.html",
      "http://localhost:5500/index.html",
      "https://*.github.io/HC-Testing-Center/*"
    ]
  });

  return tabs[0] || null;
}

document.getElementById("duckBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "duck" });
});

document.getElementById("restoreBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "restore" });
});

document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("quickHours").value = btn.dataset.hours;
    document.getElementById("quickMinutes").value = btn.dataset.minutes;
  });
});

function showQuickStatus(message, type = "") {
  const status = document.getElementById("quickStatus");

  status.textContent = message;
  status.className = `quick-status ${type}`;
}

let miniMapLab = "C";
let latestSeatMapData = null;

const labCSeats = [
  "", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8",
  "", "C16", "C15", "C14", "C13", "C12", "C11", "C10", "C9",
  "", "C17", "C18", "C19", "C20", "C21", "C22", "C23", "C24",
  "", "C32", "C31", "C30", "C29", "C28", "C27", "C26", "C25",
  "", "", "C33", "C34", "C35", "C36", "C37", "C38", "C39",
  "C48", "C47", "C46", "C45", "C44", "C43", "C42", "C41", "C40"
];

const labBSeats = [
  "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10",
  "", "", "", "B17", "B16", "B15", "B14", "B13", "B12", "B11",
  "", "", "", "B18", "B19", "B20", "B21", "B22", "B23", "B24",
  "", "", "", "B31", "B30", "B29", "B28", "B27", "B26", "B25"
];

function getMiniSeatClass(seatId) {
  if (!latestSeatMapData) return "empty";

  const timer = latestSeatMapData.timers.find(t => t.seat === seatId);
  const seatStatus = latestSeatMapData.seatStatuses.find(s => s.seat === seatId);

  if (timer) {
    const remaining = timer.paused
      ? timer.pausedRemaining || 0
      : Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));

    if (remaining <= 300) return "danger";
    if (remaining <= 900) return "warning";
    return "timer";
  }

  if (seatStatus) {
    return seatStatus.status === "Reserved" ? "reserved" : "occupied";
  }

  return "empty";
}

function renderMiniMap() {
  const miniMap = document.getElementById("miniMap");
  const seats = miniMapLab === "C" ? labCSeats : labBSeats;

  miniMap.className = `mini-map lab-${miniMapLab.toLowerCase()}`;
  miniMap.innerHTML = "";

  seats.forEach(seatId => {
    const btn = document.createElement("button");

    if (!seatId) {
      btn.className = "mini-seat blank";
      miniMap.appendChild(btn);
      return;
    }

    const seatClass = getMiniSeatClass(seatId);

    btn.className = `mini-seat ${seatClass}`;
    btn.textContent = seatId;

    if (seatClass !== "empty") {
      btn.disabled = true;
      btn.title = `${seatId} is already in use`;
      miniMap.appendChild(btn);
      return;
    }

    btn.addEventListener("click", () => {
      document.getElementById("quickLab").value = seatId.startsWith("B") ? "B" : "C";
      document.getElementById("quickSeat").value = seatId;
    });

    miniMap.appendChild(btn);
  });
}

async function loadMiniMap() {
  const dashboardTab = await getDashboardTab();

  if (!dashboardTab) {
    renderMiniMap();
    return;
  }

  chrome.tabs.sendMessage(
  dashboardTab.id,
  { action: "requestSeatMap" },
  response => {
    if (chrome.runtime.lastError) {
      latestSeatMapData = null;
      renderMiniMap();
      return;
    }

    if (response?.ok) {
      latestSeatMapData = response.data;
    }

    renderMiniMap();
  }
);
}

document.querySelectorAll(".mini-map-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    miniMapLab = btn.dataset.lab;

    document.querySelectorAll(".mini-map-tab").forEach(tab => {
      tab.classList.remove("active");
    });

    btn.classList.add("active");
    renderMiniMap();
  });
});

loadMiniMap();
setInterval(loadMiniMap, 1000);

document.getElementById("quickAddBtn").addEventListener("click", async () => {
  const data = {
    lab: document.getElementById("quickLab").value,
    seat: document.getElementById("quickSeat").value.trim(),
    student: document.getElementById("quickStudent").value.trim(),
    test: document.getElementById("quickTest").value.trim(),
    hours: document.getElementById("quickHours").value,
    minutes: document.getElementById("quickMinutes").value
  };

  const dashboardTab = await getDashboardTab();

if (!dashboardTab) {
  showQuickStatus("Dashboard tab not found.", "error");
  return;
}

    chrome.tabs.sendMessage(
  dashboardTab.id,
  {
    action: "quickAddTimer",
    data
  },
  response => {
    if (chrome.runtime.lastError || !response?.ok) {
      showQuickStatus("Could not send timer.", "error");
      return;
    }

    showQuickStatus("Timer sent to dashboard.", "success");
  }
);

await chrome.tabs.update(dashboardTab.id, { active: true });
await chrome.windows.update(dashboardTab.windowId, { focused: true });
  setTimeout(() => {
  window.close();
}, 600);
});

async function sendQuickSeatStatus(status) {
  const dashboardTab = await getDashboardTab();

  if (!dashboardTab) {
    showQuickStatus("Dashboard tab not found.", "error");
    return;
  }

  const data = {
    lab: document.getElementById("statusLab").value,
    seat: document.getElementById("statusSeat").value.trim(),
    student: "",
    testType: document.getElementById("statusType").value,
    status
  };

  chrome.tabs.sendMessage(
    dashboardTab.id,
    {
      action: "quickAddSeatStatus",
      data
    },
    response => {
      if (chrome.runtime.lastError || !response?.ok) {
        showQuickStatus("Could not send seat status.", "error");
        return;
      }

      showQuickStatus(`${status} sent to dashboard.`, "success");
    }
  );

  await chrome.tabs.update(dashboardTab.id, { active: true });
  await chrome.windows.update(dashboardTab.windowId, { focused: true });
 setTimeout(() => {
  window.close();
}, 600);
}

document.getElementById("quickOccupiedBtn").addEventListener("click", () => {
  sendQuickSeatStatus("Occupied");
});

document.getElementById("quickReservedBtn").addEventListener("click", () => {
  sendQuickSeatStatus("Reserved");
});

document.querySelectorAll(".popup-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const targetId = tab.dataset.tab;

    document.querySelectorAll(".popup-tab").forEach(btn => {
      btn.classList.remove("active");
    });

    document.querySelectorAll(".popup-section").forEach(section => {
      section.classList.remove("active-section");
    });

    tab.classList.add("active");
    document.getElementById(targetId).classList.add("active-section");
  });
});

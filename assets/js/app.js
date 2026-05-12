const timerList = document.getElementById("timerList");
const historyList = document.getElementById("historyList");
const seatGrid = document.getElementById("seatGrid");

const startTimerBtn = document.getElementById("startTimerBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

const currentTime = document.getElementById("currentTime");
const currentDate = document.getElementById("currentDate");

const timerSound = document.getElementById("timerSound");

const mapButtons = document.querySelectorAll(".map-btn");

let activeLab = "C";

let timers = [];
let history = [];

const seatCameraMap = {
  C01: "green",
  C02: "orange",
  C03: "orange",
  C04: "green",
  C05: "red",
  C06: "green",
  C07: "orange",
  C08: "green",
  C09: "orange",
  C10: "green",
  C11: "green",
  C12: "orange",
  C13: "green",
  C14: "red",
  C15: "orange",
  C16: "green",
  C17: "orange",
  C18: "green",
  C19: "orange",
  C20: "red",
  C21: "red",

  B01: "green",
  B02: "green",
  B03: "orange",
  B04: "red",
  B05: "green",
  B06: "green",
  B07: "orange",
  B08: "green",
  B09: "orange",
  B10: "red"
};

function updateClock() {
  const now = new Date();

  currentTime.textContent =
    now.toLocaleTimeString();

  currentDate.textContent =
    now.toLocaleDateString();
}

setInterval(updateClock, 1000);
updateClock();

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hrs.toString().padStart(2, "0"),
    mins.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0")
  ].join(":");
}

function getTimerStatus(seconds) {
  if (seconds <= 300) return "red";
  if (seconds <= 900) return "orange";
  return "green";
}

function createTimer() {
  const lab =
    document.getElementById("labInput").value;

  const seat =
    document.getElementById("seatInput").value.trim();

  const student =
    document.getElementById("studentInput").value.trim();

  const test =
    document.getElementById("testInput").value.trim();

  const minutes =
    parseInt(document.getElementById("minutesInput").value);

  if (!seat || !student || !minutes) {
    alert("Please complete all required fields.");
    return;
  }

  const timer = {
    id: crypto.randomUUID(),
    lab,
    seat,
    student,
    test,
    remaining: minutes * 60,
    paused: false,
    timeUpPlayed: false,
    createdAt: new Date().toLocaleString()
  };

  timers.push(timer);

  renderTimers();
  renderSeats();

  document.getElementById("seatInput").value = "";
  document.getElementById("studentInput").value = "";
  document.getElementById("testInput").value = "";
}

startTimerBtn.addEventListener("click", createTimer);

function renderTimers() {
  timerList.innerHTML = "";

  if (!timers.length) {
    timerList.innerHTML =
      `<div class="empty-state">No active timers.</div>`;
    return;
  }

  timers.forEach(timer => {
    const status = getTimerStatus(timer.remaining);

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
        ${formatTime(timer.remaining)}
      </div>

      <div class="status-label">
        ${
          timer.paused
            ? "Paused"
            : timer.remaining <= 0
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

  document.getElementById("timerCount").textContent =
    `${timers.length} active`;
}

function renderSeats() {
  seatGrid.innerHTML = "";
  seatGrid.className = `seat-grid lab-${activeLab.toLowerCase()}`;

  let seats = [];

if (activeLab === "C") {
  seats = [
    "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08",
    "C16", "C15", "C14", "C13", "C12", "C11", "C10", "C09",
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

    let statusClass = "";

    if (timer) {
      const status = getTimerStatus(timer.remaining);

      if (status === "green")
        statusClass = "active-green";

      if (status === "orange")
        statusClass = "active-orange";

      if (status === "red")
        statusClass = "active-red";
    }

    seat.className = `seat ${statusClass}`;
    if(seat == ""){
      seat.id = `noseat`;
      console.log(seat.id);
    }
    const cameraColor =
      seatCameraMap[seatId] || "green";

    seat.innerHTML = `
      <div class="camera-indicator ${cameraColor}"></div>

      <div>
        <div class="seat-id">${seatId}</div>

        ${
          timer
            ? `
            <div class="seat-name">
              ${timer.student}
            </div>

            <div class="seat-time">
              ${formatTime(timer.remaining)}
            </div>
          `
            : `
            <div class="seat-name">
              Empty
            </div>
          `
        }
      </div>
    `;

    seatGrid.appendChild(seat);
  });
}

function updateTimers() {
  timers.forEach(timer => {
    if (!timer.paused && timer.remaining > 0) {
      timer.remaining--;
    }

    if (
      timer.remaining <= 0 &&
      !timer.timeUpPlayed
    ) {
      timer.timeUpPlayed = true;

      timerSound.play().catch(() => {});
    }
  });

  renderTimers();
  renderSeats();
}

setInterval(updateTimers, 1000);

window.togglePause = function(id) {
  const timer = timers.find(t => t.id === id);

  if (!timer) return;

  timer.paused = !timer.paused;

  renderTimers();
};

window.addFive = function(id) {
  const timer = timers.find(t => t.id === id);

  if (!timer) return;

  timer.remaining += 300;

  renderTimers();
  renderSeats();
};

window.deleteTimer = function(id) {
  const timer = timers.find(t => t.id === id);

  if (!timer) return;

  history.unshift({
    ...timer,
    removedAt: new Date().toLocaleString()
  });

  timers = timers.filter(t => t.id !== id);

  renderTimers();
  renderSeats();
  renderHistory();
};

clearAllBtn.addEventListener("click", () => {
  timers.forEach(timer => {
    history.unshift({
      ...timer,
      removedAt: new Date().toLocaleString()
    });
  });

  timers = [];

  renderTimers();
  renderSeats();
  renderHistory();
});

function renderHistory() {
  historyList.innerHTML = "";

  if (!history.length) {
    historyList.innerHTML =
      `<div class="empty-state">No history yet.</div>`;
    return;
  }

  history.forEach(item => {
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
        ${item.createdAt}
      </div>

      <div>
        Removed:
      </div>

      <div>
        ${item.removedAt}
      </div>
    `;

    historyList.appendChild(div);
  });
}

mapButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    mapButtons.forEach(b =>
      b.classList.remove("active")
    );

    btn.classList.add("active");

    activeLab = btn.dataset.lab;

    document.getElementById("mapTitle").textContent =
      `Lab ${activeLab}`;

    renderSeats();
  });
});

renderTimers();
renderSeats();
renderHistory();
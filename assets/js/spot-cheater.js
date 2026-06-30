const cheaterSeatGrid = document.getElementById("cheaterSeatGrid");
const cheaterMapTitle = document.getElementById("cheaterMapTitle");
const cheaterScore = document.getElementById("cheaterScore");
const cheaterTime = document.getElementById("cheaterTime");
const cheaterRound = document.getElementById("cheaterRound");
const cheaterMessage = document.getElementById("cheaterMessage");
const startCheaterGameBtn = document.getElementById("startCheaterGameBtn");
const labButtons = document.querySelectorAll("[data-game-lab]");

let activeLab = "C";
let score = 0;
let timeLeft = 30;
let round = 0;
let gameActive = false;
let cheaterSeat = null;
let gameTimer = null;

const labSeats = {
  C: [
    "", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8",
    "", "C16", "C15", "C14", "C13", "C12", "C11", "C10", "C9",
    "", "C17", "C18", "C19", "C20", "C21", "C22", "C23", "C24",
    "", "C32", "C31", "C30", "C29", "C28", "C27", "C26", "C25",
    "", "", "C33", "C34", "C35", "C36", "C37", "C38", "C39",
    "C48", "C47", "C46", "C45", "C44", "C43", "C42", "C41", "C40"
  ],
  B: [
    "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10",
    "", "", "", "B17", "B16", "B15", "B14", "B13", "B12", "B11",
    "", "", "", "B18", "B19", "B20", "B21", "B22", "B23", "B24",
    "", "", "", "B31", "B30", "B29", "B28", "B27", "B26", "B25"
  ]
};

const normalStudentIcons = [
  "🧑‍💻",
  "👩‍💻",
  "👨‍💻",
  "🙇",
  "✍️",
  "🤔"
];

const cheaterClues = [
  {
    icon: "📱",
    message: "Caught! Phone under the desk."
  },
  {
    icon: "📝",
    message: "Caught! Notes beside the keyboard."
  },
  {
    icon: "👀",
    message: "Caught! Looking at another screen."
  },
  {
    icon: "🎧",
    message: "Caught! Suspicious earbud."
  },
  {
    icon: "💬",
    message: "Caught! Talking during the test."
  }
];

let currentClue = cheaterClues[0];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRealSeats() {
  return labSeats[activeLab].filter(Boolean);
}

function renderGameMap() {
  cheaterSeatGrid.innerHTML = "";
  cheaterSeatGrid.className = `seat-grid lab-${activeLab.toLowerCase()}`;

  labSeats[activeLab].forEach(seatId => {
    const seat = document.createElement("div");

    if (!seatId) {
      seat.id = "noseat";
      seat.className = "isle";
      cheaterSeatGrid.appendChild(seat);
      return;
    }

    const isCheater = seatId === cheaterSeat;
    const icon = isCheater
      ? currentClue.icon
      : getRandomItem(normalStudentIcons);

    seat.className = "seat cheater-game-seat";

    seat.innerHTML = `
      <div>
        <div class="seat-id">${seatId}</div>
        <div class="cheater-student-icon">${icon}</div>
      </div>
    `;

    seat.addEventListener("click", () => {
      handleSeatClick(seatId);
    });

    cheaterSeatGrid.appendChild(seat);
  });
}

function nextRound() {
  round += 1;
  cheaterRound.textContent = round;

  const seats = getRealSeats();

  cheaterSeat = getRandomItem(seats);
  currentClue = getRandomItem(cheaterClues);

  cheaterMessage.textContent =
    "Find the suspicious student.";

  renderGameMap();
}

function handleSeatClick(seatId) {
  if (!gameActive) return;

  if (seatId === cheaterSeat) {
    score += 10;
    cheaterScore.textContent = score;
    cheaterMessage.textContent =
      `${currentClue.message} +10`;

    nextRound();
    return;
  }

  score -= 5;
  cheaterScore.textContent = score;
  cheaterMessage.textContent =
    `Wrong seat. ${seatId} was innocent. -5`;
}

function startGame() {
  score = 0;
  timeLeft = 30;
  round = 0;
  gameActive = true;

  cheaterScore.textContent = score;
  cheaterTime.textContent = timeLeft;
  cheaterRound.textContent = round;

  startCheaterGameBtn.textContent = "Restart Game";

  clearInterval(gameTimer);

  nextRound();

  gameTimer = setInterval(() => {
    timeLeft -= 1;
    cheaterTime.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameActive = false;
  clearInterval(gameTimer);

  cheaterMessage.textContent =
    `Game over. Final score: ${score}`;

  cheaterSeat = null;
  renderGameMap();
}

startCheaterGameBtn.addEventListener("click", startGame);

labButtons.forEach(button => {
  button.addEventListener("click", () => {
    labButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    activeLab = button.dataset.gameLab;
    cheaterMapTitle.textContent = `Lab ${activeLab}`;

    if (gameActive) {
      nextRound();
    } else {
      renderGameMap();
    }
  });
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

renderGameMap();
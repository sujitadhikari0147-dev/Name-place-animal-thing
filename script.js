const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const categories = ["Name", "Place", "Animal", "Thing"];

let partyCode = "";
let players = [];
let turnIndex = 0;
let selectedLetter = "";
let answers = {};
let scores = {};
let myName = "";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function createParty() {
  const nameInput = document.getElementById("playerName");
  const name = nameInput.value.trim();

  if (!name) {
    alert("Enter your name first");
    return;
  }

  myName = name;
  partyCode = generateCode();
  players = [{ name, score: 0 }];
  scores = {};
  scores[name] = 0;
  answers = {};
  turnIndex = 0;
  selectedLetter = "";

  showGame();
}

function joinParty() {
  const name = document.getElementById("playerName").value.trim();
  const code = document.getElementById("joinCode").value.trim().toUpperCase();

  if (!name || !code) {
    alert("Enter your name and party code");
    return;
  }

  myName = name;
  partyCode = code;

  if (!players.find((p) => p.name === name)) {
    players.push({ name, score: 0 });
    scores[name] = 0;
  }

  showGame();
}

function showGame() {
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");
  document.getElementById("partyCode").textContent = partyCode;
  renderLetters();
  renderPlayers();
  renderTable();
  updateTurnText();
}

function copyCode() {
  navigator.clipboard.writeText(partyCode);
  alert("Party code copied");
}

function addDemoPlayer() {
  const demoName = `Player${players.length + 1}`;
  players.push({ name: demoName, score: 0 });
  scores[demoName] = 0;
  renderPlayers();
  renderTable();
  updateTurnText();
}

function renderLetters() {
  const lettersDiv = document.getElementById("letters");
  lettersDiv.innerHTML = "";

  letters.forEach((letter) => {
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.className = "letter-btn";
    if (selectedLetter === letter) {
      btn.classList.add("selected");
    }

    btn.onclick = () => {
      selectedLetter = letter;
      document.getElementById("selectedLetter").textContent = selectedLetter;
      renderLetters();
    };

    lettersDiv.appendChild(btn);
  });
}

function renderPlayers() {
  const playersList = document.getElementById("playersList");
  playersList.innerHTML = "";

  players.forEach((player, index) => {
    const div = document.createElement("div");
    const turnMark = index === turnIndex ? " ← current turn" : "";
    div.textContent = `${player.name} — ${player.score} points${turnMark}`;
    playersList.appendChild(div);
  });
}

function updateTurnText() {
  if (!players.length) {
    document.getElementById("turnText").textContent = "No players yet";
    return;
  }

  document.getElementById("turnText").textContent =
    `${players[turnIndex].name}'s turn to choose a letter`;
}

function startRound() {
  if (!selectedLetter) {
    alert("Choose a letter first");
    return;
  }

  answers = {};

  players.forEach((player) => {
    answers[player.name] = {
      Name: "",
      Place: "",
      Animal: "",
      Thing: ""
    };
  });

  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("gameTableBody");
  tbody.innerHTML = "";

  players.forEach((player) => {
    const tr = document.createElement("tr");

    let rowHtml = `<td>${player.name}</td>`;

    categories.forEach((category) => {
      const value = answers[player.name]?.[category] || "";
      rowHtml += `
        <td>
          <input
            value="${value}"
            placeholder="${category} with ${selectedLetter || "_"}"
            oninput="updateAnswer('${player.name}', '${category}', this.value)"
          />
        </td>
      `;
    });

    rowHtml += `<td class="score">${player.score}</td>`;
    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });
}

function updateAnswer(playerName, category, value) {
  if (!answers[playerName]) {
    answers[playerName] = {
      Name: "",
      Place: "",
      Animal: "",
      Thing: ""
    };
  }

  answers[playerName][category] = value;
}

function finishRound() {
  if (!selectedLetter) {
    alert("Choose a letter first");
    return;
  }

  players.forEach((player) => {
    let roundPoints = 0;
    const playerAnswers = answers[player.name] || {};

    categories.forEach((category) => {
      const value = (playerAnswers[category] || "").trim();

      if (value && value[0].toUpperCase() === selectedLetter) {
        roundPoints += 10;
      }
    });

    player.score += roundPoints;
    scores[player.name] = player.score;
  });

  turnIndex = (turnIndex + 1) % players.length;
  selectedLetter = "";
  document.getElementById("selectedLetter").textContent = "-";

  renderLetters();
  renderPlayers();
  renderTable();
  updateTurnText();
}
.round-block {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 18px;
  background: #ffffff;
}

.round-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.small-note {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.points-input {
  width: 80px;
}

.stopped-banner {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  background: #fee2e2;
  color: #991b1b;
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 12px;
}

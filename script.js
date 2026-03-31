const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let partyCode = "";
let players = [];
let turnIndex = 0;
let selectedLetter = "";
let currentRound = null;
let rounds = [];

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function createParty() {
  const name = document.getElementById("playerName").value.trim();
  if (!name) {
    alert("Enter your name");
    return;
  }

  partyCode = generateCode();
  players = [{ name, total: 0 }];
  turnIndex = 0;
  selectedLetter = "";
  currentRound = null;
  rounds = [];

  showGame();
}

function joinParty() {
  const name = document.getElementById("playerName").value.trim();
  if (!name) {
    alert("Enter your name");
    return;
  }

  if (!partyCode) {
    partyCode = prompt("Enter party code")?.trim().toUpperCase() || "";
  }

  if (!partyCode) return;

  if (!players.find((p) => p.name === name)) {
    players.push({ name, total: 0 });
  }

  showGame();
}

function showGame() {
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");
  document.getElementById("partyCode").textContent = partyCode;
  renderTurn();
  renderLetters();
  renderTable();
  renderHistory();
}

function renderTurn() {
  if (!players.length) {
    document.getElementById("turnText").textContent = "-";
    return;
  }
  document.getElementById("turnText").textContent = players[turnIndex].name;
}

function renderLetters() {
  const box = document.getElementById("letters");
  box.innerHTML = "";

  letters.forEach((letter) => {
    const btn = document.createElement("button");
    btn.textContent = letter;
    if (selectedLetter === letter) btn.classList.add("active");

    btn.onclick = () => {
      if (currentRound && currentRound.active) return;
      selectedLetter = letter;
      document.getElementById("selectedLetter").textContent = letter;
      renderLetters();
    };

    box.appendChild(btn);
  });
}

function buildRound() {
  const rows = {};

  players.forEach((player) => {
    rows[player.name] = {
      name: "",
      place: "",
      animal: "",
      things: "",
      points: ""
    };
  });

  return {
    number: rounds.length + 1,
    chosenBy: players[turnIndex].name,
    letter: selectedLetter,
    active: true,
    stoppedBy: "",
    rows
  };
}

function startRound() {
  if (!selectedLetter) {
    alert("Choose a letter first");
    return;
  }

  if (currentRound && currentRound.active) {
    alert("Round is already active");
    return;
  }

  currentRound = buildRound();
  renderTable();
}

function stopRound() {
  if (!currentRound || !currentRound.active) {
    alert("No active round");
    return;
  }

  currentRound.active = false;
  currentRound.stoppedBy = "Player";

  players.forEach((player) => {
    const pts = parseInt(currentRound.rows[player.name].points, 10);
    if (!isNaN(pts)) {
      player.total += pts;
    }
  });

  rounds.push(currentRound);
  currentRound = null;
  turnIndex = (turnIndex + 1) % players.length;
  selectedLetter = "";
  document.getElementById("selectedLetter").textContent = "-";

  renderTurn();
  renderLetters();
  renderTable();
  renderHistory();
}

function addDemoPlayer() {
  const demoName = `Player${players.length + 1}`;
  players.push({ name: demoName, total: 0 });

  if (currentRound) {
    currentRound.rows[demoName] = {
      name: "",
      place: "",
      animal: "",
      things: "",
      points: ""
    };
  }

  renderTurn();
  renderTable();
  renderHistory();
}

function updateCell(playerName, field, value) {
  if (!currentRound || !currentRound.active) return;
  currentRound.rows[playerName][field] = value;
}

function renderTable() {
  const body = document.getElementById("gameTableBody");
  body.innerHTML = "";

  players.forEach((player) => {
    const tr = document.createElement("tr");

    const row = currentRound
      ? currentRound.rows[player.name]
      : { name: "", place: "", animal: "", things: "", points: "" };

    const disabled = currentRound && currentRound.active ? "" : "disabled";

    tr.innerHTML = `
      <td>${escapeHtml(player.name)}</td>
      <td><input ${disabled} value="${escapeHtml(row.name)}" oninput="updateCell('${jsSafe(player.name)}','name',this.value)" /></td>
      <td><input ${disabled} value="${escapeHtml(row.place)}" oninput="updateCell('${jsSafe(player.name)}','place',this.value)" /></td>
      <td><input ${disabled} value="${escapeHtml(row.animal)}" oninput="updateCell('${jsSafe(player.name)}','animal',this.value)" /></td>
      <td><input ${disabled} value="${escapeHtml(row.things)}" oninput="updateCell('${jsSafe(player.name)}','things',this.value)" /></td>
      <td><input ${disabled} value="${escapeHtml(row.points)}" oninput="updateCell('${jsSafe(player.name)}','points',this.value)" /></td>
    `;

    body.appendChild(tr);
  });
}

function renderHistory() {
  const box = document.getElementById("roundHistory");

  if (!rounds.length) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = rounds
    .map((round) => {
      const rowsHtml = players
        .map((player) => {
          const row = round.rows[player.name] || {
            name: "",
            place: "",
            animal: "",
            things: "",
            points: ""
          };

          return `
            <tr>
              <td>${escapeHtml(player.name)}</td>
              <td>${escapeHtml(row.name)}</td>
              <td>${escapeHtml(row.place)}</td>
              <td>${escapeHtml(row.animal)}</td>
              <td>${escapeHtml(row.things)}</td>
              <td>${escapeHtml(row.points)}</td>
            </tr>
          `;
        })
        .join("");

      return `
        <div class="round-card">
          <div class="round-title">Round ${round.number} — Letter ${escapeHtml(round.letter)}</div>
          <div class="round-note">Chosen by ${escapeHtml(round.chosenBy)}</div>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Name</th>
                <th>Place</th>
                <th>Animal</th>
                <th>Things</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function jsSafe(value) {
  return String(value).replaceAll("'", "\\'");
}

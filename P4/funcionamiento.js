const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const musicBtn = document.getElementById("musicBtn");
const music = document.getElementById("music");

const levelDisplay = document.getElementById("level");
const timeDisplay = document.getElementById("time");
const statusDisplay = document.getElementById("status");
const message = document.getElementById("message");

const pairSelect = document.getElementById("pairSelect");
const levelSelect = document.getElementById("levelSelect");

let playing = false;
let musicOn = true;

const speedLevels = [800, 600, 450, 300, 200];

const crono = new Crono(timeDisplay);

// Categorías
const categories = {
  "cama-casa": [
    { word: "cama", img: "cama.webp" },
    { word: "casa", img: "casa.png" }
  ],
  "pato-gato": [
    { word: "pato", img: "pato.webp" },
    { word: "gato", img: "gato.png" }
  ],
  "queso-beso": [
    { word: "queso", img: "queso.webp" },
    { word: "beso", img: "beso.png" }
  ],
  "luna-cuna": [
    { word: "luna", img: "luna.png" },
    { word: "cuna", img: "cuna.png" }
  ]
};

function createGrid(items) {
  grid.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("card");

    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.word;

    const text = document.createElement("p");
    text.textContent = item.word;

    div.appendChild(img);
    div.appendChild(text);

    grid.appendChild(div);
  });
}


// Niveles
function generateLevel(pair, level) {
  let [a, b] = categories[pair];
  let arr = [];

  if (level === 1) {
  arr = [a,a,a,a,b,b,b,b];
} else if (level === 2) {
  arr = [a,b,a,b,a,b,a,b];
} else if (level === 3) {
  arr = shuffle([a,a,a,a,b,b,b,b]);
} else if (level === 4) {
  arr = shuffle([a,a,a,a,b,b,b,b]);
} else if (level === 5) {
  arr = shuffle([a,a,a,a,b,b,b,b]);
}

  return arr;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Juego
async function playGame(startLevel) {
  playing = true;
  statusDisplay.textContent = "Jugando";

  for (let lvl = startLevel; lvl <= 5; lvl++) {
    if (!playing) return;

    levelDisplay.textContent = lvl;
    message.textContent = "Prepárate...";
    await sleep(1000);

    let pair = pairSelect.value;
    let words = generateLevel(pair, lvl);

    createGrid(words);

    let cards = document.querySelectorAll(".card");

    for (let i = 0; i < cards.length; i++) {
      if (!playing) return;

      cards.forEach(c => c.classList.remove("active"));
      cards[i].classList.add("active");

      message.textContent = cards[i].textContent;

      await sleep(speedLevels[lvl - 1]);
    }
  }

  endGame();
}


// start
startBtn.onclick = () => {
  if (playing) return;

  playing = true;

  // Bloquear controles
  pairSelect.disabled = true;
  levelSelect.disabled = true;

  statusDisplay.textContent = "Jugando";
  message.textContent = "Prepárate...";

  // Cronómetro
  crono.reset();
  crono.start();

  if (musicOn) music.play();

  let startLevel = parseInt(levelSelect.value);
  playGame(startLevel);
};

// Stop
stopBtn.onclick = () => {
  playing = false;

  crono.stop();
  music.pause();

  statusDisplay.textContent = "Detenido";

  //Desbloquear controles
  pairSelect.disabled = false;
  levelSelect.disabled = false;
};

// Fin
function endGame() {
  playing = false;

  crono.stop();
  music.pause();

  statusDisplay.textContent = "Finalizado";
  message.textContent = "¡Juego terminado!";

  // Desbloquear controles
  pairSelect.disabled = false;
  levelSelect.disabled = false;
}

// Música
musicBtn.onclick = () => {
  musicOn = !musicOn;

  musicBtn.textContent = musicOn ? "Música ON" : "Música OFF";

  if (!musicOn) {
    music.pause();
  } else if (playing) {
    music.play();
  }
};
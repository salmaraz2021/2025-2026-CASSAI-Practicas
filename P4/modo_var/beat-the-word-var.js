const ROUND_SEQUENCE = [
  "CAMA",
  "CAMA",
  "CAMA",
  "CAMA",
  "CASA",
  "CASA",
  "CASA",
  "CASA"
];

const SHOW_MS = 700;
const GAP_MS = 300;

const wordEl = document.getElementById("word");
const stateEl = document.getElementById("state");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const replayBtn = document.getElementById("replayBtn");
const recordAudioEl = document.getElementById("recordAudio");
const logEl = document.getElementById("log");
const playerEl = document.getElementById("player");

let gameRunning = false;
let timers = [];
let currentAudioUrl = null;

let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];

function setState(text) {
  stateEl.textContent = text;
}

function setLog(text, append = false) {
  if (append) {
    logEl.innerHTML += "<br>" + text;
  } else {
    logEl.innerHTML = text;
  }

  logEl.scrollTop = logEl.scrollHeight;
}

function addLog(text) {
  setLog(text, true);
}

function clearTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers = [];
}

function cleanupAudioUrl() {
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}

async function startRecording() {
  if (!recordAudioEl.checked) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    addLog("El navegador no permite acceder al micrófono.");
    return;
  }

  if (typeof MediaRecorder === "undefined") {
    addLog("MediaRecorder no está disponible en este navegador.");
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });

    mediaRecorder.addEventListener("stop", () => {
      cleanupAudioUrl();

      const blob = new Blob(audioChunks, {
        type: mediaRecorder.mimeType || "audio/webm"
      });

      currentAudioUrl = URL.createObjectURL(blob);
      playerEl.src = currentAudioUrl;
      replayBtn.disabled = false;

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
      }

      addLog("Grabación disponible para reproducción.");
    });

    mediaRecorder.start();
    addLog("Modo VAR activado. Grabación iniciada.");
  } catch (error) {
    addLog("No se pudo acceder al micrófono: " + error.message);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
}

async function startGame() {
  cleanupAudioUrl();
  playerEl.removeAttribute("src");
  replayBtn.disabled = true;

  clearTimers();
  gameRunning = true;

  startBtn.disabled = true;
  stopBtn.disabled = false;
  recordAudioEl.disabled = true;

  setLog("Partida preparada.");
  setState("Preparando");
  wordEl.textContent = "3";

  await startRecording();

  const countdown2 = setTimeout(() => {
    wordEl.textContent = "2";
  }, 500);

  const countdown1 = setTimeout(() => {
    wordEl.textContent = "1";
  }, 1000);

  const goTimer = setTimeout(() => {
    wordEl.textContent = "¡Ya!";
    setState("Comenzando");
  }, 1500);

  timers.push(countdown2, countdown1, goTimer);

  const startOffset = 2000;

  ROUND_SEQUENCE.forEach((word, index) => {
    const showAt = startOffset + index * (SHOW_MS + GAP_MS);

    const timer = setTimeout(() => {
      showWord(word);
    }, showAt);

    timers.push(timer);
  });

  const endAt = startOffset + ROUND_SEQUENCE.length * (SHOW_MS + GAP_MS) + 100;

  const endTimer = setTimeout(() => {
    endGame();
  }, endAt);

  timers.push(endTimer);
}

function endGame() {
  gameRunning = false;
  clearTimers();

  wordEl.classList.remove("active");
  wordEl.textContent = "Fin de la ronda";
  setState("Partida terminada");

  startBtn.disabled = false;
  stopBtn.disabled = true;
  recordAudioEl.disabled = false;

  stopRecording();
  addLog("Partida terminada.");
}

stopBtn.addEventListener("click", () => {
  addLog("Partida detenida manualmente.");
  endGame();
});

replayBtn.addEventListener("click", () => {
  if (playerEl.src) {
    playerEl.currentTime = 0;
    playerEl.play();
  }
});

playerEl.currentTime = 0;

startBtn.addEventListener("click", startGame);

replayBtn.addEventListener("click", () => {
  if (playerEl.src) {
    playerEl.currentTime = 0;
    playerEl.play();
  }
});

setState("En espera");
setLog("Aquí aparecerán los eventos de la ronda.");
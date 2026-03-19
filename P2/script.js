// -------------------- ELEMENTOS --------------------
const d1 = document.getElementById("d1");
const d2 = document.getElementById("d2");
const d3 = document.getElementById("d3");
const d4 = document.getElementById("d4");

const intentosSpan = document.getElementById("intentos");
const mensaje = document.querySelector(".mensaje");

const botones = document.querySelectorAll(".teclado button:not(.control)");
const controles = document.querySelectorAll(".control");

const display = document.getElementById("crono");

// -------------------- CRONO --------------------
const crono = new Crono(display);

// -------------------- CLAVE --------------------
function generarClave() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
}

let clave = generarClave();
console.log("Clave:", clave);

// -------------------- ESTADO --------------------
let aciertos = [false, false, false, false];
let intentos = 7;
let juegoActivo = true;

// -------------------- FUNCIONES --------------------
function actualizarIntentos() {
    intentosSpan.textContent = intentos;
}

function desactivarTodo() {
    botones.forEach(b => b.disabled = true);
}

function resetJuego() {

    d1.textContent = "*";
    d2.textContent = "*";
    d3.textContent = "*";
    d4.textContent = "*";

    clave = generarClave();
    console.log("Nueva clave:", clave);

    aciertos = [false, false, false, false];
    intentos = 7;
    juegoActivo = true;

    actualizarIntentos();
    mensaje.textContent = "Pulsa Start o un número para comenzar.";

    botones.forEach(boton => {
        boton.disabled = false;
    });
}

// -------------------- BOTONES --------------------
botones.forEach(boton => {
    boton.addEventListener("click", () => {

        if (!juegoActivo) return;

        boton.disabled = true;

        const valor = boton.textContent;
        crono.start();

        let acertado = false;

        if (valor == clave[0] && !aciertos[0]) {
            d1.textContent = valor;
            aciertos[0] = true;
            acertado = true;
        }
        else if (valor == clave[1] && !aciertos[1]) {
            d2.textContent = valor;
            aciertos[1] = true;
            acertado = true;
        }
        else if (valor == clave[2] && !aciertos[2]) {
            d3.textContent = valor;
            aciertos[2] = true;
            acertado = true;
        }
        else if (valor == clave[3] && !aciertos[3]) {
            d4.textContent = valor;
            aciertos[3] = true;
            acertado = true;
        }

        if (!acertado) {
            intentos--;
            actualizarIntentos();
        }

        // GANAR
        if (aciertos.every(a => a)) {
            mensaje.textContent = "YOU WIN!";
            crono.stop();
            juegoActivo = false;
            desactivarTodo();
        }

        // PERDER
        if (intentos <= 0) {
            mensaje.textContent = "YOU LOSE!";
            crono.stop();
            juegoActivo = false;
            desactivarTodo();
        }
    });
});

// -------------------- CONTROLES --------------------
controles.forEach(btn => {
    btn.addEventListener("click", () => {

        const accion = btn.textContent;

        if (accion === "Start") {
            crono.start();
        }

        if (accion === "Stop") {
            crono.stop();
        }

        if (accion === "Reset") {
            crono.reset();
            resetJuego();
        }
    });
});


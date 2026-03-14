let clave = []
let intentos = 7
let usados = []
let cronometroIniciado = false

const intentosSpan = document.getElementById("intentos")
const mensaje = document.getElementById("mensaje")

crearBotones()
generarClave()

function crearBotones(){

const contenedor = document.getElementById("numeros")

for(let i=0;i<=9;i++){

let btn = document.createElement("button")
btn.textContent = i
btn.id = "num"+i

btn.addEventListener("click", ()=>pulsarNumero(i,btn))

contenedor.appendChild(btn)

}

}

function generarClave(){

clave = []

while(clave.length < 4){

let n = Math.floor(Math.random()*10)

if(!clave.includes(n)){
clave.push(n)
}

}

}

function pulsarNumero(num, boton){

if(!cronometroIniciado){
iniciarCrono()
cronometroIniciado = true
}

if(usados.includes(num)) return

usados.push(num)

boton.disabled = true
boton.classList.add("usado")

intentos--
intentosSpan.textContent = intentos

comprobarNumero(num)

if(intentos === 0){
perder()
}

}

function comprobarNumero(num){

for(let i=0;i<clave.length;i++){

if(clave[i] === num){

let d = document.getElementById("d"+i)
d.textContent = num
d.classList.add("acierto")

}

}

if(comprobarVictoria()){
ganar()
}

}

function comprobarVictoria(){

for(let i=0;i<4;i++){

let d = document.getElementById("d"+i)

if(d.textContent === "*"){
return false
}

}

return true

}

function ganar(){

pararCrono()

mensaje.innerHTML =
"¡Has ganado!<br>" +
"Intentos usados: "+(7-intentos)+"<br>"+
"Intentos restantes: "+intentos

desactivarBotones()

}

function perder(){

pararCrono()

mensaje.innerHTML =
"Has perdido.<br>" +
"Clave secreta: "+clave.join("")

desactivarBotones()

}

function desactivarBotones(){

for(let i=0;i<=9;i++){
document.getElementById("num"+i).disabled = true
}

}

document.getElementById("reset").addEventListener("click", resetJuego)

function resetJuego(){

pararCrono()
reiniciarCrono()

clave = []
usados = []
intentos = 7
cronometroIniciado = false

mensaje.textContent = ""

intentosSpan.textContent = intentos

generarClave()

for(let i=0;i<4;i++){
let d = document.getElementById("d"+i)
d.textContent = "*"
d.classList.remove("acierto")
}

for(let i=0;i<=9;i++){
let btn = document.getElementById("num"+i)
btn.disabled = false
btn.classList.remove("usado")
}

}
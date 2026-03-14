// VARIABLES DEL JUEGO
let clave = []
let intentos = 7
let iniciado = false

// CRONÓMETRO
let tiempo = 0
let intervalo = null

const claveHTML = document.querySelectorAll(".digito")

// -------------------
// CRONÓMETRO
// -------------------

function start(){

if(intervalo === null){

intervalo = setInterval(function(){

tiempo++
document.getElementById("tiempo").textContent = tiempo

},1000)

}

}

function stop(){

clearInterval(intervalo)
intervalo = null

}

function resetCrono(){

stop()
tiempo = 0
document.getElementById("tiempo").textContent = tiempo

}

// -------------------
// GENERAR CLAVE
// -------------------

function generarClave(){

clave = []

while(clave.length < 4){

let n = Math.floor(Math.random()*10)

if(!clave.includes(n)){
clave.push(n)
}

}

}

// -------------------
// CREAR BOTONES
// -------------------

function crearBotones(){

const contenedor = document.getElementById("numeros")
contenedor.innerHTML=""

const orden=[1,2,3,4,5,6,7,8,9,0]

orden.forEach(num=>{

let btn=document.createElement("button")
btn.textContent=num

btn.onclick=function(){
pulsarNumero(num,btn)
}

contenedor.appendChild(btn)

})

}

// -------------------
// PULSAR NUMERO
// -------------------

function pulsarNumero(numero, boton){

if(!iniciado){
start()
iniciado = true
}

intentos--
document.getElementById("intentos").textContent = intentos

boton.disabled = true
boton.classList.add("usado")

if(clave.includes(numero)){

for(let i=0;i<clave.length;i++){

if(clave[i] === numero){

claveHTML[i].textContent = numero
claveHTML[i].classList.add("acierto")

}

}

}

comprobarFin()

}

// -------------------
// COMPROBAR FIN
// -------------------

function comprobarFin(){

let descubiertos = 0

claveHTML.forEach(d=>{
if(d.textContent !== "*") descubiertos++
})

if(descubiertos === 4){

stop()

document.getElementById("mensaje").textContent =
"¡Ganaste! Tiempo: "+tiempo+"s | Intentos usados: "+(7-intentos)+" | Restantes: "+intentos

}

if(intentos === 0){

stop()

claveHTML.forEach((d,i)=>{
d.textContent = clave[i]
})

document.getElementById("mensaje").textContent =
"Has perdido. La clave era "+clave.join("")

}

}

// -------------------
// RESET
// -------------------

function reset(){

resetCrono()

intentos = 7
iniciado = false

document.getElementById("intentos").textContent = intentos
document.getElementById("mensaje").textContent = ""

claveHTML.forEach(d=>{
d.textContent="*"
d.classList.remove("acierto")
})

generarClave()
crearBotones()

}

// INICIAR JUEGO
reset()
import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
query,
orderBy,
limit,
getDocs,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
query,
orderBy,
limit,
getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

apiKey: "TU_APIKEY",
authDomain: "TU_AUTHDOMAIN",
projectId: "TU_PROJECTID",
storageBucket: "TU_STORAGEBUCKET",
messagingSenderId: "TU_MESSAGING",
appId: "TU_APPID"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let jugador="";
let nivel=0;
let puntaje=0;

let inicioTiempo;
let timerGeneral;
let timerPregunta;

let segundosPregunta=15;

const insignias=[];

const preguntas=[

{
titulo:"🚨 Emergencia identificada",
avance:"20%",
insignia:"🏅 Primer Respondedor",

texto:"Observas una embarazada de término pujando en una plaza. ¿Cuál es la primera acción adecuada?",

correcta:0,

opciones:[
"Activar el 131",
"Llamar familiares",
"No intervenir",
"Grabar con el celular"
]
},

{
titulo:"📞 Coordinación de ayuda",
avance:"40%",
insignia:"🏅 Coordinador de Emergencia",

texto:"La mujer refiere pujos intensos. ¿Qué debes evaluar prioritariamente?",

correcta:0,

opciones:[
"Si el nacimiento parece inminente",
"Grupo sanguíneo",
"Peso pregestacional",
"Previsión"
]
},

{
titulo:"👶 Nacimiento",
avance:"60%",
insignia:"🏅 Asistente del Nacimiento",

texto:"El nacimiento es inminente y no existe traslado seguro. ¿Qué haces?",

correcta:1,

opciones:[
"Tirar del bebé",
"Favorecer la salida espontánea",
"Comprimir abdomen",
"Suspender pujos"
]
},

{
titulo:"🍼 Atención Neonatal",
avance:"80%",
insignia:"🏅 Protector Neonatal",

texto:"El recién nacido acaba de nacer. ¿Qué acción es prioritaria?",

correcta:0,

opciones:[
"Secar y mantener temperatura",
"Bañarlo",
"Separarlo de la madre",
"Pesarlo"
]
},

{
titulo:"🤱 Cuidados Postparto",
avance:"100%",
insignia:"🏅 Guardián Madre-Hijo",

texto:"Mientras llega la ambulancia debes vigilar:",

correcta:0,

opciones:[
"Sangrado materno y bienestar neonatal",
"Solo a la madre",
"Solo al bebé",
"Nada"
]
}

];

document.getElementById("btnIniciar")
.addEventListener("click", iniciarJuego);

function iniciarJuego(){

jugador=document.getElementById("nombre").value;

if(!jugador){
alert("Ingresa tu nombre");
return;
}

document.getElementById("inicio").classList.add("hidden");
document.getElementById("juego").classList.remove("hidden");

inicioTiempo=Date.now();

timerGeneral=setInterval(actualizarCronometro,1000);

mostrarPregunta();

}

function actualizarCronometro(){

const tiempo=Math.floor(
(Date.now()-inicioTiempo)/1000
);

let m=String(Math.floor(tiempo/60)).padStart(2,"0");
let s=String(tiempo%60).padStart(2,"0");

document.getElementById("cronometro").textContent=`${m}:${s}`;
}

function mostrarPregunta(){

const p=preguntas[nivel];

document.getElementById("etapa").textContent=p.titulo;
document.getElementById("avanceTexto").textContent=p.avance;
document.getElementById("barra").style.width=p.avance;
document.getElementById("pregunta").textContent=p.texto;

let html="";

p.opciones.forEach((opcion,i)=>{

html+=`
<button onclick="window.responder(${i})">
${opcion}
</button>
`;

});

document.getElementById("opciones").innerHTML=html;

segundosPregunta=15;

document.getElementById("tiempoPregunta").textContent=15;

clearInterval(timerPregunta);

timerPregunta=setInterval(()=>{

segundosPregunta--;

document.getElementById("tiempoPregunta").textContent=segundosPregunta;

if(segundosPregunta<=0){

clearInterval(timerPregunta);

window.responder(-1);

}

},1000);

}

window.responder=function(indice){

clearInterval(timerPregunta);

if(indice===preguntas[nivel].correcta){

puntaje+=100;

insignias.push(
preguntas[nivel].insignia
);

actualizarInsignias();

}

nivel++;

if(nivel<preguntas.length){
mostrarPregunta();
}
else{
finalizar();
}

}

function actualizarInsignias(){

let html="";

insignias.forEach(i=>{
html+=`<li>${i}</li>`;
});

document.getElementById("listaInsignias").innerHTML=html;

}

async function finalizar(){

clearInterval(timerGeneral);

const tiempo=Math.floor(
(Date.now()-inicioTiempo)/1000
);

const bonus=Math.max(
0,
300-tiempo
);

puntaje+=bonus;

await addDoc(
collection(db,"ranking"),
{
nombre:jugador,
puntaje,
tiempo,
fecha:new Date()
}
);

document.getElementById("juego").classList.add("hidden");
document.getElementById("final").classList.remove("hidden");

document.getElementById("resultado").innerHTML=`
<p><b>${jugador}</b></p>
<p>⭐ Puntaje: <b>${puntaje}</b></p>
<p>⏱️ Tiempo: <b>${tiempo} segundos</b></p>
`;

cargarRanking();

}

async function cargarRanking(){

const q=query(
collection(db,"ranking"),
orderBy("puntaje","desc"),
orderBy("tiempo","asc"),
limit(10)
);

const datos=await getDocs(q);

let html="";

datos.forEach(doc=>{

const d=doc.data();

html+=`
<li>
${d.nombre}
⭐ ${d.puntaje}
⏱️ ${d.tiempo}s
</li>
`;

});

document.getElementById("ranking").innerHTML=html;

}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SESSION = "MAGISTER_GAMIFICACION";

let nombre = "";
let nivel = 0;
let puntaje = 0;
let inicio;
let intervaloGeneral;
let intervaloPregunta;
let segundosPregunta = 15;

const insignias = [];

const preguntas = [

{
titulo:"🚨 Emergencia Identificada",
avance:"20%",
insignia:"🏅 Primer Respondedor",

texto:"Vas caminando por una plaza y observas a una mujer embarazada de término sentada en una banca. Presenta contracciones intensas, pujos involuntarios y manifiesta que siente que su bebé ya viene. ¿Cuál es la acción PRIORITARIA?",

correcta:1,

opciones:[
"Llamar a un familiar para que se haga cargo",
"Activar el sistema de emergencia (131)",
"Subirla inmediatamente a un vehículo particular",
"Esperar para observar la evolución"
]
},

{
titulo:"📞 Coordinación de Ayuda",
avance:"40%",
insignia:"🏅 Coordinador de Emergencia",

texto:"Mientras hablas con la central, la mujer refiere una necesidad irresistible de pujar. ¿Qué evaluación es más importante en este momento?",

correcta:2,

opciones:[
"Preguntar previsión de salud",
"Preguntar cuántos embarazos previos tiene",
"Evaluar si el nacimiento es inminente",
"Buscar su ficha clínica"
]
},

{
titulo:"👶 Nacimiento",
avance:"60%",
insignia:"🏅 Asistente del Nacimiento",

texto:"Compruebas que el nacimiento ocurrirá antes de que llegue la ambulancia. ¿Cuál es la conducta más adecuada?",

correcta:3,

opciones:[
"Intentar retrasar el parto",
"Aplicar presión abdominal para acelerar la salida",
"Traccionar suavemente la cabeza fetal",
"Favorecer la salida espontánea del recién nacido"
]
},

{
titulo:"🍼 Atención Neonatal",
avance:"80%",
insignia:"🏅 Protector Neonatal",

texto:"El recién nacido nace vigoroso y llora espontáneamente. Debido al ambiente exterior y la temperatura ambiental, ¿cuál es la prioridad inmediata?",

correcta:0,

opciones:[
"Secar cuidadosamente y prevenir la pérdida de calor",
"Realizar peso y talla",
"Separarlo de su madre para observarlo",
"Lavar al recién nacido"
]
},

{
titulo:"🤱 Cuidados Postparto",
avance:"100%",
insignia:"🏅 Guardián Madre-Hijo",

texto:"Mientras esperan la llegada del equipo de emergencia, ¿qué aspecto requiere vigilancia continua?",

correcta:1,

opciones:[
"El color de la ropa de la madre",
"El bienestar materno y neonatal, incluido el sangrado",
"La alimentación complementaria del recién nacido",
"Completar documentos clínicos"
]
}

];

document
.getElementById("btnIniciar")
.addEventListener("click", iniciarJuego);

function iniciarJuego(){

nombre =
document.getElementById("nombre").value;

if(!nombre){
alert("Ingresa tu nombre");
return;
}

document
.getElementById("inicio")
.classList.add("hidden");

document
.getElementById("juego")
.classList.remove("hidden");

inicio = Date.now();

intervaloGeneral =
setInterval(actualizarCronometro,1000);

mostrarPregunta();

}

function actualizarCronometro(){

const seg =
Math.floor(
(Date.now()-inicio)/1000
);

const m =
String(Math.floor(seg/60))
.padStart(2,"0");

const s =
String(seg%60)
.padStart(2,"0");

document
.getElementById("cronometro")
.innerText = `${m}:${s}`;

}

function mostrarPregunta(){

const etapa = etapas[nivel];

document
.getElementById("etapa")
.innerText = etapa.etapa;

document
.getElementById("avance")
.innerText = etapa.avance;

document
.getElementById("barra")
.style.width = etapa.avance;

document
.getElementById("pregunta")
.innerText = etapa.pregunta;

let html="";

etapa.opciones.forEach((op,i)=>{

html += `
<button onclick="responder(${i})">
${op}
</button>
`;

});

document
.getElementById("opciones")
.innerHTML = html;

segundosPregunta = 15;

document
.getElementById("tiempoPregunta")
.innerText = segundosPregunta;

clearInterval(intervaloPregunta);

intervaloPregunta =
setInterval(()=>{

segundosPregunta--;

document
.getElementById("tiempoPregunta")
.innerText = segundosPregunta;

if(segundosPregunta<=0){

clearInterval(intervaloPregunta);

responder(-1);

}

},1000);

}

window.responder = function(indice){

clearInterval(intervaloPregunta);

if(indice === etapas[nivel].correcta){

puntaje += 100;

insignias.push(
etapas[nivel].insignia
);

actualizarInsignias();

}

nivel++;

if(nivel < etapas.length){

mostrarPregunta();

}
else{

finalizar();

}

}

function actualizarInsignias(){

let html="";

insignias.forEach(i=>{
html += `<li>${i}</li>`;
});

document
.getElementById("listaInsignias")
.innerHTML = html;

}

async function finalizar(){

clearInterval(intervaloGeneral);

const tiempo =
Math.floor(
(Date.now()-inicio)/1000
);

const bonus =
Math.max(0,300-tiempo);

puntaje += bonus;

await addDoc(
collection(db,"ranking"),
{
nombre,
puntaje,
tiempo,
session:SESSION,
fecha:new Date()
}
);

document
.getElementById("juego")
.classList.add("hidden");

document
.getElementById("final")
.classList.remove("hidden");

document
.getElementById("resultado")
.innerHTML=`

👤 <b>${nombre}</b><br><br>

⭐ Puntaje: <b>${puntaje}</b><br>

⏱️ Tiempo: <b>${tiempo}s</b><br><br>

🏅 Insignias obtenidas: ${insignias.length}

`;

cargarRanking();

}

async function cargarRanking(){

const q = query(
collection(db,"ranking"),
orderBy("puntaje","desc"),
orderBy("tiempo","asc"),
limit(10)
);

const snapshot =
await getDocs(q);

let html="";

snapshot.forEach(doc=>{

const d=doc.data();

html += `
<li>
${d.nombre}
 | ⭐ ${d.puntaje}
 | ⏱️ ${d.tiempo}s
</li>
`;

});

document
.getElementById("ranking")
.innerHTML = html;

}

onSnapshot(
collection(db,"ranking"),
(snapshot)=>{

let total=0;

snapshot.forEach(()=>{
total++;
});

document
.getElementById("participantes")
.innerText = total;
document
.getElementById("finalizados")
.innerText = total;

});

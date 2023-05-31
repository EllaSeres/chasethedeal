import GameClient from './GameClient.js';
import { MapColliders } from '#lib/game.js';
import { playAudio, stopAudio } from './sound.js';

let movement = {
  dx: 0,
  dy: 0
};

const q = new URLSearchParams(window.location.search);
const roomName = q.get("name");
const playerKind = q.get("kind");
if(!roomName || !playerKind) {
  alert("Invalid URL");
  throw new Exception("Invalid URL");
}
const gameClient = new GameClient(roomName, playerKind);
gameClient.waitForConnect();
console.log("Connected");

const canvas = document.querySelector('canvas');
canvas.width = 800;
canvas.height = 600;

var score = 0;
var gameisActive = true;
const c = canvas.getContext('2d');
const backgroundImage = new Image();
backgroundImage.onload = function () {
  c.drawImage(backgroundImage, 0, 0)}
backgroundImage.src = "./harta.svg";

window.addEventListener("keydown", async (e) => {
    e.preventDefault();

    switch(e.key) {
  case "w":
    movement.dy = -1;
    break;
  case "s":
    movement.dy = 1;
    break;
  case "a":
    movement.dx = -1;
    break;
  case "d":
    movement.dx = 1;
    break;

  case "b":
    if(playerKind == 'chaser') {
      gameClient.roadblock();
    }
    break;
    }
});

window.addEventListener("keyup", async (e) => {
  e.preventDefault();

    switch(e.key) {
  case "w":
  case "s":
    movement.dy = 0;
    break;
  case "a":
  case "d":
    movement.dx = 0;
    break;
    }
});

let last = Date.now();
playAudio("sound/gameMusic_full.ogg", true);
function gameTick() {
  requestAnimationFrame(gameTick);
  const now = Date.now();
  const dt = (now - last) / 1000;
  last = now;

  if(movement.dx != 0 || movement.dy != 0) {
    // do move both locally as well as informing the server
    gameClient.move(movement.dx * dt, movement.dy * dt);
  }

  // Draw :)
  c.clearRect(0,0,c.width,c.height);
  c.drawImage(backgroundImage,0,0,canvas.width,canvas.height);

  for(let obj in gameClient.objects) {
    gameClient.objects[obj].draw(c);
  }
}

gameTick();

import GameClient from './GameClient.js';
import { MapColliders } from '#lib/game.js';

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


/*var p1 = {
  width: 10,
  height: 10,
  directionY: 0,
  directionX: 0,
  speed:1.5,
  x : 1,
  y : 1
}

var p2 = {
  width: 10,
  height: 10,
  directionY: 0,
  directionX: 0,
  speed:1,
  x : 200,
  y : 1
}

var leaf = {
  width:10,
  height:10,
  x:450,
  y:224
}

var roadblock = {
  height:40,
  width:40,
  x:1000,
  y:1000
}

function controlKeydown(event){
    if (event.defaultPrevented) {
      return
    }
    switch (event.key) {
      case "w":
        p1.directionY = -1
      break
      case "s":
        p1.directionY = 1
      break
      case "a":
        p1.directionX = -1
      break
      case "d":
        p1.directionX = 1
      break
      case "i":
        p2.directionY = -1
      break
      case "k":
        p2.directionY = 1
      break
      case "j":
        p2.directionX = -1
      break
      case "l":
        p2.directionX = 1
      break
      case "b":
        roadblock.x = p2.x;
        roadblock.y = p2.y;
      default:
        return
    }
    event.preventDefault();
  }

  function controlKeyup(event){
    if (event.defaultPrevented) {
      return
    }
    switch (event.key) {
      case "w":
      case "s":
        p1.directionY = 0
      break
      case "a":
      case "d":
        p1.directionX = 0
      break
      case "i":
      case "k":
        p2.directionY = 0
      break
      case "j":
      case "l":
        p2.directionX = 0
      break
      default:
        return
    }
    event.preventDefault()
  }
  window.addEventListener("keydown", function (event) {
    controlKeydown(event)
  }, true)
  window.addEventListener("keyup", function (event) {
    controlKeyup(event)
  }, true)

   

function animate() {
  requestAnimationFrame(animate)
  if(gameisActive){
    
    c.clearRect(0,0,c.width,c.height);
    c.drawImage(backgroundImage,0,0,canvas.width,canvas.height);

    // Change this for the leaf use code above to load image
    c.fillStyle = '#00ff00'
    c.fillRect(leaf.x,leaf.y,leaf.width,leaf.height);
    c.fillStyle = '#ffffff'
    c.fillRect(roadblock.x,roadblock.y,20,20);
    //Collision between p1 and leafs
    if(checkCollisionLeaf(p1)){
      var ind = Math.round(Math.random()*10);
      leaf.x = leaf_pos[ind].x;
      leaf.y = leaf_pos[ind].y;
      score++;
    }
    // Collision P1 with map objs
    if(checkCollision(p1,map_objects) && !checkCollisionRB(p1)){
      // Change this for the P1 use code above to load image
      c.fillStyle = '#ff0000'
      c.fillRect(p1.x,p1.y,p1.width,p1.height);
      p1.x = p1.x + p1.directionX*p1.speed;
      p1.y = p1.y + p1.directionY*p1.speed;
    }
    else{
      // Can be removed was used for debugging
        c.fillStyle = '#0000ff'
        c.fillRect(p1.x,p1.y,p1.width,p1.height);
    }
    // Collision P2 with map objs
    if(checkCollision(p2,map_objects)){
      // Change this for the P2 use code above to load image
      c.fillStyle = '#0000ff'
      c.fillRect(p2.x,p2.y,p2.width,p2.height);
      p2.x = p2.x + p2.directionX*p2.speed;
      p2.y = p2.y + p2.directionY*p2.speed;
    }
    else{
      //Used for debugging
        c.fillStyle = '#00ffff'
        c.fillRect(p2.x,p2.y,p2.width,p2.height);
    }
    // Collision between p1 and p2
    if(checkCollisionP2(p1)){
        gameisActive = false;
    }

    
  }

}
animate();
*/
"use strict";

const chaserImage = '/donut.png';
const runnerImage = '/glasses.png';
const leafImage = '/leaf.png';
const roadblockImage = '/roadblock.png';

export class Collider {
	x; y; width; height;
	constructor({ x, y, width, height }) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	collidesWith({ x, y, width, height }) {
		return	(x + width >= this.x) &&
				(x <= this.x + this.width) &&
				(y + height >= this.y) &&
				(y <= this.y + this.height);
	}
}

export const MapColliders = [
	new Collider({x:19,  y:49,   width:417,      height:59}),
	new Collider({x:19,  y:108,  width:71,       height:108}),
	new Collider({x:102, y:125,  width:183-102,  height:216-125}),
	new Collider({x:196, y:108,  width:284-196,  height:216-108}),
	new Collider({x:303, y:126,  width:383-303,  height:216-126}),
	new Collider({x:397, y:108,  width:436-397,  height:220-108}),
	new Collider({x:22,  y:236,  width:190-22,   height:292-236}),
	new Collider({x:202, y:238,  width:284-202,  height:295-238}),
	new Collider({x:303, y:238,  width:380-303,  height:383-238}),
	new Collider({x:380, y:311,  width:400-380,  height:383-311}),
	new Collider({x:400, y:238,  width:439-400,  height:383-238}),
	new Collider({x:106, y:292,  width:190-106,  height:316-292}),
	new Collider({x:106, y:316,  width:284-106,  height:383-316}),
	new Collider({x:19,  y:311,  width:90-19,    height:383-311}),
	new Collider({x:19,  y:401,  width:85-19,    height:513-401}),
	new Collider({x:106, y:401,  width:186-106,  height:492-401}),
	new Collider({x:204, y:401,  width:279-204,  height:513-401}),
	new Collider({x:303, y:401,  width:385-303,  height:494-401}),
	new Collider({x:409, y:401,  width:437-409,  height:513-401}),
	new Collider({x:19,  y:513,  width:437-19,   height:567-513}),
	new Collider({x:471, y:50,   width:549-471,  height:216-50}),
	new Collider({x:572, y:50,   width:637-572,  height:120-50}),
	new Collider({x:596, y:120,  width:614-596,  height:137-120}),
	new Collider({x:654, y:50,   width:781-654,  height:120-50}),
	new Collider({x:713, y:120,  width:768-713,  height:137-120}),
	new Collider({x:668, y:137,  width:781-668,  height:219-137}),
	new Collider({x:572, y:137,  width:654-572,  height:216-137}),
	new Collider({x:471, y:236,  width:592-471,  height:307-236}),
	new Collider({x:614, y:234,  width:694-614,  height:424-234}),
	new Collider({x:711, y:237,  width:781-711,  height:427-237}),
	new Collider({x:471, y:323,  width:593-471,  height:427-323}),
	new Collider({x:471, y:442,  width:642-471,  height:571-442}),
	new Collider({x:660, y:444,  width:781-660,  height:567-444})
];

export class GameObject {
	x; y; width; height; speed; name;
	sprite;

	constructor({ name, x, y }) {
		const classes = {
			chaser:    { width: 10, height: 10, speed: 120, spriteSrc: chaserImage },
			runner:    { width: 10, height: 10, speed: 150, spriteSrc: runnerImage },
			leaf:      { width: 10, height: 10, speed: 0,   spriteSrc: leafImage },
			roadblock: { width: 80, height: 80, speed: 0, spriteSrc: roadblockImage }
		};

		this.x = x;
		this.y = y;
		this.name = name;

		if(name in classes) {
			this.width = classes[name].width;
			this.height = classes[name].height;
			this.speed = classes[name].speed;

			if(globalThis.Image) {
				this.sprite = new Image();
				this.sprite.src = classes[name].spriteSrc;
				this.sprite.onload = console.log("LOADED!");
			}
		}
	}

	draw(ctx) {
		ctx.fillStyle = '#f0f';
		const scale = this.name == 'roadblock' ? 1 : 2;
		ctx.drawImage(this.sprite, this.x - this.width/2*scale, this.y - this.height/2*scale, this.width*scale, this.height*scale);
	}

	getCollider() {
		return new Collider({
			x: this.x - this.width / 2,
			y: this.y - this.height / 2,
			width: this.width,
			height: this.height
		});
	}

	canMove(dx, dy, world = MapColliders) {
		const nc = this.getCollider();
		nc.x += dx; nc.y += dy;

		if(nc.x < 0 || nc.y < 0 || nc.x + nc.width > 800 || nc.y + nc.height > 600) {
			// world bounds
			return false;
		}

		return world.every(collider => !collider.collidesWith(nc));
	}

	toJSON() {
		return {
			x: this.x,
			y: this.y,
			name: this.name
		};
	}
}

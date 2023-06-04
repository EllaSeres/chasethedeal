'use strict';

import expressWs from 'express-ws';
import { GameObject, MapColliders } from '#lib/game.js';
import { User } from './database.js';

const games = {};

const LeafPositions = [
    {x:386, y:294},
    {x:337, y:112},
    {x:194, y:300},
    {x:6,   y:281},
    {x:597, y:426},
    {x:90,  y:478},
    {x:400, y:500},
    {x:747, y:577},
    {x:698, y:238},
    {x:700, y:124},
    {x:749, y:24},
    {x:581, y:123},
    {x:450, y:229}
];

class Game {
    wsHost = null;
    wsGuest = null;
    name = null;
    running = false;

    // players, leaves, roadblocks
    objects = {
        roadblock: new GameObject({name: 'roadblock', x: -100, y: -100}),
        leaf: new GameObject({name: 'leaf', x: -100, y: -100})
    };

    constructor(ws, name, playerKind, username) {
        this.name = name;
        this.running = false;
        console.log('Game started by host:', name, 'as', playerKind);

        setTimeout(() => this.respawnLeaf(), 0);

        const hostPlayer = this.addPlayer(ws, playerKind);
        this.wsHost = ws;
        this.hostPlayer = hostPlayer;
        this.hostPlayer.username = username;
        this.gamelogic(ws, hostPlayer);
    }

    addPlayer(ws, kind) {
        if(kind !== 'runner' && kind !== 'chaser') {
            console.log('Invalid player kind');
            ws.send(JSON.stringify({
                error: 'Invalid player kind'
            }));
            return;
        }

        if(kind == 'runner' && this.objects.runner) {
            console.log('There\'s already a runner in the game');
            ws.send(JSON.stringify({
                error: 'There\'s already a runner in the game'
            }));
            return;
        }

        if(kind == 'chaser' && this.objects.chaser) {
            console.log('There\'s already a chaser in the game');
            ws.send(JSON.stringify({
                error: 'There\'s already a chaser in the game'
            }));
            return;
        }

        // Process a player having chosen a class
        const player = new GameObject({
            x: kind == 'chaser' ? 10 : 790,
            y: kind == 'chaser' ? 10 : 590,
            name: kind
        });
        player.username = '';
        player.score = 0;
        this.objects[kind] = player;
        this.broadcast({
            type: 'addObject',
            name: kind,
            x: player.x,
            y: player.y
        });
        return player;
    }

    addGuest(ws, kind, username) {
        if(this.wsGuest) {
            console.log('Game full')
            ws.send(JSON.stringify({'error': 'Game already has 2 players'}));
            return;
        }

        const guestPlayer = this.addPlayer(ws, kind);
        if(!guestPlayer) {
            return;
        }
        this.wsGuest = ws;
        this.guestPlayer = guestPlayer;
        console.log("a!");
        this.guestPlayer.username = username;
        console.log("b!");
        this.running = true;
        console.log("RUNNING!");
        this.gamelogic(ws, guestPlayer);
    }

    broadcast(message) {
        if(this.wsGuest) this.wsGuest.send(JSON.stringify(message));
        if(this.wsHost)  this.wsHost.send(JSON.stringify(message));
    }

    gamelogic(ws, player) {
        for(let objname of Object.keys(this.objects)) {
            if(!(objname in this.objects)) continue;
            if(!('toJSON' in this.objects[objname])) continue;
            ws.send(JSON.stringify({
                type: 'addObject',
                ...(this.objects[objname].toJSON())
            }));
        }

        ws.on('message', message => {
            if(!this.running) {
                console.log("Not running yet");
                return;
            }

            const data = JSON.parse(message);

            switch(data.type) {
            case 'move': { // {type: 'move', newx: 123, newy: 234}
                const { newx, newy } = data;
                const dx = newx - player.x, dy = newy - player.y;

                const canMove = player.canMove(dx, dy) &&
                    (player.name == 'chaser' || player.canMove(dx, dy, [this.objects.roadblock.getCollider()]))

                if(canMove) {
                    player.x = newx;
                    player.y = newy;

                    // Only send move to other player
                    const otherWs = ws == this.wsHost ? this.wsGuest : this.wsHost;
                    otherWs.send(JSON.stringify({
                        type: 'updateObject',
                        name: player.name,
                        x: player.x,
                        y: player.y
                    }));
                }

                const mustForceMove = player.x < 0 || player.y < 0 || player.x > 800 || player.y > 600;

                if(mustForceMove) {
                    if(player.x < 0) player.x = 1;
                    if(player.x > 800) player.x = 799;
                    if(player.y < 0) player.y = 1;
                    if(player.y > 600) player.y = 599;
                }

                if(!canMove || mustForceMove) {
                    this.broadcast({
                        type: 'updateObject',
                        name: player.name,
                        x: player.x,
                        y: player.y
                    });
                }

                if(player.name == 'runner' && player.getCollider().collidesWith(this.objects.leaf.getCollider())) {

                    player.score++;
                    this.broadcast({
                        type:'updateObject',
                        name: player.name,
                        score: player.score
                    });

                    if(player.score == 10) { // CHANGE THIS TO BALANCE GAME
                        this.gameOver('runner');
                    }

                    this.respawnLeaf();
                }

                if(player.name == 'chaser' && player.getCollider().collidesWith(this.objects.runner.getCollider())) {
                    player.score++;
                    this.broadcast({
                        type:'updateObject',
                        name: player.name,
                        score: player.score
                    });

                    this.gameOver('chaser');
                }

                break;
            }

            case 'roadblock': {
                if(player.name != 'chaser') break;

                const rb = this.objects.roadblock;
                rb.x = player.x;
                rb.y = player.y;
                this.broadcast({
                    type: 'updateObject',
                    name: rb.name,
                    x: rb.x,
                    y: rb.y
                });
                break;
            }
            }
        });

        ws.on('disconnect', () => {
            console.log('Disconnection in game', this.name)
            delete games[this.name];
        });
    }

    respawnLeaf() {
        if(this.leafTimeout) {
            clearTimeout(this.leafTimeout);
            this.leafTimeout = null;
        }

        while(true) {
            const idx = (Math.random() * LeafPositions.length) | 0;
            const { x, y } = LeafPositions[idx];
            if(Math.abs(this.objects.leaf.x - x) < 1 && Math.abs(this.objects.leaf.y - y) < 1) continue;

            this.objects.leaf.x = x;
            this.objects.leaf.y = y;
            this.broadcast({
                type: 'updateObject',
                name: 'leaf',
                x, y
            });
            break;
        }

        this.leafTimeout = setTimeout(() => this.respawnLeaf(), 30000); // respawn after 30s
    }

    async gameOver(winner) {
        this.running = false;

        this.broadcast({
            type: 'gameOver',
            winner: winner
        });

        this.wsGuest && this.wsGuest.close();
        this.wsHost && this.wsHost.close();

        if(winner == 'chaser') {
            // Chaser wins
            const user = await User.findByPk(
                this.hostPlayer.name == 'chaser' ? 
                this.hostPlayer.username :
                this.guestPlayer.username
            );
            console.log(user);

            user.winsChaser++;
            user.save();
        } else {
            // Runner wins
            const user = await User.findByPk(
                this.hostPlayer.name == 'runner' ? 
                this.hostPlayer.username :
                this.guestPlayer.username
            );
            console.log(user);

            user.winsRunner++;
            user.save();
        }
    }
}

export default function(app) {
    expressWs(app);

    console.log('Game logic loaded :)');

    app.ws('/game', (ws, req) => {
        const { peer, kind, username } = req.query;
        if(!peer || !kind || !username) {
            ws.close();
            console.log('Bad req');
            return;
        }

        if(games[peer]) {
            console.log('Adding guest to game', peer);
            games[peer].addGuest(ws, kind, username);
        } else {
            console.log('Creating game', peer);
            games[peer] = new Game(ws, peer, kind, username);
        }
        console.log('GAMES:', Object.keys(games))
    });
}

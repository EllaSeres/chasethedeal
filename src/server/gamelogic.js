'use strict';

import expressWs from 'express-ws';

const games = {};

class Player {
    ws; x; y; score; game; kind;

    constructor(ws, x, y, game) {
        this.ws = ws;
        this.x = x;
        this.y = y;
        this.score = 0;
        this.game = game;
    }

    init(kind) {
        console.log('Creating the', kind, 'player');
        this.kind = kind;
    }

    move(newx, newy) {
        // TODO: Check if this is a legal move
        // TODO: Check if this move means the chaser wins or the runner gets more score
        this.x = newx;
        this.y = newy;
    }
}

class Game {
    wsHost = null;
    wsGuest = null;
    name = null;

    // players, leaves, roadblocks
    objects = new Map();

    constructor(ws, name) {
        this.wsHost = ws;
        this.name = name;
        console.log('Game started by host:', name);

        this.gamelogic(ws);

        this.interval = setInterval(() => this.gameTick(), 100);
    }

    addGuest(ws) {
        console.log('Adding guest');
        if(this.wsGuest) {
            ws.send(JSON.stringify({'error': 'Game already has players'}));
            return;
        } else {
            this.wsGuest = ws;
        }

        this.gamelogic(ws);
    }

    broadcast(message) {
        if(this.wsGuest) this.wsGuest.send(JSON.stringify(message));
        if(this.wsHost)  this.wsHost.send(JSON.stringify(message));
    }

    gameTick() {
        // Runs 10 times a second, use it, for example, TODO:
        // - set scores
        // - spawn new leaves
        // Don't use it to:
        // - Compute player movements (that should be handled in Player.move)
        // - Create player objects (done when handling "init" events)
    }

    gamelogic(ws) {
        const player = new Player(ws, 0, 0, this);

        // Send this player a list of all current objects
        for(let name of Object.keys(this.objects)) {
            ws.send(JSON.stringify({
                type: 'addObject',
                name: name,
                x: this.objects[name].x,
                y: this.objects[name].y
            }));
        }

        ws.on('message', message => {
            const data = JSON.parse(message);

            switch(data.type) {
            case 'init':
                if(data.kind !== 'runner' && data.kind !== 'chaser') {
                    ws.send(JSON.stringify({
                        type: 'init',
                        error: 'Invalid player kind'
                    }));
                    return;
                }

                if(data.kind == 'runner' && this.objects.runner) {
                    ws.send(JSON.stringify({
                        type: 'init',
                        error: 'There\'s already a runner in the game'
                    }));
                    return;
                }

                if(data.kind == 'chaser' && this.objects.chaser) {
                    ws.send(JSON.stringify({
                        type: 'init',
                        error: 'There\'s already a chaser in the game'
                    }));
                    return;
                }

                // Process a player having chosen a class
                player.init(data.kind);
                this.addObject(player.kind, player);

                break;

            case 'move': { // {type: 'move', newx: 123, newy: 234}
                const { newx, newy } = data;

                player.move(newx, newy); // This function checks if the move is legal and applies it to the player object accordingly
                this.updateObject(player.kind);

                break;
            }
            }
        });

        ws.on('disconnect', () => {
            clearInterval(this.interval);
            delete games[this.name];
        });
    }

    addObject(name, value) {
        this.objects[name] = value;
        this.broadcast({
            type: 'addObject',
            name: name,
            x: value.x,
            y: value.y
        });
    }

    updateObject(name) {
        this.broadcast({
            type: 'updateObject',
            name: name,
            x: this.objects[name].x,
            y: this.objects[name].y
        });
    }
}

export default function(app) {
    expressWs(app);

    console.log('Game logic loaded:)');

    app.ws('/game', (ws, req) => {
        const { name } = req.query;
        if(!name) {
            ws.close();
            return;
        }

        if(games[name]) {
            console.log('Guest added');
            games[name].addGuest(ws);
        } else {
            console.log('Game created');
            games[name] = new Game(ws, name);
        }
    });
}

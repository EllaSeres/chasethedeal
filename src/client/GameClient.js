'use strict';

import { GameObject, MapColliders } from '#lib/game.js';

export default class GameClient {
    ws;
    objects = [];
    playableObject = null;

    constructor(peer, playerKind) {
        this.ws = new WebSocket('ws://' + import.meta.env.VITE_API_BASE + '/game?peer=' + encodeURIComponent(peer) + '&kind=' + encodeURIComponent(playerKind) + '&username=' + encodeURIComponent(localStorage.whoami));
        this.playableObject = playerKind;

        window.addEventListener('beforeunload', e => {
            ws.close();
        });

        this.ws.addEventListener('message', e => {
            const data = JSON.parse(e.data);
            console.log(data);
            this.received(data);
        });
    }

    waitForConnect() {
        return new Promise(resolve => this.ws.addEventListener('open', resolve));
    }

    send(msg) {
        this.ws.send(JSON.stringify(msg));
    }

    received(msg) {
        if(msg.error) {
            alert(msg.error);
            this.ws.close();
            return;
        }

        switch(msg.type) {
        case 'addObject':
            this.objects[msg.name] = new GameObject({
                x: msg.x,
                y: msg.y,
                name: msg.name
            });
            break;
        case 'updateObject':
            for(let prop in msg) {
                if(prop == 'type') continue;
                this.objects[msg.name][prop] = msg[prop];
            }
            break;

        case 'gameOver':
            if(msg.winner == this.playableObject) {
                // Win
                window.location = '/scoreboard.html?status=You+win';
            } else {
                // Lose
                window.location = '/scoreboard.html?status=You+lose';
            }
            break;
        }
    }

    move(dx, dy) {
        const player = this.objects[this.playableObject];
        if(!player) return;

        dx *= player.speed;
        dy *= player.speed;
        if(!player.canMove(dx | 0, dy | 0) ||
            (player.name == 'runner' && !player.canMove(dx | 0, dy | 0, [this.objects.roadblock.getCollider()])))
            return;

        // Update player in local representation
        player.x = (player.x + dx) | 0;
        player.y = (player.y + dy) | 0;

        // Update player in remote representation
        this.send({
            type: 'move',
            newx: player.x,
            newy: player.y
        });
    }

    roadblock() {
        this.send({type: 'roadblock'})
    }
}
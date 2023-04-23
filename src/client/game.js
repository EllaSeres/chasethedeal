'use strict';

export default class Game {
    ws;
    objects = [];
    player = null;

    constructor(name) {
        this.ws = new WebSocket('ws://' + import.meta.env.VITE_API_BASE + '/game?name=' + encodeURIComponent(name));

        this.ws.addEventListener('message', e => {
            const data = JSON.parse(e.data);
            console.log(data);
            this.received(data);
        });
    }

    waitForConnect() {
        return new Promise(resolve => this.ws.addEventListener('open', resolve));
    }

    setKind(kind) {
        switch (kind) {
        default:
            throw new Error('Invalid player kind');
        case 'runner':
        case 'chaser':
            this.player = kind;
            this.send({type: 'init', kind});
            break;
        }
    }

    send(msg) {
        this.ws.send(JSON.stringify(msg));
    }

    received(msg) {
        if(msg.error) {
            if(msg.type === 'init') this.player = null;
            alert(msg.error);
            return;
        }

        switch(msg.type) {
        case 'addObject':
            this.objects[msg.name] = {
                x: msg.x,
                y: msg.y
            };
            break;
        case 'updateObject':
            this.objects[msg.name].x = msg.x;
            this.objects[msg.name].y = msg.y;
            break;
        // TOOD: more server->client messages such as leaves spawining/being collected :)
        }
    }

    move(dx, dy) {
        this.objects[this.player].x += dx;
        this.objects[this.player].y += dy;
        this.send({
            type: 'move',
            newx: this.objects[this.player].x,
            newy: this.objects[this.player].y
        });
    }
}

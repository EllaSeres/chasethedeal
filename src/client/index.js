console.log('Hello, world! Use src/client/index.js as a starting point for your frontend scripting.');

const ws = new WebSocket('ws://localhost:8430/game?peer=joculets');

ws.addEventListener('open', () => {
    ws.addEventListener('message', e => {
        document.querySelector('#log').innerHTML += '\n' + e.data;
    });
});

document.getElementById('chaserBtn').addEventListener('click', () => {
    ws.send(JSON.stringify({
        type: 'init',
        kind: 'chaser'
    }));
});

document.getElementById('runnerBtn').addEventListener('click', () => {
    ws.send(JSON.stringify({
        type: 'init',
        kind: 'runner'
    }));
});

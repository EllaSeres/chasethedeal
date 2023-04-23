import Game from './game.js';

console.log(import.meta.env);

console.log('Hello, world! Use src/client/index.js as a starting point for your frontend scripting.');

function setScreen(screen) {
    document.querySelector('#container').classList = ['current-screen-' + screen];

    if(screen === 'game') {
        startGame();
    }
}

document.querySelectorAll('[data-toscreen]').forEach(el => {
    el.addEventListener('click', () => {
        setScreen(el.dataset.toscreen);
    });
});

// Keyboard input
const keys = new Set();
const keymap = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};
window.addEventListener('keydown', e => {
    keys.add(e.keyCode);
    if(keymap[e.keyCode])
        keys.add(keymap[e.keyCode]);
});
window.addEventListener('keyup', e => {
    keys.delete(e.keyCode);
    if(keymap[e.keyCode])
        keys.delete(keymap[e.keyCode]);
});

async function startGame() {
    const game = new Game(prompt('Name of room?'));
    await game.waitForConnect();

    console.log(game);

    game.setKind(prompt('What do you want to play as? (chaser/runner)'));

    setInterval(() => { // client game tick
        // Re-draw objects
        Object.entries(game.objects).forEach(([name, value]) => {
            let el = document.querySelector('#game-object-' + name);
            if(!el) {
                el = document.createElement('div');
                el.id = 'game-object-' + name;
                el.classList = ['game-object'];
                document.querySelector('#gamearea').appendChild(el);
            }

            el.style.top = value.y + 'px';
            el.style.left = value.x + 'px';
        });
        // TODO: remove deleted objects

        // Compute movement :)
        const speed = 1;
        const dx = speed * (keys.has('right') - keys.has('left'));
        const dy = speed * (keys.has('down') - keys.has('up'));
        game.move(dx, dy);

    }, 1000 / 60);
}

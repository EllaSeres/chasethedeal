console.log('Hello, world! Use src/client/index.js as a starting point for your frontend scripting.');

function setScreen(screen) {
    document.querySelector('#container').classList = ['current-screen-' + screen];
}

document.querySelectorAll('[data-toscreen]').forEach(el => {
    el.addEventListener('click', () => {
        setScreen(el.dataset.toscreen);
    });
});

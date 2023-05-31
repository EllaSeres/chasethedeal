import { login, signup } from './auth.js';

const $ = document.querySelector.bind(document),
    $$ = document.querySelectorAll.bind(document);

function setScreen(screen) {
    document.querySelector('#container').classList = ['current-screen-' + screen];
}

$$('[data-toscreen]').forEach(el => {
    el.addEventListener('click', () => {
        setScreen(el.dataset.toscreen);
    });
});

$('#login').addEventListener('submit', async e => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
        await login(username, password);

        setScreen('code');
    } catch(e) {
        setScreen('login');
    }
});

$('#signup').addEventListener('submit', async e => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    alert('Signup with ' + username + ' : ' + password);

    try {
        await signup(username, password);
        await login(username, password);

        setScreen('code');
    } catch(e) {
        setScreen('login');
    }
});

$('#selectDealer').addEventListener('click', () => {
    $('#currentKind').src = 'dealer.svg';
    $('#currentKind').alt = 'dealer';
    $('#kindSlider').classList.add('selected-left');
    $('#kindSlider').classList.remove('selected-right');
});

$('#selectCop').addEventListener('click', () => {
    $('#currentKind').src = 'cop.svg';
    $('#currentKind').alt = 'cop';
    $('#kindSlider').classList.remove('selected-left');
    $('#kindSlider').classList.add('selected-right');
});

$('#playBtn').addEventListener('click', () => {
    const code = $('#codeInput').value;
    alert($('#kindSlider').classList);
    const kind = $('#kindSlider').classList.contains('selected-right') ? 'chaser' : 'runner';
    window.location = `/game.html?name=${encodeURIComponent(code)}&kind=${encodeURIComponent(kind)}`;
});

$('#clicketyclack').addEventListener('click', () => {
    $('#clicketyclack').style.left = '-100000000px';

    playAudio('sound/menuMusic_full.ogg', true);
});

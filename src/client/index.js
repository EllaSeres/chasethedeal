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
    
    //alert('Login with ' + username + ' : ' + password);

    //console.log(await login(username, password));

    //setScreen('game');
});

$('#signup').addEventListener('submit', async e => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    //alert('Signup with ' + username + ' : ' + password);

    //signup(username, password);
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
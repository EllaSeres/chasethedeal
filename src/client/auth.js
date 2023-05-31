'use strict';

import api from './api.js';

export function whoami() {
    return localStorage.whoami;
}

export async function login(username, password) {
    const res = await api('POST', '/login', { username, password });
    localStorage.whoami = username;
    return res;
}

export async function logout() {
    delete localStorage.whoami;
    return await api('POST', '/logout');
}

export async function signup(username, password) {
    return await api('POST', '/users', { username, password });
}

export async function scoreboard() {
    return await (await api('GET', '/users')).json();
}

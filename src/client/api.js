'use strict';

export default async function api(method, path, body) {
    const r = await fetch(import.meta.env.VITE_API_BASE + path, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: body && JSON.stringify(body)
    });
    const data = await r.json();

    if(data.error) {
        let errorClass = Error;
        // TODO: change error class depending on HTTP error code
        throw new errorClass(data.error);
    }

    return data;
}

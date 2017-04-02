export default function post(url) {
    const options = {
        method: 'POST'
    }
    return fetch(url, options).then(response => response);
}
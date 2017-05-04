export default function put(url, data) {
    const options = {
        method: 'PUT'
    }
    if (data) {
        options.body = JSON.stringify(data);
    }
    return fetch(url, options).then(response => response);
}
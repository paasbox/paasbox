
function request(method, uri, body) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method
        };

        if (method === "POST" || method === "PUT") {
            options.body = JSON.stringify(body || {});
        }

        fetch(uri, options).then(response => {
            if (!response.ok) {
                reject("Unexpected status code: " + json.status);
                return;
            }
            if (method === "POST" || method === "PUT") {
                resolve();
                return;
            }
            try {
                return response.json();
            } catch (error) {
                console.error("Error parsing response to JSON", error);
                reject();
            }
        }).then(json => {
            resolve(json);
        });
    });
}

export default class http {
    static get(uri) {
        return request("GET", uri, null);
    }

    static post(uri, body) {
        return request("POST", uri, body);
    }
}
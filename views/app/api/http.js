
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
                reject("Unexpected status code: " + response.status);
                return;
            }
            if (method === "POST" || method === "PUT") {
                resolve();
                return;
            }

            const contentType = response.headers.get("content-type");
            if (contentType.includes('application/json')) {
                try {
                    return response.json();
                } catch (error) {
                    console.error("Error parsing response to JSON", error);
                    reject();
                    return {};
                }
            }

            if (contentType.includes('text/html') || contentType.includes('text/plain')) {
                try {
                    return response.text();
                } catch (error) {
                    console.error("Error parsing text/HTML response", error);
                    reject();
                    return "";
                }
            }
        }).then(parsedResponse => {
            resolve(parsedResponse);
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
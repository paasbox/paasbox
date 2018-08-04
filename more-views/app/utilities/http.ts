
export enum Methods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    HEAD = 'HEAD'
}

interface fetchOptions {
    method: Methods,
    body?: string,

}

function request(method: Methods, uri: string, body: object): Promise<any> {
    return new Promise((resolve: Function, reject: Function) => {
        const options: fetchOptions = {method};

        if (method === Methods.POST || method === Methods.PUT) {
            options.body = JSON.stringify(body) || "{}";
        }

        fetch(uri, options).then((response: Response) => {
            if (!response.ok) {
                reject("Unexpected status code: " + response.status);
                return;
            }
            if (method === Methods.POST || method === Methods.PUT) {
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
    static get(uri: string): Promise<any> {
        return request(Methods.GET, uri, null);
    }

    static post(uri: string, body?: object): Promise<any> {
        return request(Methods.POST, uri, body);
    }
}
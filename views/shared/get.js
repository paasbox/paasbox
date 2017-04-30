
export default class get {

    static stacks() {
        return new Promise((resolve, reject) => {
            getRequest('/api/stacks').then(response => {
                resolve(response.stacks);
            }).catch(error => {
                console.log(`Fetching stacks returned \n` + error.status ` ` + error.statusText);
            });
        });
    }

    static tasks(stack) {
        return new Promise((resolve, reject) => {
            getRequest(`/api/stacks/${stack}/tasks`).then(response => {
                resolve(response.tasks);
            }).catch(error => {
                console.log(`Fetching tasks returned \n` + error.status ` ` + error.statusText);
            });
        });
    }

    static loadBalancer(stack) {
        return new Promise((resolve, reject) => {
            getRequest(`/api/loadbalancer`).then(response => {
                resolve(response);
            }).catch(error => {
                console.log(`Fetching load balancer data return \n${error.status} ${error.statusText}`)
            })
        });
    }

}

function getRequest(url) {
    return new Promise((resolve, reject) => {
        fetch(url).then(response => {
            if (!response.ok) {
                reject(response);
            }
            return response.json();
        }).then(response => {
            resolve(response);
        }).catch(error => {
            console.log(`Error fetching from '` + url + `' \n` + error);
        });
    })
}


export default class get {

    static workspaces() {
        return new Promise((resolve, reject) => {
            getRequest('/api/workspaces').then(response => {
                resolve(response.workspaces);
            }).catch(error => {
                console.log(`Fetching workspaces returned \n` + error.status ` ` + error.statusText);
            });
        });
    }

    static tasks(workspace) {
        return new Promise((resolve, reject) => {
            getRequest(`/api/workspaces/${workspace}/tasks`).then(response => {
                resolve(response.tasks);
            }).catch(error => {
                console.log(`Fetching workspaces returned \n` + error.status ` ` + error.statusText);
            });
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

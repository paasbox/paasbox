import http from './http'
export default class tasks {
    static get(stackID, taskID) {
        return http.get(`/api/stacks/${stackID}/tasks/${taskID}`);
    }
    
    static getAll(stackID) {
        return http.get(`/api/stacks/${stackID}/tasks`);
    }

    static restart(stackID, taskID) {
        return new Promise((resolve, reject) => {
            http.post(`/api/stacks/${stackID}/tasks/${taskID}/stop`).then(() => {
                setTimeout(() => {
                    http.post(`/api/stacks/${stackID}/tasks/${taskID}/start`).then(() => {
                        resolve();
                    });
                }, 1000);
            }).catch(error => {
                reject();
                console.error("Error stopping application ", error);
            });
        });
    }
}
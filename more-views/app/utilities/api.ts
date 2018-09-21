import http from './http';
import { APIStacks, APIStack, APITasks } from './types';

export default class API {

    static getStack(stackID: string): Promise<APIStack> {
        return http.get(`/api/stacks/${stackID}`);
    }

    static getAllStacks(): Promise<APIStacks> {
        return http.get(`/api/stacks`);
    }

    static getTask(stackID: string, taskID: string) {
        return http.get(`/api/stacks/${stackID}/tasks/${taskID}`);
    }
    
    static getStackTasks(stackID: string): Promise<APITasks> {
        return http.get(`/api/stacks/${stackID}/tasks`);
    }

    static restartTask(stackID: string, taskID: string) {
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

    static startTask(stackID: string, taskID: string) {
        return http.post(`/api/stacks/${stackID}/tasks/${taskID}/start`);
    }
    
    static stopTask(stackID: string, taskID: string) {
        return http.post(`/api/stacks/${stackID}/tasks/${taskID}/stop`);
    }
}
import http from './http'
export default class stacks {
    static get(stackID) {
        return http.get(`/api/stacks/${stackID}`);
    }

    static getAll() {
        return http.get(`/api/stacks`);
    }
}
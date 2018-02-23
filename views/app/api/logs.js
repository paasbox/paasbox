import http from "./http";

export default class logs {
    constructor(props) {
        this.socket = null;
    }

    static start(instanceURL, onLog, isStdErr) {
        if (this.socket) {
            this.stop();
        }
        this.socket = new WebSocket(`ws://${window.location.host}/api${instanceURL}/${isStdErr ? "stderr" : "stdout"}.ws?tail=y`);
        this.socket.onmessage = function(message) {
            onLog(message.data);
        }
    }

    static stop() {
        if (!this.socket) {
            return;
        }
        this.socket.close();
    }

    static get(instanceURL, offset, length) {
        let URL = `/api${instanceURL}/stdout`;

        if (offset && !length) {
            URL += '?offset='+offset;
        }

        if (!offset && length) {
            URL += '?length='+length;
        }

        if (offset && length) {
            URL += '?offset='+offset+'&length='+length;
        }

        return http.get(URL);
    }

    static getAll(instanceURL, isStdErr) {
        return http.get(`/api${instanceURL}/${isStdErr ? "stderr" : "stdout"}`);
    }
}
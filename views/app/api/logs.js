import http from "./http";

export default class logs {
    constructor(props) {
        this.socket = null;
        this.connectTries = 0;
        this.connectAttemptDelay = 1;
        this.connectTimer = null;
    }

    static start(instanceURL, onLog, isStdErr) {
        console.log("try");
        this.connectTries++;
        if (this.socket) {
            this.stop();
        }
        this.socket = new WebSocket(`ws://${window.location.host}/api${instanceURL}/${isStdErr ? "stderr" : "stdout"}.ws?tail=y`);
        this.socket.onerror = () => {
            console.log("error");
            clearTimeout(this.connectTimer);
            if (this.connectTries > 7) {
                return;
            }
            this.connectAttemptDelay = this.connectAttemptDelay * 3.5;
            this.connectTimer = setTimeout(() => {
                this.start(instanceURL, onLog, isStdErr);
            }, this.connectAttemptDelay);
        };
        this.socket.onopen = () => {
            console.log("open");
            this.connectTries = 0;
            this.connectAttemptDelay = 1;
            clearTimeout(this.connectTimer);
        };
        this.socket.onclose = () => {
            console.log("close");
        };
        this.socket.onmessage = message => {
            onLog(message.data);
        };
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
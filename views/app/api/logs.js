export default class logs {
    constructor(props) {
        this.socket = null;
    }

    static start(instanceURL, onLog) {
        if (this.socket) {
            this.stop();
        }
        this.socket = new WebSocket(`ws://${window.location.host}/api${instanceURL}/stdout.ws?tail=y`);
        this.socket.onmessage = function(message) {
            onLog(message.data);
        }
    }

    static stop(instanceURL) {
        this.socket.close();
    }
}
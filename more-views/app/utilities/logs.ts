import LogsWorker = require('worker-loader?name=/js/logs.worker.js!./logs.worker');
import { LogWorkerMessage, LogWorkerEvent, LogWorkerEventType } from './logs.worker';

type MyProps = {
    stackID: string,
    taskID: string,
    instanceID: string,
    onMessage: (data: LogWorkerMessage) => void
}

interface LogWorker extends Worker {
    postMessage: (message: LogWorkerEvent) => void
}

export default class logs {
    worker: LogWorker;
    constructor(props: MyProps) {
        this.worker = new LogsWorker();
        this.worker.onmessage = (event: MessageEvent) => {
            props.onMessage({...event.data})
        }
        this.worker.postMessage({
            type: LogWorkerEventType.CONNECT,
            stackID: props.stackID,
            taskID: props.taskID,
            instanceID: props.instanceID,
            host: window.location.host
        });
    }

    stop() {
        this.worker.terminate();
    }
}
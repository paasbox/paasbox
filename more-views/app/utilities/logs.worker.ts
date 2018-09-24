export enum LogWorkerEventType {
    CONNECT = "CONNECT",
    DISCONNECT = "DISCONNECT"    
}

export enum LogWorkMessageType {
    ERROR_LOG = "ERROR_LOG",
    STANDARD_LOG = "STANDARD_LOG",
    SOCKET_ERROR = "SOCKET_ERROR",
    OTHER = "OTHER"
}

export type LogWorkerEvent = {
    type: LogWorkerEventType,
    stackID: string,
    taskID: string,
    instanceID: string,
    host: string
}

export type LogWorkerMessage = {
    type: LogWorkMessageType,
    data: string | object
}

// Worker.ts
const ctx: Worker = self as any;
let stdOutSocket: WebSocket;
let stdErrSocket: WebSocket;

// Post data to parent thread
const sendMessage = (message: LogWorkerMessage) => {
    try {
        ctx.postMessage(message);
    } catch (error) {
        console.error("Error posting message from web worker", error);
    }
};
sendMessage({
    type: LogWorkMessageType.OTHER,
    data: "Web worker loaded"
});

// Respond to message from parent thread
const handleEvent = (event: LogWorkerEvent) => {
    switch (event.type) {
        case LogWorkerEventType.CONNECT: {
            if (stdOutSocket && stdErrSocket) {
                sendMessage({
                    type: LogWorkMessageType.OTHER,
                    data: `Not connecting, already connected to logs for ${event.host}/api/stacks/${event.stackID}/tasks/${event.taskID}/instances/${event.instanceID}`
                });
                return;
            }
            stdOutSocket = new WebSocket(`ws://${event.host}/api/stacks/${event.stackID}/tasks/${event.taskID}/instances/${event.instanceID}/stdout.ws?tail=y`);
            stdErrSocket = new WebSocket(`ws://${event.host}/api/stacks/${event.stackID}/tasks/${event.taskID}/instances/${event.instanceID}/stderr.ws?tail=y`);
            bindSocketMessages(stdOutSocket, stdErrSocket);
            sendMessage({
                type: LogWorkMessageType.OTHER,
                data: `Connected to standard error and out for ${event.host}/api/stacks/${event.stackID}/tasks/${event.taskID}/instances/${event.instanceID}`
            });
            break;
        }
        default: {
            console.warn("Unrecognised event type posted to web worker", event);
            break;
        }
    }
};
ctx.addEventListener("message", (event) => {
    handleEvent(event.data);
});

const bindSocketMessages = (stdOutSocket: WebSocket, stdErrSocket: WebSocket) => {
    // TODO add some kind of array buffer to stop us overloading the main thread
    stdOutSocket.onerror = (event: CloseEvent) => sendMessage({
        type: LogWorkMessageType.SOCKET_ERROR,
        data: {
            reason: event.reason,
            code: event.code
        }
    });
    stdErrSocket.onerror = (event: CloseEvent) => sendMessage({
        type: LogWorkMessageType.SOCKET_ERROR,
        data: {
            reason: event.reason,
            code: event.code
        }
    });
    stdOutSocket.onmessage = (event: MessageEvent) => sendMessage({
        type: LogWorkMessageType.STANDARD_LOG,
        data: event.data
    });
    stdErrSocket.onmessage = (event: MessageEvent) => sendMessage({
        type: LogWorkMessageType.ERROR_LOG,
        data: event.data
    });
};
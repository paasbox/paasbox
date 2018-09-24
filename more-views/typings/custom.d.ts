declare module "worker-loader?name=/js/logs.worker.js!*" {
    class WebpackWorker extends Worker {
        constructor();
    }
    export = WebpackWorker;
}
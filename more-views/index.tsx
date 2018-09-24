import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import reducer from './app/reducer';
import App from "./app/App";
import StacksController from "./app/views/stacks/StacksController";
import LogsController from "./app/views/logs/LogsController";
import InstanceLogsController from "./app/views/logs/InstanceLogsController";

const store = createStore(
    reducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <App>
                <Route path="/stacks" component={StacksController}/>
                <Switch>
                    <Route path="/logs/:stackID/:taskID/:instanceID" component={InstanceLogsController}/>
                    <Route path="/logs" component={LogsController}/>
                </Switch>
            </App>
        </Router>
    </Provider>,
    document.getElementById("app-root")
);
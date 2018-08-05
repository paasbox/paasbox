import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import reducer from './app/reducer';
import App from "./app/App";
import StacksController from "./app/views/stacks/StacksController";
import TasksController from "./app/views/tasks/TasksController";

const store = createStore(
    reducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <App>
                <Switch>
                    <Route exact path="/stacks" component={StacksController}/>
                    <Route path="/stacks/:stackID" component={TasksController}/>
                </Switch>
            </App>
        </Router>
    </Provider>,
    document.getElementById("app-root")
);
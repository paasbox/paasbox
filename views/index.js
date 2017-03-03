// inferno module
import React from 'react';
import ReactDOM from "react-dom";
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux'

// scss module
import './scss/main.scss';

// state modules
import { Provider } from 'react-redux';
import store from './shared/store';

// app component
import App from './App.jsx';
import TasksController from './components/tasks/TasksController.jsx';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

function NoMatch() {
    return (
        <p>404 - No page found</p>
    )
}

const history = syncHistoryWithStore(browserHistory, store);

const routes = (
    <MuiThemeProvider>
        <Provider store={ store }>
            <Router history={ history }>
                <Route component={ App }>
                    <Route path="/:workspace" component={ TasksController }/>
                    <Route path="/:workspace/:task/logs" component={ TasksController }/>
                    <Route path="*" components={ NoMatch }/>
                </Route>
            </Router>
        </Provider>
    </MuiThemeProvider>
);

ReactDOM.render(routes, document.getElementById('app-root'));


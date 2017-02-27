// inferno module
import React from 'react';
import ReactDOM from "react-dom";
import { Router, Route, browserHistory } from 'react-router';

// scss module
import './scss/main.scss';

// state modules
import { Provider } from 'react-redux';
import store from './shared/store';

// app component
import App from './App.jsx';
import WorkspaceController from './components/sidebar/WorkspacesController.jsx';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const routes = (
    <MuiThemeProvider>
        <Provider store={ store }>
            <Router history={ browserHistory }>
                <Route component={ App }>
                    <Route path="/" component={ WorkspaceController } />
                </Route>
            </Router>
        </Provider>
    </MuiThemeProvider>
);

ReactDOM.render(routes, document.getElementById('app-root'));


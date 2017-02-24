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

const routes = (
    <Provider store={ store }>
        <Router history={ browserHistory }>
            <Route path="/" component={ App }>
            </Route>
        </Router>
    </Provider>
);

ReactDOM.render(routes, document.getElementById('app-root'));


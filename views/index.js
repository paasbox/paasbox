// inferno module
import React from 'react';

// scss module
import './scss/main.scss';

// routing modules
import createBrowserHistory from 'history/createBrowserHistory';

// state modules
import { Provider } from 'react-redux';
import store from './shared/store';

// app component
import App from './App.jsx';

if (module.hot) {
    require('inferno-devtools');
}

const browserHistory = createBrowserHistory();

const routes = (
    <Provider store={ store }>
        <Router history={ browserHistory }>
            <Route component={ App }>
            </Route>
        </Router>
    </Provider>
);

Inferno.render(routes, document.getElementById('app-root'));

if (module.hot) {
    module.hot.accept()
}

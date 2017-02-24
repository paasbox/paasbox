// inferno module
import Inferno from 'inferno';

// scss module
import './scss/main.scss';

// routing modules
import { Router, Route } from 'inferno-router';
import createBrowserHistory from 'history/createBrowserHistory';

// state modules
import { Provider } from 'inferno-redux';
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

Inferno.render(<App/>, document.getElementById('app-root'));

if (module.hot) {
    module.hot.accept()
}

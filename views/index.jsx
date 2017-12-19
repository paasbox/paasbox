import Inferno from 'inferno';
import Component from 'inferno-component';
import { Provider } from 'inferno-redux';
import { createStore, applyMiddleware } from 'redux';
import createBrowserHistory from 'history/createBrowserHistory';
import { Router, Route, IndexRoute } from 'inferno-router';
import { devToolsEnhancer } from 'redux-devtools-extension';
import 'inferno-devtools';

import './scss/main.scss';
import reducers from './app/global/reducers';
import App from './app/App';
import UnknownRoute from './app/components/UnknownRoute';
import Tasks from './app/components/Tasks';
import Home from './app/components/Home';  
import Logs from './app/components/Logs'; 

const browserHistory = createBrowserHistory();
const store = createStore(reducers, devToolsEnhancer());

const application = (
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route component={App}>
                <IndexRoute component={Home}/>
                <Route path="/:stackID" component={Tasks} />
                <Route path="/:stackID/:taskID/logs" component={Logs} />
                <Route path="*" component={UnknownRoute}/>
            </Route>
        </Router>
    </Provider>
)

Inferno.render(
    application,
    document.getElementById('app-root')
);
import { createStore, combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux'
import {
    UPDATE_WORKSPACES,
    UPDATE_ACTIVE_WORKSPACE,
    UPDATE_ACTIVE_WORKSPACE_TASKS
} from './actions';

const initialState = {
    workspaces: [],
    activeWorkspace: {}
};

function state(state = initialState, action) {

    const updatedState = JSON.parse(JSON.stringify(state));

    switch (action.type) {
        case ('UPDATE_WORKSPACES'): {
            updatedState.workspaces = action.workspaces;
            break;
        }
        case ('UPDATE_ACTIVE_WORKSPACE'): {
            updatedState.activeWorkspace = action.activeWorkspace;
            break;
        }
        case ('UPDATE_ACTIVE_WORKSPACE_TASKS'): {
            updatedState.activeWorkspace.tasks = action.tasks;
            break;
        }
    }

    return updatedState;
}

const store = createStore(
    combineReducers({
        state,
        routing: routerReducer
    }),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
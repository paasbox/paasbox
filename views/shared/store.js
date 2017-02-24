import { createStore } from 'redux';
import { UPDATE_WORKSPACES } from './actions';

const initialState = {
    workspaces: [],
    activeWorkspace: {}
};

function reducer(state = initialState, action) {

    const updatedState = JSON.parse(JSON.stringify(state));

    switch (action.type) {
        case (UPDATE_WORKSPACES): {
            updatedState.workspaces = action.workspaces;
            break;
        }
        default: {
            console.log("Action type '%s' unrecognised", action.type);
            break;
        }
    }

    return updatedState;
}

let store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default store;
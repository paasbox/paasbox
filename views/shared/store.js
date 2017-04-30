import { createStore, combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux'
import {
    UPDATE_STACKS,
    UPDATE_ACTIVE_STACK,
    UPDATE_ACTIVE_STACK_TASKS,
    UPDATE_ACTIVE_TASK
} from './actions';

const initialState = {
    stacks: [],
    activeStack: {},
    activeTask: {}
};

function state(state = initialState, action) {

    const updatedState = JSON.parse(JSON.stringify(state));

    switch (action.type) {
        case ('UPDATE_STACKS'): {
            updatedState.stacks = action.stacks;
            break;
        }
        case ('UPDATE_ACTIVE_STACK'): {
            updatedState.activeStack = action.activeStack;
            break;
        }
        case ('UPDATE_ACTIVE_STACK_TASKS'): {
            updatedState.activeStack.tasks = action.tasks;
            break;
        }
        case ('UPDATE_ACTIVE_TASK'): {
            updatedState.activeTask = action.task;
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
import { createStore } from 'redux';

const initialState = {
};

function reducer(state = initialState, action) {
    switch (action.type) {
        default: {
            console.log("Action type '%s' unrecognised", action.type);
            return state;
        }
    }
}

let store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default store;
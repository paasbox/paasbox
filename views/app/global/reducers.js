import {
    ADD_STACKS,
    ADD_TASKS,
    ADD_ACTIVE_TASK
} from './actions';

const initialState = {
    stacks: [],
    tasks: null,
    activeTask: null
}

export default function(state = initialState, action) {
    switch (action.type) {
        case(ADD_STACKS): {
            return {
                ...state,
                stacks: [...action.stacks]
            }
        }
        case(ADD_TASKS): {
            return {
                ...state,
                tasks: [...action.tasks]
            }
        }
        case(ADD_ACTIVE_TASK): {
            return {
                ...state,
                activeTask: action.activeTask
            }
        }
        case("@@INIT"): {
            return state;
        }
        case("@@redux/INIT"): {
            return state;
        }
        default: {
            console.warn(`Unrecognised action type: ${action.type}`);
            return state;
        }
    }
}
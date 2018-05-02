import {
    ADD_STACKS,
    ADD_TASKS,
    ADD_ACTIVE_TASK, 
    UPDATE_TASK_RUNNING_STATUS,
    UPDATE_ACTIVE_TASK_RUNNING_STATUS
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
        case(UPDATE_ACTIVE_TASK_RUNNING_STATUS): {
            return {
                ...state,
                activeTask: {
                    ...state.activeTask,
                    is_started: action.isRunning
                }
            }
        }
        case(UPDATE_TASK_RUNNING_STATUS): {
            return {
                ...state,
                tasks: state.tasks.map(task => {
                    if (task.id === action.taskID) {
                        return {
                            ...task,
                            is_started: action.isRunning
                        }
                    }
                    return task;
                })
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
import { ActionTypes, ActionTypeKeys } from "./utilities/actionTypes";
import { Stack, Task, Instance } from "./utilities/types";

export interface State {
    stacks: {
        all: {
            isBeingFetched: boolean,
            items: Array<Stack>
        },
        active?: {
            isBeingFetched: boolean,
            item: Stack
        }
    },
    tasks: {
        all?: {
            isBeingFetched: boolean,
            items: Array<Task>
        },
        active?: {
            isBeingFetched: boolean,
            item: Task
        }
    }
}

const initialState: State = {
    stacks: {
        all: {
            isBeingFetched: false,
            items: undefined
        },
        active: {
            isBeingFetched: false,
            item: undefined
        }
    },
    tasks: {
        all: {
            isBeingFetched: false,
            items: undefined
        },
        active: {
            isBeingFetched: false,
            item: undefined
        }
    }
}

export default function reducer(state: State = initialState, action: ActionTypes): State {
    switch (action.type) {
        case (ActionTypeKeys.ADD_STACKS): {
            return {
                ...state,
                stacks: {
                    ...state.stacks,
                    all: {
                        ...state.stacks.all,
                        items: action.stacks
                    }
                }
            }
        }
        case (ActionTypeKeys.SET_IS_FETCHING_STACKS): {
            return {
                ...state,
                stacks: {
                    ...state.stacks,
                    all: {
                        ...state.stacks.all,
                        isBeingFetched: action.isFetching
                    }
                }
            }
        }
        case (ActionTypeKeys.ADD_ACTIVE_STACK): {
            return {
                ...state,
                stacks: {
                    ...state.stacks,
                    active: {
                        ...state.stacks.active,
                        item: action.stack
                    }
                }
            }
        }
        case (ActionTypeKeys.ADD_TASKS): {
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    all: {
                        ...state.tasks.all,
                        items: action.tasks
                    }
                }
            }
        }
        case (ActionTypeKeys.EMPTY_TASKS): {
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    all: {
                        ...state.tasks.all,
                        items: []
                    }
                }
            }
        }
        case (ActionTypeKeys.SET_IS_FETCHING_TASKS): {
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    all: {
                        ...state.tasks.all,
                        isBeingFetched: action.isFetching
                    }
                }
            }
        }
        case(ActionTypeKeys.SET_IS_FETCHING_CURRENT_INSTANCES_DETAILS): {
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    all: {
                        ...state.tasks.all,
                        items: state.tasks.all.items.map(task => {
                            if (task.id !== action.taskID) {
                                return task
                            }
                            return {
                                ...task,
                                is_fetching_current_instances_details: action.isFetching
                            }
                        })
                    }
                }
            }
        }
        case(ActionTypeKeys.ADD_CURRENT_INSTANCES_DETAILS): {
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    all: {
                        ...state.tasks.all,
                        items: state.tasks.all.items.map(task => {
                            if (task.id !== action.taskID) {
                                return task
                            }
                            return {
                                ...task,
                                current_instances_details: [...action.instances]
                            }
                        })
                    }
                }
            }
        }
        case(ActionTypeKeys.REDUX_INIT): {
            return {...state}
        }
        default: {
            console.log("Unrecognised action type given to Redux reducer", action.type);
            return {...state};
        }
    }
}
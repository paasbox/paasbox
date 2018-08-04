import { Stack, Task } from "./types";
import { ActionTypeKeys } from "./actionTypes";

export function addStacks(stacks: Array<Stack>) {
    return {
        type: ActionTypeKeys.ADD_STACKS,
        stacks
    }
}

export function setIsFetchingStacks(isFetching: boolean) {
    return {
        type: ActionTypeKeys.SET_IS_FETCHING_STACKS,
        isFetching
    }
}

export function addTasks(tasks: Array<Task>) {
    return {
        type: ActionTypeKeys.ADD_TASKS,
        tasks
    }
}

export function setIsFetchingTasks(isFetching: boolean) {
    return {
        type: ActionTypeKeys.SET_IS_FETCHING_TASKS,
        isFetching
    }
}
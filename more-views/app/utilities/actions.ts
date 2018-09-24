import { Stack, Task, Instance } from "./types";
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

export function addActiveStack(stack: Stack) {
    return {
        type: ActionTypeKeys.ADD_ACTIVE_STACK,
        stack
    }
}

export function addTasks(tasks: Array<Task>) {
    return {
        type: ActionTypeKeys.ADD_TASKS,
        tasks
    }
}

export function emptyTasks() {
    return {
        type: ActionTypeKeys.EMPTY_TASKS
    }
}

export function setIsFetchingTasks(isFetching: boolean) {
    return {
        type: ActionTypeKeys.SET_IS_FETCHING_TASKS,
        isFetching
    }
}

export function addCurrentInstancesDetails(instances: Instance[], taskID: string) {
    return {
        type: ActionTypeKeys.ADD_CURRENT_INSTANCES_DETAILS,
        taskID,
        instances
    }
}

export function setIsFetchingCurrentInstancesDetails(isFetching: boolean, taskID: string) {
    return {
        type: ActionTypeKeys.SET_IS_FETCHING_CURRENT_INSTANCES_DETAILS,
        taskID,
        isFetching
    }
}
import { Task, Stack, Instance } from "./types";

export enum ActionTypeKeys {
    ADD_STACKS = "ADD_STACKS",
    SET_IS_FETCHING_STACKS = "SET_IS_FETCHING_STACKS",
    ADD_ACTIVE_STACK = "ADD_ACTIVE_STACK",
    ADD_TASKS = "ADD_TASKS",
    EMPTY_TASKS = "EMPTY_TASKS",
    SET_IS_FETCHING_TASKS = "SET_IS_FETCHING_TASKS",
    ADD_ACTIVE_TASK = "ADD_ACTIVE_TASK",
    UPDATE_TASK_RUNNING_STATUS = "UPDATE_TASK_RUNNING_STATUS",
    UPDATE_ACTIVE_TASK_RUNNING_STATUS = "UPDATE_ACTIVE_TASK_RUNNING_STATUS",
    ADD_ACTIVE_TASK_LOGS = "ADD_ACTIVE_TASK_LOGS",
    ADD_LOG_LINE = "ADD_LOG_LINE",
    ADD_CURRENT_INSTANCES_DETAILS = "ADD_CURRENT_INSTANCES",
    SET_IS_FETCHING_CURRENT_INSTANCES_DETAILS = "SET_IS_FETCHING_CURRENT_INSTANCES_DETAILS",
    REDUX_INIT = "@@INIT",
    OTHER_ACTION = "OTHER_ACTION"
}

interface addStacksAction {
    type: ActionTypeKeys.ADD_STACKS,
    stacks: Array<Stack>
}

interface setIsFetchingStacksAction {
    type: ActionTypeKeys.SET_IS_FETCHING_STACKS,
    isFetching: boolean
}

interface addActiveStack {
    type: ActionTypeKeys.ADD_ACTIVE_STACK,
    stack: Stack
}

interface addTasksAction {
    type: ActionTypeKeys.ADD_TASKS,
    tasks: Array<Task>
}

interface emptyTasksAction {
    type: ActionTypeKeys.EMPTY_TASKS
}

interface setIsFetchingTasksAction {
    type: ActionTypeKeys.SET_IS_FETCHING_TASKS,
    isFetching: boolean
}

interface addCurrentInstancesDetails {
    type: ActionTypeKeys.ADD_CURRENT_INSTANCES_DETAILS,
    taskID: string,
    instances: Instance[]
}

interface setIsFetchingCurrentInstancesDetails {
    type: ActionTypeKeys.SET_IS_FETCHING_CURRENT_INSTANCES_DETAILS,
    taskID: string,
    isFetching: boolean
}

interface OtherAction {
    type: ActionTypeKeys.OTHER_ACTION;
}

interface ReduxInit {
    type: ActionTypeKeys.REDUX_INIT;
}

export type ActionTypes = (
    addStacksAction |
    setIsFetchingStacksAction |
    addActiveStack |
    addTasksAction |
    emptyTasksAction |
    setIsFetchingTasksAction |
    addCurrentInstancesDetails |
    setIsFetchingCurrentInstancesDetails |
    OtherAction |
    ReduxInit
)

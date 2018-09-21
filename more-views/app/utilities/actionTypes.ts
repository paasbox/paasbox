import { Task, Stack } from "./types";

export enum ActionTypeKeys {
    ADD_STACKS = "ADD_STACKS",
    SET_IS_FETCHING_STACKS = "SET_IS_FETCHING_STACKS",
    ADD_ACTIVE_STACK = "ADD_ACTIVE_STACK",
    ADD_TASKS = "ADD_TASKS",
    SET_IS_FETCHING_TASKS = "SET_IS_FETCHING_TASKS",
    ADD_ACTIVE_TASK = "ADD_ACTIVE_TASK",
    UPDATE_TASK_RUNNING_STATUS = "UPDATE_TASK_RUNNING_STATUS",
    UPDATE_ACTIVE_TASK_RUNNING_STATUS = "UPDATE_ACTIVE_TASK_RUNNING_STATUS",
    ADD_ACTIVE_TASK_LOGS = "ADD_ACTIVE_TASK_LOGS",
    ADD_LOG_LINE = "ADD_LOG_LINE",
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

interface setIsFetchingTasksAction {
    type: ActionTypeKeys.SET_IS_FETCHING_TASKS,
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
    setIsFetchingTasksAction |
    OtherAction |
    ReduxInit
)

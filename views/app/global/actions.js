export const ADD_STACKS = "ADD_STACKS";
export const ADD_TASKS = "ADD_TASKS";
export const ADD_ACTIVE_TASK = "ADD_ACTIVE_TASK";
export const UPDATE_TASKS_RUNNING_STATUS = "UPDATE_TASKS_RUNNING_STATUS";

export function addStacks(stacks) {
    return {
        type: ADD_STACKS,
        stacks
    }
}

export function addTasks(tasks) {
    return {
        type: ADD_TASKS,
        tasks
    }
}

export function updateTasksRunningStatus(taskID, isRunning) {
    return {
        type: UPDATE_TASKS_RUNNING_STATUS,
        taskID,
        isRunning
    }
}

export function addActiveTask(activeTask) {
    return {
        type: ADD_ACTIVE_TASK,
        activeTask
    }
}
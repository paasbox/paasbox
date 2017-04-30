import store from '../shared/store';

export const UPDATE_STACKS = 'UPDATE_STACKS';
export const UPDATE_ACTIVE_STACK = 'UPDATE_ACTIVE_STACK';
export const UPDATE_ACTIVE_STACK_TASKS = 'UPDATE_ACTIVE_STACK_TASKS';
export const UPDATE_ACTIVE_TASK = 'UPDATE_ACTIVE_TASK';

export function updateStacks(stacks) {
    return {
        type: UPDATE_STACKS,
        stacks: stacks
    }
}

export function updateActiveStack(activeStack) {
    store.dispatch(updateActiveTask({}));
    return {
        type: UPDATE_ACTIVE_STACK,
        activeStack: activeStack
    }

}

export function updateActiveStackTasks(tasks) {
    return {
        type: UPDATE_ACTIVE_STACK_TASKS,
        tasks: tasks
    }
}

export function updateActiveTask(task) {
    return {
        type: UPDATE_ACTIVE_TASK,
        task: task
    }
}
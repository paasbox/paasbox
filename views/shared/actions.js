import get from '../shared/get';
import store from '../shared/store';

export const UPDATE_WORKSPACES = 'UPDATE_WORKSPACES';
export const UPDATE_ACTIVE_WORKSPACE = 'UPDATE_ACTIVE_WORKSPACE';
export const UPDATE_ACTIVE_WORKSPACE_TASKS = 'UPDATE_ACTIVE_WORKSPACE_TASKS';
export const UPDATE_ACTIVE_TASK = 'UPDATE_ACTIVE_TASK';

export function updateWorkspaces(workspaces) {
    return {
        type: UPDATE_WORKSPACES,
        workspaces: workspaces
    }
}

export function updateActiveWorkspace(activeWorkspace) {
    return {
        type: UPDATE_ACTIVE_WORKSPACE,
        activeWorkspace: activeWorkspace
    }

}

export function updateActiveWorkspaceTasks(tasks) {
    return {
        type: UPDATE_ACTIVE_WORKSPACE_TASKS,
        tasks: tasks
    }
}

export function updateActiveTask(task) {
    return {
        type: UPDATE_ACTIVE_TASK,
        task: task
    }
}
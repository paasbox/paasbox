export const UPDATE_WORKSPACES = 'UPDATE_WORKSPACES';

export function updateWorkspaces(workspaces) {
    return {
        type: UPDATE_WORKSPACES,
        workspaces: workspaces
    }
}

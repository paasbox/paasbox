import React, { Component } from 'react';

export default class WorkspacesList extends Component {
    render() {
        return (
            <ul>
                {this.props.workspaces.map(workspace => {
                    return <li key={workspace.id}>{workspace.id}</li>
                })}
            </ul>
        )
    }
}
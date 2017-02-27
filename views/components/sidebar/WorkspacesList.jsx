import React, { Component } from 'react';
import { Link } from 'react-router';
import MenuItem from 'material-ui/MenuItem';

export default class WorkspacesList extends Component {
    render() {
        return (
            <ul style={{padding:0}}>
                {this.props.workspaces.map(workspace => {
                    return <MenuItem href={workspace.id} key={workspace.id}>{workspace.id}</MenuItem>
                })}
            </ul>
        )
    }
}
import React, { Component } from 'react';
import MenuItem from 'material-ui/MenuItem';

export default class Workspaces extends Component {
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
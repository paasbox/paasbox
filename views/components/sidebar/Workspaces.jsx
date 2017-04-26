import React, { Component } from 'react';
import { Link } from 'react-router';
import MenuItem from 'material-ui/MenuItem';

export default class Workspaces extends Component {
    render() {
        return (
            <div style={{padding:0}}>
                {this.props.workspaces.map(workspace => {
                    return <MenuItem key={workspace.id} containerElement={<Link to={`/${workspace.id}`} />}>{workspace.name}</MenuItem>;
                })}
            </div>
        )
    }
}
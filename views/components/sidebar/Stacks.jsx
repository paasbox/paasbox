import React, { Component } from 'react';
import { Link } from 'react-router';
import MenuItem from 'material-ui/MenuItem';

export default class Stacks extends Component {
    render() {
        return (
            <div style={{padding:0}}>
                {this.props.stacks.map(stack => {
                    return <MenuItem key={stack.id} containerElement={<Link to={`/${stack.id}`} />}>{stack.name}</MenuItem>;
                })}
            </div>
        )
    }
}
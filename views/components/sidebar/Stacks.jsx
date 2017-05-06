import React, { Component } from 'react';
import { Link } from 'react-router';
import MenuItem from 'material-ui/MenuItem';

const activeStyles = {
    backgroundColor: "rgba(0, 0, 0, 0.2)"
};

export default class Stacks extends Component {
    render() {
        return (
            <div style={{padding:0}}>
                {this.props.stacks.map(stack => {
                    return (
                        <MenuItem 
                            key={stack.id} 
                            containerElement={<Link to={`/${stack.id}`} />}
                            style={this.props.activeStack === stack.id ? activeStyles : {}}
                        >
                            {stack.name}
                        </MenuItem>
                    )
                })}
            </div>
        )
    }
}
import React, { Component } from 'react';
import { Link } from 'react-router'

export default class TasksList extends Component {
    render() {
        return (
            <div>
                <h2>{this.props.activeWorkspace.name}</h2>
                <ul>
                    {this.props.activeWorkspace.tasks.map(task => {
                        return <li key={task.id}><Link to={`/${this.props.activeWorkspace.id}/${task.id}`}> {task.id} </Link></li>;
                    })}
                </ul>
            </div>
        )
    }
}
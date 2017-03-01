import React, { Component } from 'react';
import { Link } from 'react-router'

export default class TasksList extends Component {
    render() {
        return (
            <div>
                <h2>{this.props.activeWorkspace.name}</h2>
                <ul>
                    {this.props.activeWorkspace.tasks.map(task => {
                        {console.log(task)}
                        return (
                            <li key={task.id}>
                                <Link to={`/${this.props.activeWorkspace.id}/${task.id}`}> {task.name} </Link>
                                <div>Port: {task.ports[0]}</div>
                                <div>Running: {(task.healthchecks[0].instances && task.healthchecks[0].instances[0].healthy) ? `true` : `false`}</div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        )
    }
}
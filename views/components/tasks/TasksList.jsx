import React, { Component } from 'react';
import TaskItem from './TaskItem.jsx';

export default class TasksList extends Component {
    render() {
        return (
            <div>
                <h2>{this.props.activeWorkspace.name}</h2>
                <ul className="list--neutral">
                    {this.props.activeWorkspace.tasks.map(task => {
                        return (
                            <TaskItem key={task.id} task={task} activeWorkspaceID={this.props.activeWorkspace.id}/>
                        );
                    })}
                </ul>
            </div>
        )
    }
}
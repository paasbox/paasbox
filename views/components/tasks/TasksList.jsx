import React, { Component } from 'react';
import TaskItem from './TaskItem.jsx';

export default class TasksList extends Component {
    render() {
        return (
            <div>
                <h2>{this.props.activeStack.name}</h2>
                <ul className="list--neutral">
                    {this.props.activeStack.tasks.map(task => {
                        return (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                activeStackID={this.props.activeStack.id} 
                                activeTask={this.props.activeTask} 
                                handleLogClick={this.props.handleLogClick}
                                handleDevModeClick={this.props.handleDevModeClick}
                                handleStartStopClick={this.props.handleStartStopClick} 
                            />
                        );
                    })}
                </ul>
            </div>
        )
    }
}
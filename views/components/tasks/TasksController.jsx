import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import get from '../../shared/get';
import { updateActiveWorkspaceTasks, updateActiveTask } from '../../shared/actions';
import TasksList from './TasksList.jsx';

class TasksController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFetchingTasks: false
        };

        this.handleLogClick = this.handleLogClick.bind(this);
    }

    componentWillMount() {
        const workspace = this.props.params.workspace;
        this.fetchTasks(workspace).then(() => {
            if (!this.props.params.task) {
                return;
            }

            const activeTask = this.props.activeWorkspace.tasks.find(task => {
                return task.id === this.props.params.task;
            });
            this.props.dispatch(updateActiveTask(activeTask))
        });
    }

    shouldComponentUpdate(nextProps) {
        return !this.state.isFetchingTasks;
    }

    componentWillReceiveProps(nextProps) {
        // New active workspace, update state
        if (nextProps.routeParams.workspace !== this.props.activeWorkspace.id) {
            this.fetchTasks(nextProps.routeParams.workspace);
            return;
        }

        // No active task anymore, so empty state
        // if (this.props.activeTask && !nextProps.routeParams.task) {
        //     this.props.dispatch(updateActiveTask({}));
        // }

        // New active task, update state
        if (nextProps.routeParams.task && (nextProps.routeParams.task !== this.props.activeTask.id)) {
            const activeTask = nextProps.activeWorkspace.tasks.find(task => {
                return task.id === nextProps.params.task;
            });

            this.props.dispatch(updateActiveTask(activeTask));
        }

    }

    handleLogClick(itemProps) {
        browserHistory.push(`/${itemProps.activeWorkspaceID}/${itemProps.task.id}/logs`);
        // this.props.dispatch(updateActiveTask())
    }

    fetchTasks(workspace) {
        return new Promise((resolve) => {
            this.setState({isFetchingTasks: true});

            get.tasks(workspace).then(tasks => {
                this.setState({isFetchingTasks: false});
                this.props.dispatch(updateActiveWorkspaceTasks(tasks));
                resolve();
            });
        });
    }

    render() {
        return (
            this.state.isFetchingTasks ?
                <p>Loading tasks...</p>
                :
                <TasksList activeWorkspace={this.props.activeWorkspace} activeTask={this.props.activeTask} handleLogClick={this.handleLogClick} />

        )
    }
}

function mapStateToProps(state) {
    return {
        workspaces: state.state.workspaces,
        activeWorkspace: state.state.activeWorkspace,
        activeTask: state.state.activeTask
    }
}

export default connect(mapStateToProps)(TasksController);
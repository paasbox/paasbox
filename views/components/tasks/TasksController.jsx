import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import get from '../../shared/get';
import post from '../../shared/post';
import put from '../../shared/put';
import { updateActiveStackTasks, updateActiveTask } from '../../shared/actions';
import TasksList from './TasksList.jsx';

class TasksController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFetchingTasks: false
        };

        this.handleLogClick = this.handleLogClick.bind(this);
        this.handleStartStopClick = this.handleStartStopClick.bind(this);
        this.handleDevModeClick = this.handleDevModeClick.bind(this);
    }

    componentWillMount() {
        const stack = this.props.params.stack;
        this.fetchTasks(stack, this.props).then(() => {
            if (!this.props.params.task) {
                return;
            }

            const activeTask = this.props.activeStack.tasks.find(task => {
                return task.id === this.props.params.task;
            });
            this.props.dispatch(updateActiveTask(activeTask))
        });
    }

    shouldComponentUpdate(nextProps) {
        return !this.state.isFetchingTasks;
    }

    componentWillReceiveProps(nextProps) {

        // No active task but still on same stack - hide any logs
        if (!nextProps.params.task && this.props.params.task) {
            const tasks = nextProps.activeStack.tasks.map(task => {
                if (task.show_logs) {
                    task.show_logs = false;
                }
                return task;
            });
            const activeTask = {};
            this.props.dispatch(updateActiveTask(activeTask));
            this.props.dispatch(updateActiveStackTasks(tasks));
        }

        // New active stack, update state
        if (nextProps.routeParams.stack !== this.props.activeStack.id) {
            this.fetchTasks(nextProps.routeParams.stack, nextProps);
            return;
        }

        // New active task, update state
        if (nextProps.routeParams.task && (nextProps.routeParams.task !== this.props.activeTask.id)) {
            const tasks = nextProps.activeStack.tasks.map(task => {
                if (task.show_logs) {
                    task.show_logs = false;
                }
                return task;
            });
            const activeTask = nextProps.activeStack.tasks.find(task => {
                if (task.id === nextProps.params.task) {
                    task.show_logs = task.id === nextProps.params.task;
                    return true;
                }
                return false;
            });
            this.props.dispatch(updateActiveStackTasks(tasks));
            this.props.dispatch(updateActiveTask(activeTask));
        }

    }

    handleLogClick(itemProps) {
        if (itemProps.task.show_logs) {
            browserHistory.push(`/${itemProps.activeStackID}`);    
            return;
        }
        browserHistory.push(`/${itemProps.activeStackID}/${itemProps.task.id}/logs`);
    }

    handleStartStopClick(itemProps) {
        const stopOrStart = itemProps.task.is_started ? "stop" : "start";
        const apiURL = `/api${itemProps.task.task_url}/${itemProps.task.is_started ? "stop" : "start"}`;
        post(apiURL).then(() => {
            console.debug(`Successful ${stopOrStart} of ${itemProps.task.name}`);
        }).catch(error => {
            console.debug(`Error during ${stopOrStart} of ${itemProps.task.name}: \n${error}`);
        });
    }

    handleDevModeClick(itemProps) {
        const apiURL = `/api${itemProps.task.task_url}`;
        put(apiURL, { "dev_mode": !itemProps.task.dev_mode }).then(() => {
            console.debug(`Successful dev mode change of ${itemProps.task.name}`);
        }).catch(error => {
            console.debug(`Error during dev mode change of ${itemProps.task.name}: \n${error}`);
        });
    }

    fetchTasks(stack, props) {
        this.setState({isFetchingTasks: true});

        const fetches = [
            get.tasks(stack).then(tasks => {
                return tasks;
            }),
            get.loadBalancer(stack).then(loadBalancer => {
                return loadBalancer;
            })
        ]

        return Promise.all(fetches).then(responses => {
            const tasksWithoutHealth = responses[0];
            const portStatuses = responses[1].listeners;
            const activeTask = props.activeTask;
            const hasLogsPath = props.route.path.split('/')[3];
            const tasks = tasksWithoutHealth.map(task => {
                if(task.ports) {
                    const health = portStatuses[task.ports[0]].healthy_instances > 0;
                    task.is_healthy = health;
                }
                task.show_logs = task.id === props.params.task;
                return task;
            });

            this.setState({isFetchingTasks: false});
            this.props.dispatch(updateActiveStackTasks(tasks));
        });
    }

    render() {
        return (
            this.state.isFetchingTasks ?
                <p>Loading tasks...</p>
                :
                <TasksList 
                    activeStack={this.props.activeStack} 
                    activeTask={this.props.activeTask} 
                    handleLogClick={this.handleLogClick} 
                    handleStartStopClick={this.handleStartStopClick} 
                    handleDevModeClick={this.handleDevModeClick}
                    handleOpenClick={this.handleOpenClick}
                />

        )
    }
}

function mapStateToProps(state) {
    return {
        stacks: state.state.stacks,
        activeStack: state.state.activeStack,
        activeTask: state.state.activeTask
    }
}

export default connect(mapStateToProps)(TasksController);
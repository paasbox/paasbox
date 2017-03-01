import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from '../../shared/get';
import { updateActiveWorkspaceTasks } from '../../shared/actions';
import TasksList from './TasksList.jsx';

class TasksController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFetchingTasks: false,
            activeTask: ``
        }
    }

    componentWillMount() {
        this.fetchTasks(this.props.params.workspace);
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.params.task) {
            console.log(nextProps.params.task);
        }
        return !this.state.isFetchingTasks;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.routeParams.workspace !== this.props.activeWorkspace.id) {
            this.fetchTasks(nextProps.routeParams.workspace);
        }
    }

    fetchTasks(workspace) {
        this.setState({isFetchingTasks: true});

        get.tasks(workspace).then(tasks => {
            this.setState({isFetchingTasks: false});
            this.props.dispatch(updateActiveWorkspaceTasks(tasks));
        });
    }

    render() {
        return (
            this.state.isFetchingTasks ?
                <p>Loading tasks...</p>
                :
                <TasksList activeWorkspace={this.props.activeWorkspace} />

        )
    }
}

function mapStateToProps(state) {
    return {
        activeWorkspace: state.state.activeWorkspace
    }
}

export default connect(mapStateToProps)(TasksController);
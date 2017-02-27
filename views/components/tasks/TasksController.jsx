import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from '../../shared/get';
import { updateActiveWorkspaceTasks } from '../../shared/actions';
import TasksList from './TasksList.jsx';

class TasksController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFetchingTasks: false
        }
    }

    componentWillMount() {
        this.setState({isFetchingTasks: true});

        get.tasks(this.props.params.workspace).then(tasks => {
            this.setState({isFetchingTasks: false});
            this.props.dispatch(updateActiveWorkspaceTasks(tasks));
        });
    }

    shouldComponentUpdate() {
        return !this.state.isFetchingTasks;
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
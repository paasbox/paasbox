import Inferno from 'inferno';
import Component from 'inferno-component';
import { connect } from 'inferno-redux';
import { Link } from 'inferno-router';

import tasks from '../api/tasks';
import {addTasks, updateTaskRunningStatus} from '../global/actions';

class Tasks extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFetchingTasks: false
        }
    }

    componentWillMount() {
        this.updateTasks(this.props.params.stackID);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.stackID !== this.props.params.stackID) {
            this.updateTasks(nextProps.params.stackID);
        }
    }

    updateTasks(stackID) {
        this.setState({isFetchingTasks: true});
        tasks.getAll(stackID).then(response => {
            this.props.dispatch(addTasks(response.tasks));
            this.setState({isFetchingTasks: false});
        }).catch(error => {
            console.error("Error updating stack tasks ", error, stackID);
            this.setState({isFetchingTasks: false});
        });
    }

    startService(taskID) {
        tasks.start(this.props.params.stackID, taskID).then(() => {
            this.props.dispatch(updateTaskRunningStatus(taskID, true));
        }).catch(error => {
            console.error(`Error trying to start service '${taskID}'`, error);
        });
    }
    
    stopService(taskID) {
        tasks.stop(this.props.params.stackID, taskID).then(() => {
            this.props.dispatch(updateTaskRunningStatus(taskID, false));
        }).catch(error => {
            console.error(`Error trying to stop service '${taskID}'`, error);
        });
    }

    render() {
        return (
            <ul>
                {this.props.tasks ?
                    this.props.tasks.map(task => {
                        return (
                            <div>
                                <Link to={`/${this.props.params.stackID}/${task.id}/logs`}>{task.name}</Link>
                                ({(task.ports && task.ports.length > 0) && task.ports[0]})
                                {task.is_started ?
                                    <button type="button" onClick={() => {this.stopService(task.id)}}>Stop</button>
                                :
                                    <button type="button" onClick={() => {this.startService(task.id)}}>Start</button>
                                }
                            </div>
                        )
                    })
                :
                    <p>Loading...</p>
                }
            </ul>
        )
    }
}

function mapStateToProps(state) {
    return {
        tasks: state.tasks
    }
}

export default connect(mapStateToProps)(Tasks);
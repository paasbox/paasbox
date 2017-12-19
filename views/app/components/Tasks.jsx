import Inferno from 'inferno';
import Component from 'inferno-component';
import { connect } from 'inferno-redux';
import { Link } from 'inferno-router';

import tasks from '../api/tasks';
import {addTasks} from '../global/actions';

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

    restartService(taskID) {
        tasks.restart(this.props.params.stackID, taskID);
    }

    render() {
        return (
            <ul>
                {this.props.tasks ?
                    this.props.tasks.map(task => {
                        return (
                            <div>
                                <Link to={`/${this.props.params.stackID}/${task.id}/logs`}>{task.name}</Link>
                                ({task.ports[0]})
                                <button type="button" onClick={() => {this.restartService(task.id)}}>Restart</button>
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
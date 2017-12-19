import Inferno from 'inferno';
import Component from 'inferno-component';
import { connect } from 'inferno-redux';

import tasks from '../api/tasks';
import logs from '../api/logs';
import {addActiveTask} from '../global/actions';

class Logs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            logLines: []
        };

        this.handleNewLog = this.handleNewLog.bind(this);
    }

    componentWillMount() {
        if (!this.props.task || this.props.task.id !== this.props.params.taskID) {
            tasks.get(this.props.params.stackID, this.props.params.taskID).then(response => {
                this.props.dispatch(addActiveTask(response));
                logs.start(response.current_instances[0].url, this.handleNewLog);
            }).catch(error => {
                console.error("Error getting stack and task data", error);
            });
        }
    }

    componentWillUnmount() {
        logs.stop();
    }

    handleNewLog(logLine) {
        let newLogLines = [...this.state.logLines, logLine];
        if (newLogLines.length > 100) {
            newLogLines.splice(0, 1);
        }
        this.setState({
            logLines: newLogLines
        });
    }

    render() {
        return (
            <div>
                <h2>{this.props.task ? this.props.task.name : this.props.params.taskID} logs</h2>
                {this.state.logLines.length > 0 ?
                    this.state.logLines.map(logLine => {
                        return <div>{logLine}</div>
                    })
                :
                    <p>No logs to show...</p>
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        task: state.activeTask
    }
}

export default connect(mapStateToProps)(Logs);
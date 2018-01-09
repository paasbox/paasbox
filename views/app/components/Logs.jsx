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

        this.fetchOlderLogs = this.fetchOlderLogs.bind(this);
        this.fetchAllLogs = this.fetchAllLogs.bind(this);
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

    componentDidUpdate() {
        if (this.bottomOfLogs) {
            this.bottomOfLogs.scrollIntoView({behaviour: 'smooth'});
        }
    }

    componentWillUnmount() {
        logs.stop();
    }

    fetchOlderLogs() {
        console.log('hello there');
    }

    fetchAllLogs() {
        const instanceURL = this.props.task.current_instances[0].url;
        logs.getAll(instanceURL).then(response => {
            this.setState({
                logLines: [],
                allLogs: response
            })
        }).catch(error => {
            console.error("Error fetching entire standard out for " + instanceURL, error);
        });
    }

    handleNewLog(logLine) {
        let newLogLines = [...this.state.logLines, logLine];
        if (newLogLines.length > 1000) {
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
                <button type="button" onClick={this.fetchOlderLogs} disabled>Show older logs</button>
                <button type="button" onClick={this.fetchAllLogs}>Show all logs</button>
                <pre className="logs">
                    {this.state.allLogs &&
                        this.state.allLogs
                    }
                    {(!this.state.allLogs && this.state.logLines.length === 0) &&
                        <p>No logs to show...</p>
                    }
                    {this.state.logLines.length > 0 &&
                        <div>
                            {this.state.logLines.map(logLine => {
                                return <div>{logLine}</div>
                            })}
                            <br/>
                            <div ref={el => { this.bottomOfLogs = el; }}>End of logs...</div>
                        </div>
                    }
                </pre>
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
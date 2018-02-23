import Inferno from 'inferno';
import Component from 'inferno-component';
import { connect } from 'inferno-redux';
import { Link } from 'inferno-router';
import { browserHistory } from '../../index';

import tasks from '../api/tasks';
import logs from '../api/logs';
import {addActiveTask} from '../global/actions';

const defaultLogsState = {
    logLines: [],
    offset: undefined,
    allLogs: ""
}

class Logs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            logLines: defaultLogsState.logLines,
            offset: defaultLogsState.offset,
            allLogs: defaultLogsState.allLogs,
            isFetchingAllLogs: false,
            isShowingAllLogs: false,
            isFetchingOlderLogs: false,
            isShowingStdErr: false
        };

        this.fetchOlderLogs = this.fetchOlderLogs.bind(this);
        this.fetchAllLogs = this.fetchAllLogs.bind(this);
        this.handleNewLog = this.handleNewLog.bind(this);
        this.handleAllLogsChange = this.handleAllLogsChange.bind(this);
    }

    componentWillMount() {
        if (this.props.params.logType !== "stderr" && this.props.params.logType !== "stdout") {
            browserHistory.push(`/${this.props.params.stackID}/${this.props.params.taskID}/stdout`);
        }

        if (this.props.params.logType === "stderr") {
            this.setState({isShowingStdErr: true});
        } 
        
        if (this.props.params.logType === "stdout") {
            this.setState({isShowingStdErr: false});
        }

        if (!this.props.task || this.props.task.id !== this.props.params.taskID) {
            tasks.get(this.props.params.stackID, this.props.params.taskID).then(response => {
                this.props.dispatch(addActiveTask(response));
                if (!response.is_started) {
                    return;
                }
                logs.start(response.current_instances[0].url, this.handleNewLog, this.state.isShowingStdErr);
            }).catch(error => {
                console.error("Error getting stack and task data", error);
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.params.logType && nextProps.params.logType !== this.props.params.logType) {
            logs.stop();
        }

        if (nextProps.params.logType === "stderr" && this.props.params.logType === "stdout") {
            logs.start(this.props.task.current_instances[0].url, this.handleNewLog, true);
            this.setState({
                isShowingStdErr: true,
                isShowingAllLogs: false,
                ...defaultLogsState
            });
        }
        
        if (nextProps.params.logType === "stdout" && this.props.params.logType === "stderr") {
            logs.start(this.props.task.current_instances[0].url, this.handleNewLog, false);
            this.setState({
                isShowingStdErr: false,
                isShowingAllLogs: false,
                ...defaultLogsState
            });
        }
    }

    componentDidUpdate() {
        if (this.bottomOfLogs) {
            // this.bottomOfLogs.scrollIntoView({behaviour: 'smooth'});
        }
    }

    componentWillUnmount() {
        if (this.props.task.is_started) {
            logs.stop();
        }
    }

    fetchOlderLogs() {
        const instanceURL = this.props.task.current_instances[0].url;
        const newOffset = this.state.offset - 10;
        this.setState({
            isFetchingOlderLogs: true
        });
        logs.get(instanceURL, newOffset, 10).then(response => {
            this.setState({
                isFetchingOlderLogs: false,
                offset: newOffset
            });
            this.handlePreviousLog(response);
        }).catch(error => {
            this.setState({
                isFetchingOlderLogs: false
            });
            console.error("Error getting older logs for " + instanceURL, error);
        });
    }

    fetchAllLogs() {
        const instanceURL = this.props.task.current_instances[0].url;
        this.setState({
            isFetchingAllLogs: true
        });
        logs.getAll(instanceURL, this.state.isShowingStdErr).then(response => {
            this.setState({
                logLines: [],
                allLogs: response,
                isFetchingAllLogs: false
            })
        }).catch(error => {
            this.setState({
                isFetchingAllLogs: false
            });
            console.error("Error fetching entire " + (this.state.isShowingStdErr ? "standard error" : "standard out") + " for " + instanceURL, error);
        });
    }

    handleAllLogsChange() {
        const isShowingAllLogs = !this.state.isShowingAllLogs;

        this.setState({isShowingAllLogs});

        if (!isShowingAllLogs) {
            this.setState({allLogs: ""});
            logs.stop();
            logs.start(this.props.task.current_instances[0].url, this.handleNewLog, this.state.isShowingAllLogs);
            return;
        }

        this.fetchAllLogs();
    }

    handlePreviousLog(logLine) {
        this.setState({
            logLines: [logLine, ...this.state.logLines]
        })
    }

    handleNewLog(logLine) {
        if (!this.state.offset) {
            this.setState({
                offset: parseInt(logLine.replace('Offset: ', ''))
            });
            return;
        }

        let newLogLines = [...this.state.logLines, logLine];

        if (newLogLines.length > 1000) {
            newLogLines.splice(0, 1);
        }
        this.setState({
            logLines: newLogLines
        });
    }

    renderPorts(task) {
        if (!this.props.task) {
            return "";
        }

        const ports = task.ports;

        if (ports.length === 0) {
            return <p>Port: none</p>
        }

        if (ports.length === 1) {
            return <p>Port: {ports[0]}</p>
        }

        return <p>Ports: {ports.join(", ")}</p>
    }

    renderLogTypeLinks() {
        if (this.state.isShowingStdErr) {
            return (
                <div className="tabs">
                    <h3 className="tabs__item">
                        <Link className="tabs__link" to={`/${this.props.params.stackID}/${this.props.params.taskID}/stdout`}>STD OUT</Link>
                    </h3>
                    <h3 className="tabs__item tabs__item--active">STD ERR</h3>
                </div>
            )
        }

        return (
            <div className="tabs">
                <h3 className="tabs__item tabs__item--active">STD OUT</h3>
                <h3 className="tabs__item">
                    <Link className="tabs__link" to={`/${this.props.params.stackID}/${this.props.params.taskID}/stderr`}>STD ERR</Link>
                </h3>
            </div>
        )
    }

    renderLogLines() {
        return (
            <div>
                <pre className="logs">
                    {this.state.allLogs &&
                        this.state.allLogs
                    }
                    {this.state.isFetchingAllLogs &&
                        <p>Loading all logs...</p>
                    }
                    {(!this.state.allLogs && this.state.logLines.length === 0) &&
                        <p>No logs to show...</p>
                    }
                    {(this.state.logLines.length > 0 && !this.state.isShowingAllLogs) &&
                        <p>Offset: {this.state.offset}</p>
                    }
                    {this.state.logLines.length > 0 &&
                        <div>
                            {this.state.logLines.map(logLine => {
                                return <div>{logLine}</div>
                            })}
                            <br/>
                            <div ref={el => { this.bottomOfLogs = el; }}/>
                        </div>
                    }
                </pre>
            </div>
        )
    }

    render() {
        return (
            <div>
                <h2>{this.props.task ? this.props.task.name : this.props.params.taskID} logs</h2>
                {this.renderPorts(this.props.task)}
                {this.state.isFetchingOlderLogs &&
                    <p>Loading older logs..</p>
                }
                {(this.props.task && this.props.task.is_started) &&
                    <div>
                        {this.renderLogTypeLinks()}
                        {/* <button type="button" onClick={this.fetchOlderLogs} disabled={this.state.isShowingAllLogs}>Show older logs</button> */}
                        <label htmlFor="">Show all logs</label>
                        <input type="checkbox" checked={this.state.isShowingAllLogs} onChange={this.handleAllLogsChange}/>
                        {/* <button type="button" onClick={this.fetchAllLogs}>Show all logs</button> */}
                        {this.renderLogLines()}
                    </div>
                }
                {(this.props.task && !this.props.task.is_started) &&
                    <h3>App isn't started</h3>
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
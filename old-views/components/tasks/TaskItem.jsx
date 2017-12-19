import React, { Component } from 'react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Logs from '../logs/Logs.jsx';

export default class TaskItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasStarted: this.props.task.is_started,
            devMode: this.props.task.dev_mode
        }

        this.bindLogClick = this.bindLogClick.bind(this);
        this.bindStartStopClick = this.bindStartStopClick.bind(this);
        this.bindDevModeClick = this.bindDevModeClick.bind(this);
        this.bindOpenClick = this.bindOpenClick.bind(this);
    }

    bindOpenClick() {
        this.props.handleOpenClick(this.props);
    }

    bindLogClick() {
        this.props.handleLogClick(this.props);
    }

    bindStartStopClick() {
        this.setState({hasStarted: !this.state.hasStarted});
        let callbackData = this.props;
        this.props.task.is_started = this.state.hasStarted;
        this.props.handleStartStopClick(callbackData);
    }

    bindDevModeClick() {
        this.setState({devMode: !this.state.devMode});
        let callbackData = this.props;
        this.props.task.dev_mode = this.state.devMode;
        this.props.handleDevModeClick(callbackData);
    }

    render() {
        const props = this.props;
        return (
            <li>
                <Card>
                    <CardHeader
                        title={`${props.task.name} ${this.state.hasStarted ? "" : "(not running)"} ${this.state.devMode ? "(dev mode)" : ""}`}
                        subtitle={ props.task.ports && props.task.ports.length ? <div>Port: {props.task.ports[0]}</div> : <div>No port provided</div>}
                        actAsExpander={false}
                        showExpandableButton={false}/>
                    <CardActions>
                        <FlatButton label={ props.task.show_logs ? "Hide logs" : "Show logs" } onClick={this.bindLogClick} />
                        <FlatButton label={ this.state.hasStarted ? "Stop app" : "Start app" } onClick={this.bindStartStopClick} />
                        <FlatButton label={ this.state.devMode ? "Stop dev mode" : "Start dev mode" } onClick={this.bindDevModeClick} />
                    </CardActions>
                    { props.task.show_logs && <Logs websocketURL={`ws://${window.location.host}/api${this.props.task.current_instances[0].url}/stdout.ws?tail=y`} />}
                </Card>
            </li>
        )
    }
}
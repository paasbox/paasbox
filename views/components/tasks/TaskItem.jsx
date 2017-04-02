import React, { Component } from 'react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Logs from '../logs/Logs.jsx';

export default class TaskItem extends Component {
    constructor(props) {
        super(props);

        this.bindLogClick = this.bindLogClick.bind(this);
    }

    bindLogClick() {
        this.props.handleLogClick(this.props);
    }

    render() {
        const props = this.props;
        return (
            <li>
                <Card>
                    <CardHeader
                        title={props.task.name}
                        subtitle={ props.task.is_healthy ? "" : "Not running" }
                        subtitleColor={ props.task.is_healthy ? "" : "#E53935" }
                        actAsExpander={true}
                        showExpandableButton={true}/>
                    <CardActions>
                        <FlatButton label="Logs" onClick={this.bindLogClick} />
                        <FlatButton label="Action2" />
                    </CardActions>
                    <CardText expandable={true}>
                        {
                            props.task.ports && props.task.ports.length ?
                                <div>Port: {props.task.ports[0]}</div>
                                :
                                <div>No port provided</div>
                        }
                        {
                            props.task.healthchecks && props.task.healthchecks.length ?
                                <div>Healthy: {(props.task.healthchecks[0].instances && props.task.healthchecks[0].instances[0].healthy) ? `true` : `false`}</div>
                                :
                                <div>No health checks</div>
                        }
                    </CardText>
                    {
                        props.activeTask && props.activeTask.id === props.task.id ?
                            <Logs websocketURL={`ws://${window.location.host}/api${this.props.task.current_instances[0].url}/stdout.ws?tail=y`} />
                            :
                            ""
                    }
                </Card>
            </li>
        )
    }
}
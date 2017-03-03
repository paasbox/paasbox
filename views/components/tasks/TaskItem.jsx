import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Logs from '../logs/Logs.jsx';

export default class TaskItem extends Component {
    constructor(props) {
        super(props);

        this.handleLogClick = this.handleLogClick.bind(this);
    }

    handleLogClick() {
        browserHistory.push(`/${this.props.activeWorkspaceID}/${this.props.task.id}/logs`);
    }

    render() {
        const props = this.props;
        console.log(props);
        return (
            <li>
                <Card>
                    <CardHeader
                        title={props.task.name}
                        actAsExpander={true}
                        showExpandableButton={true}/>
                    <CardActions>
                        <FlatButton label="Logs" onClick={this.handleLogClick} />
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
                        props.activeTask && props.activeTask.id == props.task.id ?
                            <Logs websocketURL={`ws://${window.location.host}/api${this.props.task.current_instances[0].url}/stdout.ws?tail=y`} />
                            :
                            ""
                    }
                </Card>
            </li>
        )
    }
}
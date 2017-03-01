import React, { Component } from 'react';
import { Link } from 'react-router';

export default class TaskItem extends Component {
    render() {
        const props = this.props;
        console.log(props.task);
        return (
            <li>
                <Link to={`/${props.activeWorkspaceID}/${props.task.id}`}> {props.task.name} </Link>
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
            </li>
        )
    }
}
import React, { Component } from 'react';
import { Link } from 'react-router';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

export default class TaskItem extends Component {
    render() {
        const props = this.props;
        console.log(props.task);
        return (
            // <li>
            //     <Link to={`/${props.activeWorkspaceID}/${props.task.id}`}> {props.task.name} </Link>
            //     {
            //         props.task.ports && props.task.ports.length ?
            //             <div>Port: {props.task.ports[0]}</div>
            //             :
            //             <div>No port provided</div>
            //     }
            //     {
            //         props.task.healthchecks && props.task.healthchecks.length ?
            //             <div>Healthy: {(props.task.healthchecks[0].instances && props.task.healthchecks[0].instances[0].healthy) ? `true` : `false`}</div>
            //             :
            //             <div>No health checks</div>
            //
            //     }
            // </li>
            <li>
                <Card>
                    <CardHeader
                        title={props.task.name}
                        actAsExpander={true}
                        showExpandableButton={true}/>
                    <CardActions>
                        <FlatButton label="Action1" />
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
                </Card>
            </li>
        )
    }
}
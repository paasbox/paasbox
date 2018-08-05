import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';

type Props = RouteComponentProps<any>

class TasksController extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        console.log("TasksController props:", props);
    }

    render() {
        return (
            <div>
                <h2>{this.props.match.params.stackID} tasks</h2>
            </div>
        )
    }
}

export default withRouter(connect()(TasksController));
import * as React from "react";
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import logs from "../../utilities/logs";

type Props = RouteComponentProps<any>

class InstanceLogsController extends React.Component<Props> {
    logs: logs
    constructor(props: Props) {
        super(props);

        const params = props.match.params;
        this.logs = new logs({
            stackID: params.stackID,
            taskID: params.taskID,
            instanceID: params.instanceID,
            onMessage: this.handleLogEvent
        });
    }

    componentWillUnmount() {
        this.logs.stop();
    }

    handleLogEvent = (data: object) => {
        console.log("Log event", data);
    }
    
    render() {
        return (
            <div>
                <h1>Logs</h1>
                <p>{this.props.match.params.stackID}</p>
                <p>{this.props.match.params.taskID}</p>
                <p>{this.props.match.params.instanceID}</p>
            </div>
        )
    }
}

export default withRouter(connect()(InstanceLogsController));
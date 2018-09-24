import * as React from "react";
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';

type Props = RouteComponentProps<any>

class LogsController extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }
    
    render() {
        return (
            <div>
                <h1>Logs</h1>
            </div>
        )
    }
}

export default withRouter(connect()(LogsController));
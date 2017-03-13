import React, { Component } from 'react';

export default class Logs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: ""
        };

        let websocket;
    }

    handleData(data) {
        const existingLogs = this.state.logs;
        this.setState({
            logs: existingLogs + data
        });
    }

    componentWillMount() {
        this.websocket = new WebSocket(this.props.websocketURL);

        this.websocket.addEventListener('message', event => {
            this.handleData(event.data);
        });
    }

    componentWillUnmount() {
        console.log('Close websocket for ', this.props.websocketURL);
        this.websocket.close();
    }

    render() {
        return (
            <div className="terminal">
                {this.state.logs}
            </div>
        );
    }
}
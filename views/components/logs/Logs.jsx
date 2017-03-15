import React, { Component } from 'react';
import Ansi from 'ansi-to-react';


export default class Logs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: ""
        };

        let websocket;
    }

    handleData(data) {
        const logs = this.state.logs + '\n' + data;
        this.setState({
            logs: logs
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
                <Ansi>{this.state.logs}</Ansi>
            </div>
        );
    }
}
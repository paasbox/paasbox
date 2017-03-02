import React, { Component } from 'react';
import Websocket from 'react-websocket';

export default class Logs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: ""
        };
    }

    handleData(data) {
        console.log(data);
    }

    render() {
        return (
            <div>
                <Websocket url={this.props.websocketURL}
                           onMessage={this.handleData.bind(this)}/>
            </div>
        );
    }
}
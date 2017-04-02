import React, { Component } from 'react';
import Ansi from 'ansi-to-react';


export default class Logs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: "",
            scrolledToBottom: true,
            bottomScrollPosition: 0
        };

        let websocket;

        this.handleScroll = this.handleScroll.bind(this);
    }

    handleData(data) {
        const logs = this.state.logs + '\n' + data;
        this.setState({
            logs: logs
        });
    }

    handleScroll(event) {
        console.log(event.target.scrollTop);
        console.log(this.state.bottomScrollPosition);
        console.log("-----");
    }

    componentWillMount() {
        this.websocket = new WebSocket(this.props.websocketURL);

        this.websocket.addEventListener('message', event => {
            this.handleData(event.data);
        });
    }

    componentWillUnmount() {
        this.websocket.close();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.logs === this.state.logs) {
            return false;
        }

        return true;
    }

    componentDidUpdate(nextProps) {
        const terminalElement = this.refs.terminal;
        const scrollDiff = terminalElement.scrollHeight - (terminalElement.scrollTop +  terminalElement.offsetHeight);

        this.setState({bottomScrollPosition: terminalElement.scrollTop})

        if (scrollDiff >= 0) {
            terminalElement.scrollTop += (scrollDiff);
        }
    }

    render() {
        return (
            <div className="terminal" ref="terminal" onScroll={this.handleScroll}>
                <Ansi>{this.state.logs}</Ansi>
            </div>
        );
    }
}
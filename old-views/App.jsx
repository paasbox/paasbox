import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from './shared/get';
import { updateStacks, updateActiveStack } from './shared/actions';

import Sidebar from './components/sidebar/Sidebar.jsx'

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isFetchingStacks: false
        }
    }

    componentWillMount() {
        this.setState({isFetchingStacks: true});

        get.stacks().then(response => {
            this.setState({isFetchingStacks: false});
            this.props.dispatch(updateStacks(response));
        });
    }

    findActiveStack(stacks, activeStack) {
        return stacks.find(stack => {
            return stack.id === activeStack;
        });
    }

    shouldComponentUpdate(nextProps) {
        // Getting stacks, don't render
        if (this.state.isFetchingStacks) {
            return false;
        }

        // First time rendering a stack, must set 'activeStack' property in state
        if (!nextProps.activeStack.hasOwnProperty('id') && nextProps.params.stack) {
            const activeStack = this.findActiveStack(nextProps.stacks, nextProps.params.stack);
            nextProps.dispatch(updateActiveStack(activeStack));
            return false;
        }

        // Active stack may have been set before but is changing, update state
        if (nextProps.params.stack && (nextProps.params.stack !== this.props.params.stack)) {
            const activeStack = this.findActiveStack(nextProps.stacks, nextProps.params.stack);
            nextProps.dispatch(updateActiveStack(activeStack));
            return false;
        }

        return true;
    }

    render() {
        return (
            this.state.isFetchingStacks ?
                <p>Fetching stacks...</p>
                :
                <div>
                    <Sidebar activeStack={this.props.params.stack} />
                    {this.props.children}
                </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        stacks: state.state.stacks,
        activeStack: state.state.activeStack
    }
}

export default connect(mapStateToProps)(App);
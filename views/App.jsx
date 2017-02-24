import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from './shared/get';
import { updateWorkspaces } from './shared/actions';

class App extends Component {

    componentWillMount() {
        get.workspace().then(response => {
            this.props.dispatch(updateWorkspaces(response));
        });
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}

export default connect()(App);
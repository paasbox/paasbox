import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from './shared/get';
import { updateWorkspaces, updateActiveWorkspace } from './shared/actions';

import Sidebar from './components/sidebar/Sidebar.jsx'

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isFetchingWorkspaces: false
        }
    }

    componentWillMount() {
        this.fetchWorkspaces(() => {
            const activeWorkspace = this.findActiveWorkspace(this.props.params.workspace);
            if (activeWorkspace) {
                this.props.dispatch(updateActiveWorkspace(activeWorkspace));
            }
        });
    }

    fetchWorkspaces(callback) {
        this.setState({isFetchingWorkspaces: true});

        get.workspaces().then(response => {
            this.setState({isFetchingWorkspaces: false});
            this.props.dispatch(updateWorkspaces(response));
            callback();
        });
    }

    findActiveWorkspace(activeWorkspace) {
        return this.props.workspaces.find(workspace => {
            return workspace.id === activeWorkspace;
        });
    }

    shouldComponentUpdate() {
        return !this.state.isFetchingWorkspaces;
    }

    render() {
        return (
            this.state.isFetchingWorkspaces ?
                <p>Fetching workspaces...</p>
                :
                <div>
                    <Sidebar />
                    {this.props.children}
                </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        workspaces: state.state.workspaces
    }
}

export default connect(mapStateToProps)(App);
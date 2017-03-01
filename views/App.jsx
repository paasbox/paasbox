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
        this.setState({isFetchingWorkspaces: true});

        get.workspaces().then(response => {
            this.setState({isFetchingWorkspaces: false});
            this.props.dispatch(updateWorkspaces(response));
        });
    }

    findActiveWorkspace(workspaces, activeWorkspace) {
        return workspaces.find(workspace => {
            return workspace.id === activeWorkspace;
        });
    }

    shouldComponentUpdate(nextProps) {
        // Getting workspaces, don't render
        if (this.state.isFetchingWorkspaces) {
            return false;
        }

        // First time rendering a workspace, must set 'activeWorkspace' property in state
        if (!nextProps.activeWorkspace.hasOwnProperty('id') && nextProps.params.workspace) {
            const activeWorkspace = this.findActiveWorkspace(nextProps.workspaces, nextProps.params.workspace);
            nextProps.dispatch(updateActiveWorkspace(activeWorkspace));
            return false;
        }

        // Active workspace may have been set before but is changing, update state
        if (nextProps.params.workspace && (nextProps.params.workspace !== this.props.params.workspace)) {
            const activeWorkspace = this.findActiveWorkspace(nextProps.workspaces, nextProps.params.workspace);
            nextProps.dispatch(updateActiveWorkspace(activeWorkspace));
            return false;
        }

        return true;
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
        workspaces: state.state.workspaces,
        activeWorkspace: state.state.activeWorkspace
    }
}

export default connect(mapStateToProps)(App);
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'

class RedirectToWorkspace extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const workspaces = this.props.workspaces;
        browserHistory.push(`/${workspaces[0].id}`)

    }

    render() {
        return <p>Loading tasks...</p>
    }
}

function mapStateToProps(state) {
    return {
        workspaces: state.state.workspaces
    }
}

export default connect(mapStateToProps)(RedirectToWorkspace);
import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from '../../shared/get';
import { updateWorkspaces } from '../../shared/actions';

import WorkspaceList from './WorkspacesList.jsx';

class WorkspacesController extends Component {

     constructor(props) {
         super(props);

         this.state = {
             isFetchingWorkspaces: false
         }
     }

    componentWillMount() {
        this.setState({isFetchingWorkspaces: true});

        get.workspace().then(response => {
            this.setState({isFetchingWorkspaces: false});
            this.props.dispatch(updateWorkspaces(response));
        });
    }

    shouldComponentUpdate() {
        return !this.state.isFetchingWorkspaces;
    }

    render() {
         return (
             this.state.isFetchingWorkspaces ?
                 <p>Loading workspaces...</p>
                :
                 <WorkspaceList workspaces={this.props.workspaces} />
         )
    }
}

function mapStateToProps(state) {
    return {
        workspaces: state.workspaces
    }
}

export default connect(mapStateToProps)(WorkspacesController);
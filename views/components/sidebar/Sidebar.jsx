import React, { Component } from 'react';
import { connect } from 'react-redux';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import WorkspaceController from './WorkspacesController.jsx'

class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {open: true};
    }

    handleToggle = () => this.setState({open: !this.state.open});

    render() {
        return (
            <div>
                <Drawer open={this.state.open}>
                    <WorkspaceController/>
                </Drawer>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        workspaces: state.workspaces
    }
}

export default connect(mapStateToProps)(Sidebar);
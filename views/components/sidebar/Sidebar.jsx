import React, { Component } from 'react';
import { connect } from 'react-redux';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Workspaces from './Workspaces.jsx';

class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {open: true};
    }

    handleToggle = () => this.setState({open: !this.state.open});

    render() {
        return (
            <Drawer open={this.state.open}>
                <div className="logo">
                    <img src="/images/logo.jpg" alt="Paasbox logo"/>
                </div>
                <Workspaces workspaces={this.props.workspaces} />
            </Drawer>
        );
    }
}

function mapStateToProps(state) {
    return {
        workspaces: state.state.workspaces
    }
}

export default connect(mapStateToProps)(Sidebar);
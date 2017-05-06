import React, { Component } from 'react';
import { connect } from 'react-redux';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Stacks from './Stacks.jsx';

class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {open: true};
    }

    handleToggle = () => this.setState({open: !this.state.open});

    shouldComponentUpdate(nextProps) {
        if (nextProps.activeStack !== this.props.activeStack) {
            return false;
        }

        return true;
    }

    render() {
        return (
            <Drawer open={this.state.open}>
                <div className="logo">
                    <img src="/images/logo.jpg" alt="Paasbox logo"/>
                </div>
                <Stacks {...this.props} />
            </Drawer>
        );
    }
}

function mapStateToProps(state) {
    return {
        stacks: state.state.stacks
    }
}

export default connect(mapStateToProps)(Sidebar);
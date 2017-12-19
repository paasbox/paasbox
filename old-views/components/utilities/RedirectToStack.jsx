import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'

class RedirectToStack extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const stacks = this.props.stacks;
        browserHistory.push(`/${stacks[0].id}`)

    }

    render() {
        return <p>Loading tasks...</p>
    }
}

function mapStateToProps(state) {
    return {
        stacks: state.state.stacks
    }
}

export default connect(mapStateToProps)(RedirectToStack);
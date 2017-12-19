import Inferno from 'inferno';
import Component from 'inferno-component';
import { connect } from 'inferno-redux';

import stacks from './api/stacks';
import {addStacks} from './global/actions';
import Stacks from './components/Stacks'

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFetchingWorkspaces: false
        }
    }

    componentWillMount() {
        if (this.props.stacks.length === 0) {
            this.setState({isFetchingWorkspaces: true});
            stacks.getAll().then(response => {
                this.setState({isFetchingWorkspaces: false});
                this.props.dispatch(addStacks(response.stacks));
            }).catch(error => {
                this.setState({isFetchingWorkspaces: false});
                console.error("Error fetching all stacks on app mount", error);
            });
        }
    }

    render() {
        return (
            <div>
                <h1>Paasbox</h1>
                {this.state.isFetchingWorkspaces ?
                    <p>Loading...</p>
                :
                    <Stacks/>
                }
                {this.props.children}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        stacks: state.stacks
    }
}

export default connect(mapStateToProps)(App);
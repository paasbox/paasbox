import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '../../reducer';
import { Stack } from '../../utilities/types';
import Stacks from './Stacks';
import Loader from '../../components/loader/Loader';

interface ReduxProps {
    stacks: Array<Stack>,
    isFetchingStacks: boolean
}

class StacksController extends React.Component<ReduxProps> {
    constructor(props: ReduxProps) {
        super(props);
    }

    render() {
        console.log(this.props);
        return (
            <div>
                <h2>Stacks</h2>
                {this.props.isFetchingStacks ?
                    <Loader />
                :
                    <Stacks stacks={this.props.stacks}/>
                }
            </div>
        )
    }
}


function mapStateToProps(state: State): ReduxProps {
    return {
        stacks: state.stacks.all.items,
        isFetchingStacks: state.stacks.all.isBeingFetched
    }
}

export default connect<ReduxProps>(mapStateToProps)(StacksController);
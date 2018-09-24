import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps, Route, withRouter } from 'react-router-dom';

import { State } from '../../reducer';
import { Stack } from '../../utilities/types';
import Stacks from './Stacks';
import Loader from '../../components/loader/Loader';
import TasksController from '../tasks/TasksController';
import { addActiveStack } from '../../utilities/actions';

interface ReduxProps {
    stacks: Array<Stack>,
    isFetchingStacks: boolean
}

interface DispatchProps {
    addActiveStack: (stack: Stack) => void
}

type Props = ReduxProps & DispatchProps & RouteComponentProps<any>

class StacksController extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    componentDidUpdate(prevProps: Props) {
        // if (this.props.match.params.stackID !== prevProps.match.params.stackID) {
        //     this.props.addActiveStack({
        //         id: this.props.match.params.stackID,
        //         name: ""
        //     });
        // }
    }

    render() {
        return (
            <div>
                <h2>Stacks</h2>
                {this.props.isFetchingStacks ?
                    <Loader />
                :
                    <div>
                        <Stacks stacks={this.props.stacks} stackPath={this.props.match.url}/>
                        <Route path={`${this.props.match.url}/:stackID`} component={TasksController}/>
                    </div>
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

function mapDispatchToProps(dispatch: Redux.Dispatch): DispatchProps {
    return {
        addActiveStack: (stack: Stack) => dispatch(addActiveStack(stack))
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StacksController));
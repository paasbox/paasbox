import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, Route, withRouter } from 'react-router-dom';

import { State } from '../../reducer';
import { Stack } from '../../utilities/types';
import Stacks from './Stacks';
import Loader from '../../components/loader/Loader';
import TasksController from '../tasks/TasksController';

interface ReduxProps {
    stacks: Array<Stack>,
    isFetchingStacks: boolean
}

type Props = ReduxProps & RouteComponentProps<any>

class StacksController extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
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

export default withRouter<any>(connect<ReduxProps>(mapStateToProps)(StacksController));
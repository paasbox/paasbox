import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import './App.css';
import API from './utilities/api';
import { Stack, APIStacks } from './utilities/types';
import { addStacks, setIsFetchingStacks } from './utilities/actions';
import { State } from './reducer';
import Mapper from './utilities/mapper';

interface ReduxProps {
    stacks: Array<Stack>
}

interface DispatchProps {
    addStacks: (stacks: Array<Stack>) => void,
    setIsFetchingStacks: (isFetching: boolean) => void
}

type Props = ReduxProps & DispatchProps;

class App extends React.Component<Props> {
    async componentWillMount() {
        this.props.setIsFetchingStacks(true);
        const response: APIStacks = await API.getAllStacks();
        const stacks: Array<Stack> = response.stacks.map(stack => Mapper.stackResponse(stack));
        this.props.addStacks(stacks);
        this.props.setIsFetchingStacks(false);
    }

    render() {
        return (
            <div>
                <h1>PaasBox</h1>
                {this.props.children}
            </div>
        )
    }
}

function mapStateToProps(state: State): ReduxProps {
    return {
        stacks: state.stacks.all.items
    }
}

function mapDispatchToProps(dispatch: Redux.Dispatch): DispatchProps {
    return {
        addStacks: (stacks: Array<Stack>) => dispatch(addStacks(stacks)),
        setIsFetchingStacks: (isFetching: boolean) => dispatch(setIsFetchingStacks(isFetching))
    }
}

export default withRouter<any>(connect<ReduxProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(App));
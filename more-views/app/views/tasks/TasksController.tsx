import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Task, APITasks, Stack, APIStacks } from '../../utilities/types';
import { State } from '../../reducer';
import { setIsFetchingTasks, addTasks, setIsFetchingStacks, addStacks, addActiveStack, emptyTasks } from '../../utilities/actions';
import API from '../../utilities/api';
import Mapper from '../../utilities/mapper';
import Loader from '../../components/loader/Loader';
import TaskItem from './TaskItem';

interface ReduxProps {
    tasks: Array<Task>,
    stacks: Array<Stack>,
    activeStack: Stack,
    isFetchingTasks: boolean
}

interface DispatchProps {
    addTasks: (tasks: Array<Task>) => void,
    setIsFetchingTasks: (isFetching: boolean) => void,
    emptyTasks: () => void,
    addStacks: (stacks: Array<Stack>) => void,
    setIsFetchingStacks: (isFetching: boolean) => void,
    addActiveStack: (stack: Stack) => void
}

type Props = ReduxProps & DispatchProps & RouteComponentProps<any>

class TasksController extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    async componentWillMount() {
        this.updateStack(this.props.match.params.stackID);
    }

    // componentWillReceiveProps(nextProps: Props) {
    //     if (this.props.match.params.stackID !== nextProps.match.params.stackID) {
    //         this.props.emptyTasks();
    //         this.updateStack(nextProps.match.params.stackID);
    //     }
    // }

    componentDidUpdate(prevProps: Props) {
        if (this.props.match.params.stackID !== prevProps.match.params.stackID) {
            // this.props.emptyTasks();
            this.updateStack(this.props.match.params.stackID);
        }
    }

    updateStack = async (stackID: string) => {
        let stacks: Array<Stack> = this.props.stacks;

        // Fetch the stacks just in case we don't have them - we should have them, unless this component
        // gets rendered at the same time as or before the app has handled the initial fetch of the stacks
        if (!stacks) {
            this.props.setIsFetchingStacks(true);
            const stacksResponse: APIStacks = await API.getAllStacks();
            const fetchedStacks: Array<Stack> = stacksResponse.stacks.map(stack => Mapper.stackResponse(stack));
            stacks = fetchedStacks;
            this.props.addStacks(fetchedStacks);
            this.props.setIsFetchingStacks(false);
        }

        this.props.setIsFetchingTasks(true);

        const activeStack: Stack = stacks.find(stack => stack.id === stackID);
        this.props.addActiveStack(activeStack);

        const response: APITasks = await API.getStackTasks(stackID);
        const tasks: Array<Task> = response.tasks.map(task => Mapper.taskResponse(task));
        this.props.addTasks(tasks);
        this.props.setIsFetchingTasks(false);
    }

    renderTasks() {
        if (this.props.tasks.length === 0) {
            return <p>No tasks running ¯\_(ツ)_/¯</p>
        }
        return this.props.tasks.map(task => (
            <TaskItem key={task.id} {...task}/>
        ));
    }

    render() {
        return (
            <div>
                {this.props.activeStack ?
                    <h2>{this.props.activeStack.name}</h2>
                    :
                    <h2>{this.props.match.params.stackID}</h2>
                }
                {!this.props.isFetchingTasks && this.props.tasks ?
                    this.renderTasks()
                :
                    <Loader/>
                }
            </div>
        )
    }
}

function mapStateToProps(state: State): ReduxProps {
    return {
        tasks: state.tasks.all.items,
        stacks: state.stacks.all.items,
        activeStack: state.stacks.active ? state.stacks.active.item : undefined,
        isFetchingTasks: state.tasks.all.isBeingFetched
    }
}

function mapDispatchToProps(dispatch: Redux.Dispatch): DispatchProps {
    return {
        addTasks: (tasks: Array<Task>) => dispatch(addTasks(tasks)),
        setIsFetchingTasks: (isFetching: boolean) => dispatch(setIsFetchingTasks(isFetching)),
        emptyTasks: () => dispatch(emptyTasks()),
        addStacks: (stacks: Array<Stack>) => dispatch(addStacks(stacks)),
        setIsFetchingStacks: (isFetching: boolean) => dispatch(setIsFetchingStacks(isFetching)),
        addActiveStack: (stack: Stack) => dispatch(addActiveStack(stack))
    }
}

export default withRouter<any>(connect(mapStateToProps, mapDispatchToProps)(TasksController));
import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import API from '../../utilities/api';
import { APIInstance, Instance, Task } from '../../utilities/types';
import { addCurrentInstancesDetails, setIsFetchingCurrentInstancesDetails } from '../../utilities/actions';
import Mapper from '../../utilities/mapper';
import { State } from '../../reducer';
import TaskInstance from './TaskInstance';

interface CallerProps {
    taskID: string
    instanceIDs: string[]
}

interface ReduxProps {
    task: Task
}

interface DispatchProps {
    addCurrentInstancesDetails: (instances: Instance[], taskID: string) => void,
    setIsFetchingCurrentInstancesDetails: (isFetching: boolean, taskID: string) => void
}

type Props = ReduxProps & CallerProps & DispatchProps & RouteComponentProps<any>

class TaskInstancesController extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    componentWillMount = async () => {
        console.log("MOUNT!", this.props.match.params.stackID);
        this.props.setIsFetchingCurrentInstancesDetails(true, this.props.taskID);
        const responses: APIInstance[] = await Promise.all(this.props.instanceIDs.map(instanceID => (
            API.getTaskInstance(this.props.match.params.stackID, this.props.taskID, instanceID)
        ))).catch(error => {
            console.error("Error fetching details for current instances", this.props.taskID, error);
            return [];
        });
        const instances: Instance[] = responses.map(response => Mapper.instanceResponse(response));
        this.props.setIsFetchingCurrentInstancesDetails(false, this.props.taskID);
        this.props.addCurrentInstancesDetails(instances, this.props.taskID);
    }

    renderTaskInstance(task: Task) {
        return task.current_instances_details.map(instance => (
            <TaskInstance
                key={`${task.id}-instance-${instance.id}`}
                onToggleInstanceIsRunning={() => {}}
                instance={{
                    id: instance.id,
                    isRunning: instance.isRunning,
                    logsURI: `/muffins`
                }}
            />
        ))
    }

    render() {
        const task = this.props.task;
        return (
            <div>
                {(task.current_instances_details && task.current_instances_details.length > 0) &&
                    this.renderTaskInstance(task)
                }
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: Redux.Dispatch): DispatchProps => ({
    addCurrentInstancesDetails: (instances: Instance[], taskID: string) => dispatch(addCurrentInstancesDetails(instances, taskID)),
    setIsFetchingCurrentInstancesDetails: (isFetching: boolean, taskID: string) => dispatch(setIsFetchingCurrentInstancesDetails(isFetching, taskID))
});

const mapStateToProps = (state: State, props: Props): ReduxProps => ({
    task: state.tasks.all.items.find(item => item.id === props.taskID)
});

export default withRouter<any>(connect(mapStateToProps, mapDispatchToProps)(TaskInstancesController));
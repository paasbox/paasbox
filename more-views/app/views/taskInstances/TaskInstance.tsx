import * as React from 'react';
import { NavLink } from 'react-router-dom';

type Instance = {
    id: string,
    isRunning: boolean,
    logsURI: string,
}

export type Props = {
    onToggleInstanceIsRunning: (event: React.MouseEvent<HTMLButtonElement>, instanceID: string) => void,
    instance: Instance,
}

export default class TaskInstance extends React.Component<Props> {
    constructor(props: Props) {
        super(props)
    }

    renderInstanceActions(instance: Instance) {
        return (
            <div>
                <button type="button" onClick={(event: React.MouseEvent<HTMLButtonElement>) => this.props.onToggleInstanceIsRunning(event, instance.id)}>{instance.isRunning ? "Stop" : "Start"}</button>
                <NavLink to={instance.logsURI}>Logs</NavLink>
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.renderInstanceActions(this.props.instance)}
            </div>
        )
    }
}
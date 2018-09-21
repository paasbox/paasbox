import * as React from 'react';
import { Link } from 'react-router-dom';
import { Task } from '../../utilities/types';

type Props = Task;

class TaskItem extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    renderPorts() {
        if (this.props.ports.length === 0) {
            return "";
        }

        return (
            <div>
                <p>Ports: </p>
                <ul>
                    {this.props.ports.map(port => (
                        <li key={`${this.props.id}-port-${port}`}>{port}</li>
                    ))}
                </ul>
            </div>
        )
    }

    render() {
        return (
            <div>
                <h3>{this.props.name}</h3>
                {this.props.is_service &&
                    <p>Service</p>
                }
                {this.props.ports &&
                    this.renderPorts()
                }
            </div>
        )
    }
}

export default TaskItem
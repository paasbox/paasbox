import * as React from 'react';
import { Task, Healthcheck, HealthcheckInstance } from '../../utilities/types';
import "./task.css";

type Props = Task;

enum HealthStatus {
    mixed = 'mixed',
    neutral = 'neutral',
    failed = 'failed',
    passed = 'passed'
}

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
                <p>Port{this.props.ports.length > 1 && "s"}: </p>
                <ul className="ports">
                    {this.props.ports.map(port => (
                        <li key={`${this.props.id}-port-${port}`}>{port}</li>
                    ))}
                </ul>
            </div>
        )
    }

    renderHealthStatus() {
        return this.props.healthchecks.map((healthcheck: Healthcheck, index: number) => (
            <span key={`${this.props.id}-healthcheck-${index}`}>
                {healthcheck.instances}
            </span>
        )); 
    }

    getHealth(instanceIndex: number): HealthStatus {
        if (!this.props.healthchecks || this.props.healthchecks.length === 0) {
            return HealthStatus.neutral;
        }

        let passedChecks: number = 0;

        for (const healthcheck of this.props.healthchecks) {
            if (healthcheck.instances[instanceIndex].healthy) {
                passedChecks++
            }
        }

        if (passedChecks === 0) {
            return HealthStatus.failed;
        }

        if (passedChecks === this.props.healthchecks.length) {
            return HealthStatus.passed;
        }

        if (passedChecks > 0) {
            return HealthStatus.mixed;
        }
    }

    renderInstancesStatus() {
        const instances = [];
        for (let index = 0; index < this.props.instances; index++) {
            const healthStatus: HealthStatus = this.getHealth(index);
            let instance;
            switch (healthStatus) {
                case HealthStatus.neutral: {
                    instance = (
                        <div key={`instance-status-${index}`}>No healthchecks</div>
                    )
                    break;
                }
                case HealthStatus.passed: {
                    instance = (
                        <div key={`instance-status-${index}`}>Healthy</div>
                    )
                    break;
                }
                case HealthStatus.failed: {
                    instance = (
                        <div key={`instance-status-${index}`}>Unhealthy</div>
                    )
                    break;
                }
                case HealthStatus.mixed: {
                    instance = (
                        <div key={`instance-status-${index}`}>Some instances unhealthy</div>
                    )
                    break;
                }
            }
            instances.push(instance);
        }

        return instances;
    }

    render() {
        return (
            <div>
                <h3>{this.props.name}</h3>
                {this.props.is_service &&
                    <p>Service</p>
                }
                {(this.props.instances > 0 && this.props.current_instances) &&
                    this.renderInstancesStatus() 
                }
                {/* {(this.props.healthchecks && this.props.healthchecks.length > 0) ?
                    this.renderHealthStatus()
                :
                    <p>No healthchecks</p>
                } */}
                {this.props.ports &&
                    this.renderPorts()
                }
            </div>
        )
    }
}

export default TaskItem
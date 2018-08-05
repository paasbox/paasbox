import * as React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Stack } from '../../utilities/types';

interface ParentProps {
    stacks: Array<Stack>,
    stackPath: string
}

class Stacks extends React.Component<ParentProps> {
    constructor(props: ParentProps) {
        super(props);
    }

    render() {
        if (!this.props.stacks || this.props.stacks.length === 0) {
            return `No stacks running ¯\\_(ツ)_/¯`;
        }

        return (
            <ul>
                {this.props.stacks.map(stack => (
                    <li key={stack.id}>
                        <Link to={`${this.props.stackPath}/${stack.id}`}>{stack.name}</Link>
                    </li>
                ))}
            </ul>
        )
    }
}

export default Stacks
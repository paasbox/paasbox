import * as React from 'react';
import { Stack } from '../../utilities/types';

interface ParentProps {
    stacks: Array<Stack>
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
                    <li key={stack.id}>{stack.name}</li>
                ))}
            </ul>
        )
    }
}

export default Stacks
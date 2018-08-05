import * as React from 'react';
import './Loader.css';

interface ParentProps {
    small?: boolean
}

const defaultProps: ParentProps = {
    small: false
}

export default class Loader extends React.Component<ParentProps> {
    constructor(props: ParentProps = defaultProps) {
        super(props);
    }

    render() {
        return(
            <div className={`loader ${this.props.small ? " loader--small" : ""}`}>
                Loading...
                <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
            </div>
        )
    }
}
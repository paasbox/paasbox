import Inferno from 'inferno';
import Component from 'inferno-component';
import { connect } from 'inferno-redux';
import { Link } from 'inferno-router';

class Stacks extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {this.props.stacks.map(stack => {
                    return (
                        <div>
                            <Link activeClass="active" to={`/${stack.id}`}>{stack.name}</Link>
                        </div>
                    )
                })}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        stacks: state.stacks
    }
}

export default connect(mapStateToProps)(Stacks);
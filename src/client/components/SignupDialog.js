import React from 'react'
import Dialog from 'react-bootstrap/lib/Modal'
import SignupForm from './SignupForm'

export default class SignupDialog extends React.Component {
	state = {
		opened: false
	};

	open = () => {
		this.setState({opened: true});
	};

	close = () => {
		this.setState({opened: false});
	};

	render() {
		return (
			<div className={`singin-dialog-container ${this.props.className}`}>
				<a onClick={this.open}>Sign UP!</a>
				<Dialog show={this.state.opened} onHide={this.close}>
					<SignupForm className="dialog" onAuth={(ans) => {
						if (ans['auth'] === 1) {
							this.close();
							window.location.reload()
						}
					}} />
				</Dialog>
			</div>
		)
	}
}
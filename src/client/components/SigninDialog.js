import 'whatwg-fetch'
import React from 'react'
import Dialog from 'react-bootstrap/lib/Modal'
import SigninForm from './SigninForm'

export default class SigninDialog extends React.Component {
	state = {
		opened: false
	};

	open = () => {
		this.setState({opened: true});
	};

	close = () => {
		this.setState({opened: false});
	};

	quit = () => {
		fetch('/api/auth/quit', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
			},
			body: `cnf=1`
		})
			.then((ans) => ans.json())
			.then((json) => {
				window.location.reload()
			});
	};

	render() {
		return (
			<div className={`singin-dialog-container ${this.props.className}`}>
				{!this.props.session.ok && <span>
					<a onClick={this.open}>SignIn</a>
					<Dialog show={this.state.opened} onHide={this.close}>
						<SigninForm className="dialog" onAuth={(ans) => {
							if (ans['auth'] === 1) {
								this.close();
								window.location.reload()
							}
						}}/>
					</Dialog>
				</span>}
				{this.props.session.ok && <span>
					<a onClick={this.quit}>QUIT</a>
				</span>}
			</div>
		)
	}
}
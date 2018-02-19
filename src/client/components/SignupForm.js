import React from 'react'
import 'whatwg-fetch'
import Subscribe from '../utils/subscriber'
import Button from 'react-bootstrap/lib/Button'

export default class SignupForm extends Subscribe {
	state = {
		name: '',
		ident: '',
		pwd: '',
		sending: false,
		error: false
	};

	handleSubmit = (ev) => {
		ev.preventDefault();

		const name = this.state.name.trim();
		const ident = this.state.ident.trim();
		const pwd = this.state.pwd;

		if (name.length > 0 && ident.length > 0 && pwd.length > 0) {
			this.setState({
				sending: true,
				error: false
			});

			fetch('/api/auth/signup', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
				},
				body: `ident=${encodeURIComponent(ident)}&pwd=${encodeURIComponent(pwd)}&name=${encodeURIComponent(name)}`
			})
				.then((ans) => ans.json())
				.then((json) => {
					if (json.auth === 1) {
						this.publish('login', json)
					}

					this.setState({
						sending: false,
						error: false
					});

					if (typeof this.props.onAuth === 'function') {
						this.props.onAuth(json);
					}
				})
				.catch((err) => {
					console.warn('SignUp fetch fail', err.message);
					this.setState({
						sending: false,
						error: true
					});
				})
		}
	};

	handleChange = (ev) => {
		const targ = ev.target;
		const name = targ.name;
		if (!name || name === '') return;

		this.setState({
			[name]: targ.value
		});
	};

	render() {
		return (
			<div className={`signup ${this.props.className}`}>
				<form action="/api/auth/signup" onSubmit={this.handleSubmit}>
					<div className="form__label">Name</div>
					<div className="form__control">
						<input type="text" name="name" onChange={this.handleChange} />
					</div>
					<div className="form__label">E-Mail</div>
					<div className="form__control">
						<input type="text" name="ident" onChange={this.handleChange} />
					</div>
					<div className="form__label">Password</div>
					<div className="form__control">
						<input type="password" name="pwd" onChange={this.handleChange} />
					</div>
					<div className="form__control alignHor">
						<Button bsStyle="success" type="submit">
							Sign Up!
						</Button>
					</div>
				</form>
			</div>
		)
	}
}
import React from 'react'
import 'whatwg-fetch'
import Subscribe from '../utils/subscriber'

export default class SignIn extends Subscribe {
	state = {
		ident: '',
		pwd: '',
		sending: false
	};

	handleSubmit = (ev) => {
		ev.preventDefault();
		console.info('submit', this.state);

		const login = this.state.ident.trim();
		const pwd = this.state.pwd;

		console.info('submit2', login, pwd);

		if (login.length > 0 && pwd.length > 0) {
			this.setState({
				sending: true,
				error: false
			});

			fetch('/api/auth', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
				},
				body: `ident=${encodeURIComponent(login)}&pwd=${encodeURIComponent(pwd)}`
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
					console.warn('SignIn fetch fail', err.message);
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

		console.info('change for', name, 'with', targ.value);

		this.setState({
			[name]: targ.value
		});
	};

	render() {
		return (
			<div className={`signin ${this.props.className}`}>
				<form action="/api/auth" onSubmit={this.handleSubmit}>
					<div className="signin__ident">
						<input type="text" name="ident" onChange={this.handleChange}/>
					</div>
					<div className="signin__pwd">
						<input type="password" name="pwd" onChange={this.handleChange}/>
					</div>
					<div>
						<button type="submit">
							Log in
						</button>
					</div>
				</form>
			</div>
		)
	}
}
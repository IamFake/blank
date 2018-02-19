import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import {Link, Route, Switch} from 'react-router-dom'
import {Provider} from 'react-redux'

import Header from './Header'
import Footer from './Footer'
import SigninDialog from "./SigninDialog";
import SignupDialog from "./SignupDialog";

export default class App extends React.Component {
	constructor(props) {
		super(props);
		if (!this.props.session) {
			this.props.session = {
				ok: false
			};
		}
	}

	static propTypes = {
		store: PropTypes.object.isRequired,
		routeMap: PropTypes.object.isRequired
	};

	render() {
		const store = this.props.store.getStore();

		return (
			<Provider store={store}>
				<div className="app">
					<div className="app-wrap">
						<Helmet>
							<title>Magellan SP#1</title>
							<link href="https://fonts.googleapis.com/css?family=Special+Elite" rel="stylesheet"/>
							<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400&subset=cyrillic"
								  rel="stylesheet"/>
							<link rel="stylesheet"
								  href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
								  integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
								  crossorigin="anonymous"/>
							<link rel="stylesheet"
								  href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css"
								  integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp"
								  crossorigin="anonymous"/>
						</Helmet>
						<Header>
							<Link to="/" className="header__menu__item">Main</Link>
							<Link to="/about" className="header__menu__item">About</Link>
							<Link to="/blog" className="header__menu__item">Blog</Link>
							<SigninDialog className="inl header__menu__item" session={this.props.session}/>
							{!this.props.session.ok && <SignupDialog className="inl header__menu__item"/>}
						</Header>
						<div className="app-body">
							<Switch>
								<Route exact path="/" component={this.props.routeMap.Home}/>
								<Route path="/about"
									   render={() => (<this.props.routeMap.About session={this.props.session}/>)}/>
								<Route path="/blog" component={this.props.routeMap.Blog}/>
								<Route path="/adm" component={this.props.routeMap.Adm}/>
								<Route>
									<h1>HIz! +)</h1>
								</Route>
							</Switch>
						</div>
					</div>
					<Footer>
						Magellan #1 project. React, Redux, Webpack, ES6 and etc...
					</Footer>
				</div>
			</Provider>
		)
	}
}

import React from 'react'
import MetaModule from '../../components/spec/MetaModule'
import {connect} from 'react-redux'
import {Helmet} from 'react-helmet'
import {Route, Switch} from 'react-router-dom'
import * as Actions from './actions'
import {routesMap} from '../routes'
import {withMetaRouter} from '../../components/spec/MetaComponent'
import Nav from 'react-bootstrap/lib/Nav'
import NavItem from 'react-bootstrap/lib/NavItem'
import {LinkContainer} from 'react-router-bootstrap'

const initialState = {};

class Admin extends MetaModule {
	locationListener = null;
	storeListener = null;

	about = null;

	constructor(props) {
		super(props);
		this.about = withMetaRouter('adm/about', this.props.storeRef);
	}

	componentDidMount() {
		// let storeListenerPageValue = this.props.storeRef.store.getState()[this.props.componentName][this.pageident];
		// this.storeListener = this.props.storeRef.store.subscribe(() => {
		// 	console.info('ADMIN STORE CHANGE SUBSCRIPTION');
		// 	const state = this.props.storeRef.store.getState();
		//
		// 	const prevValue = storeListenerPageValue;
		// 	storeListenerPageValue = state[this.props.componentName]['reqpageid'];
		//
		// 	console.info('ADMIN STORE CHANGE', prevValue, storeListenerPageValue);
		// 	if (prevValue !== storeListenerPageValue) {
		// 		// super.pageLoader(Actions.actionLoadPageEmit)
		// 	}
		// });
		// this.locationListener = this.props.locSubscribe((loc) => {
		// 	console.info('ADMIN LOCATION CHANGE', loc);
		// 	setTimeout(() => {
		// 		// this.props.dispatch(Actions.actionLocationChangedEmit(loc))
		// 	}, 0)
		// })
	}

	componentWillUnmount() {
		if (this.locationListener) {
			this.locationListener();
			this.locationListener = null;
		}
		if (this.storeListener) {
			this.storeListener();
			this.storeListener = null;
		}
	}

	render() {
		return (
			<div className="admin">
				<Helmet>
					<title>Admin pannel</title>
				</Helmet>
				<div className="admin__pannel-list">
					<Nav stacked bsStyle="pills">
						<LinkContainer to="/adm" exact key={0}>
							<NavItem className="admin__pannel-list-item" eventKey={0}>
								Dashboard
							</NavItem>
						</LinkContainer>
						{routesMap((index, module) => (
							<LinkContainer to={`/${this.props.componentName}/${index}`} key={index}>
								<NavItem eventKey={index}>
									{module.name}
								</NavItem>
							</LinkContainer>
						), this.props.componentName)}
					</Nav>
				</div>
				<div className="admin__pannel-content">
					<Switch>
						<Route path="/adm/about" component={this.about}/>
						<Route path="/adm/blog" render={() => (<div>1111</div>)}/>
						<Route>
							<div>Not realized yet...</div>
						</Route>
					</Switch>
				</div>
			</div>
		)
	}
}

export function reducer(state = initialState, action) {
	/*if (action.type === Actions.ACTION_LOADPAGE) {
		return Object.assign({}, state, {
			pageid: action.pageid,
			data: action.data
		});
	} else if (action.type === Actions.ACTION_LOCCHANGE) {
		return Object.assign({}, state, {
			loc: action.loc,
			reqpageid: action.reqpageid
		});
	} else */if (state === null) {
		return Object.assign({}, initialState);
	}

	return state;
}

const connected = connect(
	state => {
		return {
			...state["adm"]
		};
	},
	dispatch => {
		return {
			dispatch
		};
	}
)(Admin);

export function entry() {
	return connected;
}

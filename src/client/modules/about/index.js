import React from 'react'
import MetaModule from '../../components/spec/MetaModule'
import {connect} from 'react-redux'
import {Helmet} from 'react-helmet'
import {NavLink} from 'react-router-dom'
import * as Actions from './actions'

const initialState = {
	data: {},
	list: null,
	pageid: 0,
	reqpageid: 0,
	loc: {}
};

class About extends MetaModule {
	locationListener = null;
	storeListener = null;

	constructor(...args) {
		super(...args);
	}

	bootstrap() {
		super.bootstrap();
		const page = super.pageLoader(Actions.actionLoadPageEmit);
		const list = super.loader(Actions.actionLoadListEmit, 'list');

		return Promise.all([page, list])
	}

	componentDidMount() {
		let storeListenerPageValue = this.props.storeRef.store.getState()[this.props.componentName][this.pageident];
		this.storeListener = this.props.storeRef.store.subscribe(() => {
			const state = this.props.storeRef.store.getState();

			const prevValue = storeListenerPageValue;
			storeListenerPageValue = state[this.props.componentName]['reqpageid'];

			if (prevValue !== storeListenerPageValue) {
				super.pageLoader(Actions.actionLoadPageEmit)
			}
		});
		this.locationListener = this.props.locSubscribe((loc) => {
			setTimeout(() => {
				this.props.dispatch(Actions.actionLocationChangedEmit(loc))
			}, 0)
		})
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
			<div className="about">
				<Helmet>
					<title>About module</title>
				</Helmet>
				{this.props.session.ok && <div className="about__sidecontrols__admin-button">
					<NavLink
						to={`/adm/${this.props.componentName}/edit/${this.props.data && this.props.data.id}`}/>
				</div>}
				<div className="about__pannel_central">
					<h1>
						{this.props.data && this.props.data.title}
					</h1>
					<div className="about__content" dangerouslySetInnerHTML={{
						__html: this.props.data && this.props.data.text
					}}>
					</div>
				</div>
				<div className="about__pannel_right">
					{this.props.list && this.props.list.map((item) => {
							if (!item.id) return '';

							return (
								<div className={`about__list-item${item.path === this.props.pageid ? ' selected' : ''}`}
									 key={item.id}>
									{
										item.path === this.props.pageid ?
											<span className="about__list-item--current">{item.title}</span>
											:
											<NavLink to={`/${this.props.componentName}/${item.path}`}>
												{item.title}
											</NavLink>
									}
								</div>
							)
						}
					)}
				</div>
				<button onClick={() => this.props.onButtonClick('pr1')}>Press {this.props.buttonTitle}!</button>
			</div>
		)
	}
}

export function reducer(state = initialState, action) {
	if (action.type === Actions.ACTION_LOADPAGE) {
		return Object.assign({}, state, {
			pageid: action.pageid,
			data: action.data
		});
	} else if (action.type === Actions.ACTION_LOADLIST) {
		return Object.assign({}, state, {
			list: action.list
		});
	} else if (action.type === Actions.ACTION_LOCCHANGE) {
		return Object.assign({}, state, {
			loc: action.loc,
			reqpageid: action.reqpageid
		});
	} else if (state === null) {
		return Object.assign({}, initialState);
	}

	return state;
}

const connected = connect(
	state => {
		return {
			...state.about
		}
	},
	dispatch => {
		return {
			dispatch
		}
	}
)(About);

export function entry() {
	return connected;
}

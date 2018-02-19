import React from 'react';
import {withRouter} from 'react-router-dom';

let registry = {};

export const withMeta = (componentName, store) => {
	return class MetaComponentObject extends MetaComponent {
		component = componentName;
		store = store;
	}
};

export const withMetaRouter = (componentName, store) => withRouter(withMeta(componentName, store));

export class MetaComponent extends React.Component {
	component = '';
	store = null;
	opts = {};
	args = [];
	historyUnlister = null;
	historyListners = [];

	constructor(props) {
		super(props);

		if (this.state) {
			this.state.rndr = false;
		} else {
			this.state = {
				rndr: false
			};
		}

		this.locationArgsUpdate();
	}

	locationArgsUpdate() {
		let segments = this.props.location && this.props.location.pathname;
		if (segments) {
			segments = segments.split('/');
			this.args = segments.splice(2)
		}
	}

	bootstrap() {
		if (registry[this.component] || this.component === '') return;

		let im = import(/* webpackChunkName: '[request]' */`../../modules/${this.component}`);
		if (this.props.staticContext) {
			this.bootstrapResolve(im);
		} else {
			im.then(mod => this.bootstrapResolve(mod));
			return im;
		}
	}

	bootstrapResolve(mod) {
		registry[this.component] = {
			entry: mod.entry,
			reducer: mod.reducer,
			component: mod.default || mod
		};
		this.setState({rndr: true});
	}

	componentWillMount() {
		this.bootstrap();
	}

	componentDidMount() {
		if (this.props.history) {
			this.historyUnlister = this.props.history.listen((loc, act) => {
				this.locationChanged(loc, act)
			});
		}
	}

	componentWillUnmount() {
		if (this.historyUnlister) {
			this.historyUnlister()
		}
	}

	locationChanged(loc, act) {
		this.historyListners.forEach((client) => client(loc, act))
	}

	locationSubscribe = (fn) => {
		this.historyListners.push(fn);
		return () => {
			this.locationUnsubscribe(fn)
		}
	};

	locationUnsubscribe(fn) {
		this.historyListners = this.historyListners.filter((subscriber) => subscriber !== fn)
	};

	static getComponent(name) {
		return registry[name];
	}

	render() {
		this.locationArgsUpdate();
		const opts = this.opts;

		let Component;
		let source = registry[this.component];
		if (!source) return null;

		if (source.entry) {
			if (!this.context.bootstrap || this.context.ssr) {
				if (!source.reducer || typeof source.reducer !== 'function') {
					console.warn('MetaComponent(' + this.component + ') exports entry() but not reducer() for main reducer');
				} else {
					this.store.queueReducer(this.component, source.reducer);
					this.store.applyReducers();
				}
			}

			Component = source.entry(this.args, this.store);
		} else {
			Component = source.component;
		}

		if (!Component) return null;

		return <Component
			{...opts}
			args={this.args}
			storeRef={this.store}
			componentName={this.component}
			bootstrapStage={this.context.bootstrap}
			locSubscribe={this.locationSubscribe}
			history={this.props.history}
			session={this.props.session}
		/>
	}
}

export default MetaComponent;
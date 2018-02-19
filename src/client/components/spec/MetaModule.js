import React from 'react'
import PropTypes from 'prop-types'

if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

class MetaModule extends React.Component {
	___bootstrapDone = false;
	___loadRegistry = null;

	pageident = 'pageid';

	static propTypes = {
		args: PropTypes.array,
		storeRef: PropTypes.object.isRequired,
		componentName: PropTypes.string.isRequired,
		bootstrapStage: PropTypes.bool
	};

	bootstrap() {
		this.___bootstrapDone = true;
	}

	componentWillMount() {
		if (!this.___bootstrapDone) {
			this.bootstrap()
		}
	}

	willMount() {
		this.componentWillMount()
	}

	pageLoader(actionCreator) {
		let page = this.props.args[0];
		if (!page || page === '') {
			page = 'index';
		}

		const state = this.props.storeRef.store.getState();
		if (this.context.ssr || (state && state[this.props.componentName] && state[this.props.componentName][this.pageident] !== page)) {
			return this.props.storeRef.store.dispatch(actionCreator(page));
		}

		return Promise.resolve(true)
	}

	loader(actionCreator, branch, ...rest) {
		const storeIdent = this.props.componentName + '/' + branch;

		const state = this.props.storeRef.store.getState();
		let branchState = this.props.storeRef.get(storeIdent);
		let value = null;

		if (state && state[this.props.componentName] && state[this.props.componentName][branch]) {
			value = state[this.props.componentName][branch];
			if (Array.isArray(value) && value.length === 0) {
				value = null;
			} else if (typeof value === 'object' && Object.keys(value).length === 0) {
				value = null;
			} else if (value.length === 0) {
				value = null;
			}
		}

		if (this.context.bootstrap && value !== null) {
			branchState = true;
			this.props.storeRef.set(storeIdent, true);
		}

		if (this.context.ssr || !branchState) {
			const ir = this.props.storeRef.store.dispatch(actionCreator(...rest));
			this.props.storeRef.set(storeIdent, true);
			return ir;
		}
	}
	
	loaderRegistryFlush(branch) {
		this.props.storeRef.unset(this.props.componentName + '/' + branch);
	}
}

export default MetaModule
import {applyMiddleware, createStore} from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import createReducer from './create-reducer'

const middleware = [thunk, logger];

class Store {
	store = null;
	reducers = {};
	initialState = {};
	cntCurr = 0;
	cntLast = 0;

	cache = {};

	constructor(initialState) {
		this.initialState = initialState;
	}

	initStore(initialState) {
		if (initialState) {
			this.initialState = initialState;
		}

		this.store = createStore(
			createReducer({...this.reducers}),
			this.initialState,
			applyMiddleware(...middleware)
		);

		this.cntLast = this.cntCurr;
	}

	getStore() {
		return this.store;
	}

	queueReducer(name, metaReducer) {
		if (this.reducers[name] === metaReducer) {
			return
		}

		this.cntCurr++;
		this.reducers[name] = metaReducer;
	}

	applyReducers() {
		if (!this.store) {
			console.info("Redux store is not initialized, implicit initialization follow...");
			this.initStore();
		}
		if (this.cntCurr !== this.cntLast) {
			this.store.replaceReducer(createReducer(this.reducers));
			this.cntLast = this.cntCurr;
		}
	}

	removeReducer(name) {
		if (!this.store) {
			console.info("Redux store is not initialized, implicit initialization follow...");
			this.initStore();
		}

		if (this.reducers[name]) {
			this.cntCurr++;
			delete this.reducers[name];
			this.store.replaceReducer(createReducer(this.reducers));
		}
	}

	get(key) {
		return this.cache[key]
	}

	set(key, value) {
		this.cache[key] = value
	}

	unset(key) {
		this.set(key, null)
	}
}

export default function configureStore(initialState) {
	return new Store(initialState);
}

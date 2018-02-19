import {combineReducers} from 'redux';

const baseReducer = (state = {}, action) => {
	return state;
};

function isObjectEmpty(obj) {
	return Object.keys(obj).length === 0 && obj.constructor === Object
}

export default function createReducer(metaReducers = {}) {
	let base = {};
	if (isObjectEmpty(metaReducers)) {
		base = {baseReducer}
	} else {
		base = {
			...metaReducers
		}
	}

	return combineReducers(base);
}
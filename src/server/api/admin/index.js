import * as Models from '../../models'
import config from '../../config'

export async function run(params, req) {
	try {
		if (!(params.stack instanceof Array)) params.stack = [];

		let specifier = params.stack && params.stack[0];
		if (!specifier || specifier === '') {
			specifier = 'index';
		}

		return {}
	} catch (e) {

	}
}
import * as Apis from '../../server/api'
import srvconfig from '../../server/config'
import Pathmatch from 'path-match'

const routeMatch = Pathmatch({
	sensitive: false,
	strict: false,
	end: false
})(srvconfig.misc.apiMatchMask);

export default class Query {
	query = '';
	params = {};

	constructor(query, props) {
		this.query = query;
		this.params = props;
	}

	get() {
		let ans = '';

		const params = routeMatch(this.query);
		if (Apis[params['module']]) {
			ans = Apis[params['module']].run(params, {});
		}

		if (ans.then) {
			return ans.then((mid) => {
				return {data: mid}
			})
		} else {
			return new Promise((resolve, reject) => {
				resolve({data: ans})
			})
		}
	}
}
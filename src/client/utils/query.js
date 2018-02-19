import Query from './query_wrap_server'

class QueryHelper {
	instance = null;
	query = '';

	constructor(query, props) {
		this.query = query;
		this.instance = new Query(query, props);
	}

	get(cb) {
		return this.instance.get().then((ans) => {
			cb(ans.data);
		})
	}
}

export default function (query, props) {
	return new QueryHelper(query, props);
}
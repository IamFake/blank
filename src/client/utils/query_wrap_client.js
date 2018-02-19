import Axios from 'axios'

export default class Query {
	query = '';
	params = {};

	constructor(query, props) {
		this.query = query;
		this.params = props;
	}

	get() {
		return Axios.get(this.query)
	}
}
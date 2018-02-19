import React from 'react'
import MetaModule from '../../../components/spec/MetaModule'
import {connect} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import * as Actions from './actions'
import Button from 'react-bootstrap/lib/Button'
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Radio from 'react-bootstrap/lib/Radio'
import Media from 'react-bootstrap/lib/Media'
import {LinkContainer} from 'react-router-bootstrap'
import Editor from '../../../components/Editor'
import Axios from 'axios'
import {convertToRaw} from 'draft-js'
import Query from '../../../utils/query'

const initialState = {
	pageid: 0,
	data: null
};

class Adm_About extends MetaModule {
	state = {
		edit: false,
		create: false
	};

	bootstrap() {
		super.bootstrap();
		const list = super.loader(Actions.actionLoadListEmit, 'list');

		return Promise.all([list])
	}

	updatePagesList() {
		super.loaderRegistryFlush('list');
		super.loader(Actions.actionLoadListEmit, 'list')
	}

	render() {
		console.log(this.props.history);
		let pagesList = [];
		if (this.props.list instanceof Array && this.props.list.length > 0) {
			pagesList = this.props.list;
		}

		return (
			<div>
				<Switch>
					<Route path="/adm/about/create" render={() => (
						<Adm_AboutEdit history={this.props.history}/>
					)}/>
					<Route path="/adm/about/edit/:aid" render={({match}) => (
						<Adm_AboutEdit history={this.props.history} match={match} updatePages={::this.updatePagesList}/>
					)}/>
					<Route path="/adm/about">
						<React.Fragment>
							<LinkContainer to="/adm/about/create">
								<Button>
									Create
								</Button>
							</LinkContainer>
							<Media.List>
								{pagesList.map(litem => (
									<Media.ListItem key={litem.id} onClick={() => {
										this.props.history && this.props.history.push('/adm/about/edit/' + litem.id)
									}}>
										<Media.Body>
											<Media.Heading>
												{litem.title}
											</Media.Heading>
											<div>
												{litem.desc}
											</div>
										</Media.Body>
									</Media.ListItem>
								))}
							</Media.List>
						</React.Fragment>
					</Route>
				</Switch>
			</div>
		)
	}
}

class Adm_AboutEdit extends React.Component {
	nodeForm = null;
	nodeEditor = null;

	constructor() {
		super(...arguments);

		this.state = {
			hash: '',
			data: {
				id: 0,
				title: '',
				desc: ''
			},
			edit: false,
			active: false
		};

		this.getNewPostHash()
	}

	getNewPostHash() {
		if (this.props.match && this.props.match.params["aid"]) return;
		if (this.state.hash !== '' || this.context.bootstrap) return;

		Query('/api/about/getposthash').get((ans) => {
			this.setState({hash: ans["hex"]})
		})
	}

	loadPageData() {
		Query('/api/about/edit/' + this.props.match.params["aid"]).get((res) => {
			this.setState({
				hash: res["hash"],
				data: res,
				edit: true,
				active: res["active"]
			});
		})
	}

	componentDidMount() {
		if (!this.context || !this.context.bootstrap) {
			if (this.props.match && this.props.match.params["aid"]) {
				this.loadPageData()
			}
		}
	}

	handlerSubmit = (ev) => {
		ev.preventDefault();

		const raw = convertToRaw(this.nodeEditor.getEditorState().getCurrentContent());
		const formData = new FormData(this.nodeForm);
		formData.append('hash', this.state.hash);
		formData.append('editor', JSON.stringify(raw));
		formData.append('edit', this.state.data.id);

		Axios.post('/api/about/save', formData).then((ans) => {
			const update = this.props.updatePages ? this.props.updatePages : null;
			setTimeout(() => {
				update && update()
			});

			this.props.history && this.props.history.push('/adm/about')
		})
	};

	render() {
		return (
			<form className="admin-about__edit-form" onSubmit={this.handlerSubmit} ref={(ref) => {
				this.nodeForm = ref
			}}>
				<div onClick={() => {
					this.props.history && this.props.history.push('/adm/about')
				}}>Close</div>
				<FormGroup>
					<ControlLabel>Title</ControlLabel>
					<FormControl
						type="text"
						name="title"
						value={this.state.data.title}
						onChange={ev => {
							const data = this.state.data;
							data.title = ev.target.value;
							this.setState({data: data})
						}}/>
				</FormGroup>
				<FormGroup>
					<ControlLabel>Active</ControlLabel>
					<FormGroup>
						<Radio
							name="active"
							value={1}
							checked={this.state.active}
							inline
							onChange={ev => {
								this.setState({active: true})
							}}>On</Radio>
						<Radio
							name="active"
							value={0}
							checked={!this.state.active}
							inline
							onChange={ev => {
								this.setState({active: false})
							}}>Off</Radio>
					</FormGroup>
				</FormGroup>
				<FormGroup>
					<ControlLabel>Short desc</ControlLabel>
					<FormControl
						componentClass="textarea"
						name="short"
						value={this.state.data.desc}
						onChange={ev => {
							const data = this.state.data;
							data.desc = ev.target.value;
							this.setState({data: data})
						}}/>
				</FormGroup>
				<FormGroup>
					<ControlLabel>Text</ControlLabel>
					<Editor className="form-control"
							hash={this.state.hash}
							edit={this.state.edit ? this.state.data.draft : null}
							ref={(ref) => {
								this.nodeEditor = ref
							}}/>
				</FormGroup>
				<ButtonGroup>
					<Button type="submit">Save</Button>
				</ButtonGroup>
			</form>
		)
	}
}

export function reducer(state = initialState, action) {
	if (action.type === Actions.ACTION_LOADLIST) {
		return Object.assign({}, state, {
			list: action.list
		})
	} else if (state === null) {
		return Object.assign({}, initialState);
	}

	return state;
}

const connected = connect(
	state => {
		return {
			...state["adm/about"]
		};
	},
	dispatch => {
		return {
			dispatch
		};
	}
)(Adm_About);

export function entry() {
	return connected;
}

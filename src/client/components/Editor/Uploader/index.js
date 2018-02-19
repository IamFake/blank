import React from "react";
import Axios from 'axios'
import Modal from 'react-bootstrap/lib/Modal'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Button from 'react-bootstrap/lib/Button'
import Image from 'react-bootstrap/lib/Image'
import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import {AtomicBlockUtils, EditorState} from "draft-js";

export class UploaderDialog extends React.Component {
	nodeFile = null;

	constructor() {
		super(...arguments);
		this.state = {
			show: !!this.props.show,
			items: []
		};
	}

	componentWillReceiveProps(next) {
		if (next.show !== this.state.show) {
			this.setState({
				show: next.show,
				items: []
			});

			if (next.show) {
				this.getList()
			}
		}
	}

	hide(ev) {
		ev.stopPropagation();
		this.setState({show: false});
		if (typeof this.props.onHide === 'function') {
			this.props.onHide();
		}
	}

	open() {
		this.setState({show: true});
		if (typeof this.props.onShow === 'function') {
			this.props.onShow();
		}
	}

	onSubmit(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		if (!this.props.url || this.props.url === '') return;

		const file = this.nodeFile.files[0];
		if (!file || file === '') return;

		const formData = new FormData();
		formData.append('file', file);
		formData.append('hash', this.props.hash);

		Axios.put(this.props.url, formData)
			.then((res) => {
				const items = this.state.items;
				const newItems: Array = res.data;

				this.setState({items: items.concat(newItems)});
			})
			.catch((err) => {
				console.log('Uploader.onSubmit Axios ERROR', err);
			});
	}

	getList() {
		if (!this.props.hash || this.props.hash === '') {
			return;
		}

		Axios.get(this.props.url + '/getimages/' + this.props.hash)
			.then((res) => {
				const items = this.state.items;
				const newItems = res.data;

				this.setState({items: items.concat(newItems)});
			})
			.catch((err) => {
				console.log("Uploader.getList Axios error", err)
			});
	}

	onImageClick(idx) {
		const conf = this.state.items[idx];
		const editorState = this.props.internals().getEditorState();
		const contentState = editorState.getCurrentContent();

		const newContentState = contentState.createEntity(
			'IMAGE',
			'IMMUTABLE',
			{
				src: conf["items"]["200x150"]["path"],
				orig: conf["items"]["orig"]["path"],
				w300: conf["items"]["300x210"]["path"]
			}
		);

		const ekey = newContentState.getLastCreatedEntityKey();
		const newEditorState = EditorState.set(
			editorState,
			{currentContent: newContentState}
		);

		this.props.internals().setEditorState(AtomicBlockUtils.insertAtomicBlock(newEditorState, ekey, ' '));
		this.props.internals().focus();
	}

	render() {
		return (
			<div onClick={(ev) => {
				ev.stopPropagation()
			}}>
				<Modal show={this.state.show}>
					<Modal.Header>
						<Modal.Title>Uploader</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form onSubmit={::this.onSubmit}>
							<FormGroup>
								<FormControl type="file" multiple={false} inputRef={(ref) => {
									this.nodeFile = ref
								}}/>
							</FormGroup>
							<FormGroup>
								<Button type="submit">Upload</Button>
							</FormGroup>
						</Form>
						<Grid fluid>
							<Row>
								{this.state.items.map((item, idx) => (
									<Col xs={6} md={4} key={item.id}>
										<Image src={item.items["200x150"].path} thumbnail onClick={() => {
											this.onImageClick(idx)
										}}/>
									</Col>
								))}
							</Row>
						</Grid>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={::this.hide}>Close</Button>
					</Modal.Footer>
				</Modal>
			</div>
		)
	}
}
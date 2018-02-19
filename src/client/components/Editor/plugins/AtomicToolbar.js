import React from 'react'
import * as images from "../../../images/editor/index";
import classNames from 'classnames'
import Modal from 'react-bootstrap/lib/Modal'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import FormControl from 'react-bootstrap/lib/FormControl'
import Table from 'react-bootstrap/lib/Table'
import Button from 'react-bootstrap/lib/Button'

export default class AtomicToolbarPlugin extends React.Component {
	static pluginData() {
		return {
			toolbar: AtomicToolbar
		}
	}
}

const getSignificantParent = (node) => {
	if (!node) return null;

	const value = window.getComputedStyle(node, null).getPropertyValue('position');
	if (value !== 'static') {
		return node;
	}

	return getSignificantParent(node.parentNode);
};

class AtomicToolbar extends React.Component {
	optionName = 'alignment';
	node = null;
	styles = {};
	state = {
		alignment: '',
		dialog: '',
		paddings: {}
	};

	positioning() {
		if (this.props.internals().hasSelectedAtomic()) {
			const image = this.props.internals().getSelectedAtomic();
			if (!image) return;
			const parent = getSignificantParent(this.node.parentNode);
			if (!parent) return;

			// sync with image while render, so without state update
			this.state.alignment = image.getOpt(this.optionName);
			this.state.paddings = image.getOpt('paddings');

			const imageRect = image.getBoundingClientRect();
			const parentRect = parent.getBoundingClientRect();

			const nodeWidth = imageRect.right - imageRect.left;
			const nodeHeight = imageRect.bottom - imageRect.top;

			this.styles = {
				position: 'absolute',
				top: ((imageRect.top - parentRect.top) - this.node.clientHeight - 6) + 'px',
				left: ((imageRect.left - parentRect.left) + (nodeWidth / 2) - (this.node.clientWidth / 2)) + 'px'
			};
		} else {
			this.styles = {
				position: 'absolute',
				top: '-99999px',
				left: '-99999px',
				visibility: 'hidden'
			}
		}
	}

	onMouseDown(ev) {
		ev.stopPropagation();

		const target = ev.target;
		if (!target) return;

		const dialog = target.getAttribute("data-dialog");
		if (dialog === 'paddings') {
			this.setState({dialog: dialog});
			return;
		}

		if (this.props.internals().hasSelectedAtomic()) {
			let align = target.getAttribute("data-align");
			if (align === this.state.alignment) {
				align = 'none';
			}

			const atomic = this.props.internals().getSelectedAtomic();
			atomic.setOpt(this.optionName, align, () => {
				this.setState({alignment: align})
			});
		}
	}

	onPadsChange(padds) {
		if (this.props.internals().hasSelectedAtomic()) {
			const atomic = this.props.internals().getSelectedAtomic();
			atomic.setOpt('paddings', padds, () => {
				this.setState({alignment: padds})
			});
		}
	}

	render() {
		this.positioning();
		return (
			<React.Fragment>
				<div style={this.styles}
					 className="atomic-toolbar"
					 ref={(ref) => {
						 this.node = ref
					 }}
					 onMouseDown={::this.onMouseDown}>
					<span className={classNames("toolbar-element", {active: this.state.alignment === "center"})}>
						<img src={images.alignCenter} alt="Align center" title="Align center" data-align="center"/>
					</span>
					<span className={classNames("toolbar-element", {active: this.state.alignment === "left"})}>
						<img src={images.alignLeft} alt="Float left" title="Float left" data-align="left"/>
					</span>
					<span className={classNames("toolbar-element", {active: this.state.alignment === "right"})}>
						<img src={images.alignRight} alt="Float right" title="Float right" data-align="right"/>
					</span>
					<span className={classNames("toolbar-element")}>
						<img src={images.indentIncrease} alt="Paddings" title="Paddings" data-dialog="paddings"/>
					</span>
				</div>
				<PaddingDialog
					show={this.state.dialog === 'paddings'}
					paddings={this.state.paddings}
					onHide={() => {
						this.setState({dialog: ''})
					}}
					onChange={::this.onPadsChange}
				/>
			</React.Fragment>
		);
	}
}

class PaddingDialog extends React.Component {
	constructor() {
		super(...arguments);
		this.state = {
			show: !!this.props.show
		};
	}

	componentWillReceiveProps(next) {
		if (next.show !== this.state.show) {
			this.setState({show: next.show});
		}
	}

	hide() {
		this.setState({show: false});
		if (typeof this.props.onHide === 'function') {
			this.props.onHide();
		}
	}

	show() {
		this.setState({show: true});
		if (typeof this.props.onShow === 'function') {
			this.props.onShow();
		}
	}

	toggle() {
		if (this.state.show) {
			this.hide();
		} else {
			this.show();
		}
	}

	save() {
		const result = {
			top: parseInt(this.props.paddings["top"], 10),
			left: parseInt(this.props.paddings["left"], 10),
			right: parseInt(this.props.paddings["right"], 10),
			bottom: parseInt(this.props.paddings["bottom"], 10)
		};

		if (isNaN(result['top']) || result['top'] < 0) result['top'] = 0;
		if (isNaN(result['left']) || result['left'] < 0) result['left'] = 0;
		if (isNaN(result['right']) || result['right'] < 0) result['right'] = 0;
		if (isNaN(result['bottom']) || result['bottom'] < 0) result['bottom'] = 0;

		if (typeof this.props.onChange === 'function') {
			this.props.onChange(result);
		}

		this.hide();
		return result;
	}

	onChange(ev) {
		const name = ev.target.name;
		this.props.paddings[name] = ev.target.value;
		this.setState({});
	}

	render() {
		if (typeof this.props.paddings['top'] === 'undefined') this.props.paddings['top'] = "";
		if (typeof this.props.paddings['left'] === 'undefined') this.props.paddings['left'] = "";
		if (typeof this.props.paddings['right'] === 'undefined') this.props.paddings['right'] = "";
		if (typeof this.props.paddings['bottom'] === 'undefined') this.props.paddings['bottom'] = "";

		return (
			<Modal
				show={this.state.show}
				backdrop={true}
				keyboard={true}
				dialogClassName="atomic-toolbar-padds-dialog"
				onHide={::this.hide}>
				<Modal.Header closeButton={true}>
					<Modal.Title>
						Atomic Paddings
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Table className="atomic-toolbar-padds-table">
						<tbody>
						<tr>
							<td>&nbsp;</td>
							<td>
								<FormGroup>
									<ControlLabel>Top</ControlLabel>
									<FormControl type="text" placeholder="0"
												 style={{width: '50px', margin: 'auto'}}
												 maxLength={3}
												 value={this.props.paddings.top}
												 name="top"
												 onChange={::this.onChange}/>
								</FormGroup>
							</td>
							<td>&nbsp;</td>
						</tr>
						<tr>
							<td>
								<FormGroup>
									<ControlLabel>Left</ControlLabel>
									<FormControl type="text" placeholder="0"
												 style={{width: '50px', margin: 'auto'}}
												 maxLength={3}
												 value={this.props.paddings.left}
												 name="left"
												 onChange={::this.onChange}/>
								</FormGroup>
							</td>
							<td>&nbsp;</td>
							<td>
								<FormGroup>
									<ControlLabel>Right</ControlLabel>
									<FormControl type="text" placeholder="0"
												 style={{width: '50px', margin: 'auto'}}
												 maxLength={3}
												 value={this.props.paddings.right}
												 name="right"
												 onChange={::this.onChange}/>
								</FormGroup>
							</td>
						</tr>
						<tr>
							<td>&nbsp;</td>
							<td>
								<FormGroup>
									<ControlLabel>Bottom</ControlLabel>
									<FormControl type="text" placeholder="0"
												 style={{width: '50px', margin: 'auto'}}
												 maxLength={3}
												 value={this.props.paddings.bottom}
												 name="bottom"
												 onChange={::this.onChange}/>
								</FormGroup>
							</td>
							<td>&nbsp;</td>
						</tr>
						</tbody>
					</Table>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={::this.hide}>Close</Button>
					<Button bsStyle="primary" onClick={::this.save}>Save changes</Button>
				</Modal.Footer>
			</Modal>
		)
	}
}

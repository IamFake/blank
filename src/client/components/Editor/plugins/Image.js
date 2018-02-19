import 'react-select/dist/react-select.css';
import React from 'react'
import {AtomicBlockUtils, EditorState, SelectionState} from 'draft-js'
import classNames from 'classnames'
import PropTypes from "prop-types";
import * as images from '../../../images/editor/index'
import {UploaderDialog} from '../Uploader/index'

export default class ImagePlugin extends React.Component {
	static pluginData() {
		let lastSelection = null;
		let lastContentState = null;

		return {
			blockRendererFn: function (etype, eopts, atomic, editor) {
				if (etype === 'IMAGE') {
					return <ImageAvatar {...eopts} {...atomic} {...editor} />;
				}
			},
			handleDrop: function (selectionState, dataTransfer, isInternal, editorState, handleEditorChange) {
				const [type, key] = dataTransfer.data.getData('text').split(':');
				if (type !== 'MDBLOCK' || !key || !isInternal) return;

				const contentState = editorState.getCurrentContent();
				const block = contentState.getBlockForKey(key);
				if (block.getType() !== 'atomic') return;

				const newEditorState = AtomicBlockUtils.moveAtomicBlock(
					editorState,
					block,
					selectionState
				);

				handleEditorChange(EditorState.forceSelection(
					newEditorState,
					newEditorState.getCurrentContent().getSelectionAfter()
				));

				return true;
			},
			onChange: function (editorState) {
				let newEditorState = editorState;
				const contentState = newEditorState.getCurrentContent();
				if (!contentState.equals(lastContentState)) {
					lastContentState = contentState;
					return newEditorState;
				}

				const selection = newEditorState.getSelection();
				if (selection.equals(lastSelection)) {
					return newEditorState;
				}

				let key = null;
				if (lastSelection) {
					if (lastSelection.getAnchorKey() !== selection.getAnchorKey()) {
						key = lastSelection.getAnchorKey();
						lastSelection = selection;

						if (ImageAvatar.blockMap[key] && ImageAvatar.blockMap[key].state.selected) {
							newEditorState = EditorState.forceSelection(newEditorState, newEditorState.getSelection())
						}
					}
				}

				lastSelection = selection;

				return newEditorState;
			}
		}
	}

	state = {
		showDialog: false
	};

	onChange() {
		this.setState({showDialog: true});
	}

	render() {
		let className = 'editor__button';
		if (this.props.className) {
			className += ' ' + this.props.className;
		}
		if (this.props.active) {
			className += ' active';
		}

		return (
			<div className={className} onClick={::this.onChange} title={this.props.label}>
				<img src={images.attachments} alt={this.props.label}/>
				<UploaderDialog
					url="/api/about"
					show={this.state.showDialog}
					hash={this.props.hash}
					internals={this.props.internals}
					onHide={() => {
						this.setState({showDialog: false})
					}}
				/>
			</div>
		)
	}
}

class ImageAvatar extends React.Component {
	static blockMap = {};

	static contextTypes = {
		atomicWrapper: PropTypes.func
	};

	imageNode = null;

	constructor() {
		super(...arguments);

		this.state = {
			hover: false,
			selected: false,
			alignment: this.props.alignment ? this.props.alignment : 'none',
			paddings: typeof this.props.paddings === 'object' ? this.props.paddings : {}
		};

		if (this.props.alignment) {
			setTimeout(() => {
				this.context.atomicWrapper().forceUpdate()
			})
		}
	}

	componentWillReceiveProps(next) {
		const selection = this.props.internals().getEditorState().getSelection();
		const keyCurrent = this.props.block.getKey();
		const keySelected = selection.getAnchorKey();

		if (keyCurrent === keySelected) {
			if (!this.state.selected) {
				this.props.internals().setSelectedAtomic(this);
				this.setState({selected: true});
			}
		} else {
			if (this.state.selected) {
				this.props.internals().nullSelectedAtomic(this);
				this.setState({selected: false});
			}
		}
	}

	componentWillMount() {
		ImageAvatar.blockMap[this.props.block.getKey()] = this;
	}

	componentWillUnmount() {
		delete ImageAvatar.blockMap[this.props.block.getKey()];
		if (this.state.selected) {
			this.props.internals().nullSelectedAtomic(this);
		}
	}

	onMouseEnter() {
		this.setState({hover: true});
	}

	onMouseLeave() {
		this.setState({hover: false});
	}

	onClick(ev) {
		if (this.state.selected) {
			this.props.internals().nullSelectedAtomic(this);
			this.setState({selected: !this.state.selected});
		} else {
			this.props.internals().setSelectedAtomic(this);

			const browserSelection = window.getSelection();
			const browserRange = document.createRange();
			browserRange.setStart(this.imageNode.parentNode, 0);
			browserRange.setEnd(this.imageNode.parentNode, 0);
			browserSelection.removeAllRanges();
			browserSelection.addRange(browserRange);

			this.setState({selected: !this.state.selected}, () => {
				this.props.internals().setEditorState(
					EditorState.forceSelection(
						this.props.internals().getEditorState(),
						new SelectionState({
							anchorKey: this.props.block.getKey(),
							anchorOffset: 0,
							focusKey: this.props.block.getKey(),
							focusOffset: 0,
							isBackward: false
						})
					)
				);
			});
		}
	}

	onDragStart(ev) {
		ev.dropEffect = 'move';
		ev.dataTransfer.setData('text', 'MDBLOCK:' + this.props.block.key);
	}

	setOpt(optName, optValue, callback) {
		this.setState({[optName]: optValue}, () => {
			const eState = this.props.internals().getEditorState();
			const cState = eState.getCurrentContent();

			const eKey = this.props.block.getEntityAt(0);

			cState.mergeEntityData(eKey, {[optName]: optValue});

			typeof callback === "function" && callback()
		});
	}

	getBlock() {
		return this.props.block;
	}

	getOpt(optName) {
		return this.state[optName];
	}

	getDomNode() {
		return this.imageNode;
	}

	getBoundingClientRect() {
		return this.imageNode && this.imageNode.getBoundingClientRect();
	}

	render() {
		this.context.atomicWrapper().setOption('alignment', this.state.alignment);
		this.context.atomicWrapper().setOption('paddings', this.state.paddings);

		return (
			<img className={classNames("image-entity",
				{hovered: this.state.hover},
				{selected: this.state.selected}
			)}
				 src={this.props.src}
				 onMouseEnter={::this.onMouseEnter}
				 onMouseLeave={::this.onMouseLeave}
				 onMouseDown={::this.onClick}
				 draggable={true}
				 onDragStart={::this.onDragStart}
				 ref={(ref) => {
					 this.imageNode = ref
				 }}
			/>
		)
	}
}

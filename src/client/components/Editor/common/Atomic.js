import React from "react";
import PropTypes from "prop-types";
import {EditorState, Modifier} from "draft-js";

export class AtomicWrapper extends React.Component {
	outermostNode = null;

	static childContextTypes = {
		atomicWrapper: PropTypes.func
	};

	constructor() {
		super(...arguments);
	}

	getChildContext() {
		return {
			atomicWrapper: () => (
				this
			)
		}
	}

	setOption(name, value) {
		if (!this.outermostNode) return;

		if (name === 'alignment') {
			if (value) {
				if (value === 'center') {
					this.outermostNode.style['float'] = 'none';
					this.outermostNode.style['marginLeft'] = 'auto';
					this.outermostNode.style['marginRight'] = 'auto';
					this.outermostNode.style['textAlign'] = 'center';
				} else if (value === 'none') {
					this.outermostNode.style['float'] = 'none';
					this.outermostNode.style['textAlign'] = 'left';
					this.outermostNode.style['marginLeft'] = '0';
					this.outermostNode.style['marginRight'] = '0';
				} else {
					this.outermostNode.style['float'] = value;
					this.outermostNode.style['textAlign'] = 'left';
					this.outermostNode.style['marginLeft'] = '0';
					this.outermostNode.style['marginRight'] = '0';
				}
			}
		} else if (name === 'paddings') {
			if (value['top'] >= 0) this.outermostNode.style['paddingTop'] = value['top'] + 'px';
			if (value['left'] >= 0) this.outermostNode.style['paddingLeft'] = value['left'] + 'px';
			if (value['right'] >= 0) this.outermostNode.style['paddingRight'] = value['right'] + 'px';
			if (value['bottom'] >= 0) this.outermostNode.style['paddingBottom'] = value['bottom'] + 'px';
		}
	}

	render() {
		return (
			<div className="atomic-wrapper" ref={(ref) => {
				this.outermostNode = ref
			}}>
				{this.props.children}
			</div>
		)
	}
}

export const AtomicComponent = (conf) => (class extends React.Component {
	retired = false;

	constructor() {
		super(...arguments);
	}

	render() {
		const entityKey = this.props.block.getEntityAt(0);
		if (entityKey === null) {
			if (!this.retired) {
				this.retired = true;

				/**
				 * Draft 0.10.5 when deleting atomic with "backspace" - block removed completly, but
				 * when deleting with "delete" button - empty <figure> tag remains in text and can't be removed
				 * with remove-range, so change it type to unstyled
				 **/
				setTimeout(() => {
					const editorState = conf.internals().getEditorState();
					const contentState = editorState.getCurrentContent();

					const newContentState = Modifier.setBlockType(
						contentState,
						contentState.getSelectionAfter(),
						'unstyled'
					);

					conf.internals().setEditorState(
						EditorState.push(editorState, newContentState, 'change-block-type')
					);
				}, 0);
			}
			return null;
		}

		const entity = this.props.contentState.getEntity(entityKey);
		const eopts = entity.getData();
		const etype = entity.getType();

		let result = null;
		const maxItems = conf.entityPipe.length;

		for (let i = 0; i < maxItems; i++) {
			const fn = conf.entityPipe[i];
			result = fn(etype, eopts, this.props, conf);
			if (result) break;
		}

		if (!result) return;
		return result;
	}
});
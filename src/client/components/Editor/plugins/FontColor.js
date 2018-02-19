import React from 'react'
import {colors} from '../data'
import {EditorState, Modifier, RichUtils} from 'draft-js'
import {getSelectedInlineStyles} from '../utils'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper'
import classNames from 'classnames'

export default class FontColor extends React.Component {
	state = {value: ''};

	static pluginData() {
		return {
			styleFn: function (style, block) {
				const name = style.filter((val) => {
					return val.substr(0, 5) === 'FNCL_';
				});
				if (name.size === 0) return;

				const colorMark = '#' + name.first().substr(5);
				if (colors.indexOf(colorMark) === -1) return {};

				return {
					color: colorMark
				}
			}
		}
	}

	onChange(selectedValue) {
		if (!selectedValue || colors.indexOf("#" + selectedValue) === -1) {
			selectedValue = "Default";
		}

		this.setState({value: selectedValue});

		const editorState = this.props.editorState;
		const editorContent = editorState.getCurrentContent();
		const currentStyles = getSelectedInlineStyles(editorState);

		let updatedEditorState = null;

		if (currentStyles.length > 0) {
			const newEditorContent = currentStyles.reduce((state, value) => {
				if (value.substr(0, 5) === "FNCL_") {
					return Modifier.removeInlineStyle(state, editorState.getSelection(), value)
				} else {
					return state;
				}
			}, editorContent);

			const newEditorState = EditorState.push(editorState, newEditorContent, 'change-inline-style');

			if (selectedValue !== 'Default') {
				updatedEditorState = RichUtils.toggleInlineStyle(newEditorState, 'FNCL_' + selectedValue)
			} else {
				updatedEditorState = newEditorState
			}
		} else {
			if (selectedValue !== 'Default') {
				updatedEditorState = RichUtils.toggleInlineStyle(editorState, 'FNCL_' + selectedValue);
			} else {
				updatedEditorState = editorState;
			}
		}

		if (updatedEditorState) {
			this.props.handleEditorChange(updatedEditorState);
		}

		this.props.focus();
	};

	render() {
		const currentInlineStyles = this.props.editorState.getCurrentInlineStyle();
		const currentColor = (currentInlineStyles.find(val => val.substr(0, 5) === "FNCL_") || "").substr(5);

		return (
			<div className="editor__button editor__selector editor__plugin-fontcolor">
				<Dropdown id="font-color-dropdown" bsSize="small" onSelect={::this.onChange}>
					<ColorButton bsRole="toggle" currentColor={currentColor}>Select color...</ColorButton>
					<ColorMenu bsRole="menu"/>
				</Dropdown>
			</div>
		)
	}
};

class ColorButton extends React.Component {
	handleClick(e) {
		e.preventDefault();
		this.props.onClick(e);
	}

	render() {
		const buttonClass = "editor__plugin-fontcolor__toggle";

		let currentColor = this.props.currentColor;
		if (!currentColor || currentColor === '') {
			currentColor = 'fff';
		}

		return (
			<div
				className={classNames(this.props.className, buttonClass)}
				role="button"
				aria-haspopup="true"
				aria-expanded={this.props.open}
				onClick={::this.handleClick}>
				<span className="colorPad" style={{background: "#" + currentColor}}>
					{currentColor === 'fff' && <span className="Select-placeholder">Color</span>}
				</span>
			</div>
		);
	}
}

class ColorMenu extends React.Component {
	handleRootClose(event) {
		this.props.onClose(event, {source: 'rootClose'});
	}

	render() {
		return (
			<RootCloseWrapper
				disabled={!this.props.open}
				onRootClose={::this.handleRootClose}
				event={this.props.rootCloseEvent}>
				<div className="container" style={{display: this.props.open ? 'inline-block' : 'none'}}>
					{(colors || []).map((color) => (
						<span className="colorItem" key={color.substr(1)}>
							<span className="colorPad"
								  style={{background: color}}
								  title={color}
								  onClick={(ev) => {
									  this.props.onSelect(color.substr(1), ev)
								  }}>

							</span>
						</span>
					))}
				</div>
			</RootCloseWrapper>
		)
	}
}

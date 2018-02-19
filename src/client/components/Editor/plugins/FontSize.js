import React from 'react'
import {fontSizes} from '../data'
import {EditorState, Modifier, RichUtils} from 'draft-js'
import {getSelectedInlineStyles} from '../utils'
import Select from 'react-select'
import SelectOption from '../common/SelectOption'

export default class FontSize extends React.Component {
	static pluginData() {
		return {
			styleFn: function (style, block) {
				const name = style.filter((val) => {
					return val.substr(0, 5) === 'SIZE_';
				});
				if (name.size === 0) return;

				const fontSizeMark = parseInt(name.first().substr(5), 10);
				if (isNaN(fontSizeMark) || fontSizes.indexOf(fontSizeMark) === -1) return {};

				return {
					fontSize: fontSizeMark + 'px'
				}
			}
		}
	}

	onChange(selectedValue) {
		if (!selectedValue) {
			selectedValue = 0;
		} else {
			selectedValue = parseInt(selectedValue.value, 10);
			if (isNaN(selectedValue) || fontSizes.indexOf(selectedValue) === -1) selectedValue = 0;
		}

		const editorState = this.props.editorState;
		const editorContent = editorState.getCurrentContent();
		const currentStyles = getSelectedInlineStyles(editorState);

		let updatedEditorState = null;

		if (currentStyles.length > 0) {
			const newEditorContent = currentStyles.reduce((state, value) => {
				if (value.substr(0, 5) === "SIZE_") {
					return Modifier.removeInlineStyle(state, editorState.getSelection(), value)
				} else {
					return state;
				}
			}, editorContent);

			const newEditorState = EditorState.push(editorState, newEditorContent, 'change-inline-style');
			if (selectedValue !== 0) {
				updatedEditorState = RichUtils.toggleInlineStyle(newEditorState, 'SIZE_' + selectedValue)
			} else {
				updatedEditorState = newEditorState
			}
		} else {
			if (selectedValue !== 0) {
				updatedEditorState = RichUtils.toggleInlineStyle(editorState, 'SIZE_' + selectedValue);
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
		const currentSize = parseInt((currentInlineStyles.find(val => val.substr(0, 5) === "SIZE_") || "").substr(5), 10);

		return (
			<Select
				className="editor__button editor__selector editor__plugin-fontsize"
				value={currentSize}
				autosize={false}
				searchable={false}
				placeholder="Select size"
				onChange={::this.onChange}
				optionComponent={SelectOption}
				options={(fontSizes || []).map((size) => ({
					value: size,
					label: (parseInt(size, 10) === 0 ? 'Default' : size + 'px'),
					itemStyle: {
						fontSize: size === 0 ? 'inherit' : size
					}
				}))}
			/>
		)
	}
}

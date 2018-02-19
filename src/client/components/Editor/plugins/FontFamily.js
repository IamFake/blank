import 'react-select/dist/react-select.css';
import React from 'react'
import {fonts} from '../data'
import {EditorState, Modifier, RichUtils} from 'draft-js'
import {getSelectedInlineStyles} from '../utils'
import Select from 'react-select'
import SelectOption from '../common/SelectOption'
import SelectValue from '../common/SelectValue'

export default class FontFamily extends React.Component {
	static pluginData() {
		return {
			styleFn: function (style, block) {
				const name = style.filter((val) => {
					return val.substr(0, 5) === 'FONT_';
				});
				if (name.size === 0) return;

				const fontMark = name.first().substr(5);
				const fontName = fonts[fontMark];
				if (fontName) {
					if (fontName === fonts.Default) {
						return {}
					} else {
						return {
							fontFamily: fontName
						}
					}
				}
			}
		}
	}

	onChange(selectedValue) {
		if (!selectedValue) {
			selectedValue = "Default";
		} else {
			selectedValue = selectedValue.value;
		}

		const editorState = this.props.editorState;
		const editorContent = editorState.getCurrentContent();
		const currentStyles = getSelectedInlineStyles(editorState);

		let updatedEditorState = null;

		if (currentStyles.length > 0) {
			const newEditorContent = currentStyles.reduce((state, value) => {
				if (value.substr(0, 5) === "FONT_") {
					return Modifier.removeInlineStyle(state, editorState.getSelection(), value)
				} else {
					return state;
				}
			}, editorContent);

			const newEditorState = EditorState.push(editorState, newEditorContent, 'change-inline-style');
			if (selectedValue !== 'Default') {
				updatedEditorState = RichUtils.toggleInlineStyle(newEditorState, 'FONT_' + selectedValue)
			} else {
				updatedEditorState = newEditorState
			}
		} else {
			if (selectedValue !== 'Default') {
				updatedEditorState = RichUtils.toggleInlineStyle(editorState, 'FONT_' + selectedValue);
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
		const currentFont = (currentInlineStyles.find(val => val.substr(0, 5) === "FONT_") || "").substr(5);

		return (
			<Select
				className="editor__button editor__selector editor__plugin-fontfamily"
				value={currentFont}
				autosize={false}
				searchable={false}
				placeholder="Select font"
				onChange={::this.onChange}
				optionComponent={SelectOption}
				valueComponent={SelectValue}
				options={Object.keys(fonts).map((font, i) => ({
					value: font,
					label: fonts[font],
					valueStyle: true,
					itemStyle: {
						fontFamily: fonts[font]
					}
				}))}
			/>
		)
	}
}

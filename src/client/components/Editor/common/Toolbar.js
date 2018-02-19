import React from 'react'
import FontFamily from "../plugins/FontFamily";
import FontSize from "../plugins/FontSize";
import FontColor from "../plugins/FontColor";
import Image from "../plugins/Image";
import BasicButton from './BasicButton'
import * as images from "../../../images/editor";

const ToolbarStyles = {
	bold: {icon: images.bold, label: 'B', style: 'BOLD'},
	italic: {icon: images.italic, label: 'I', style: 'ITALIC'},
	underline: {icon: images.underline, label: 'U', style: 'UNDERLINE'},
	code: {icon: images.strike, label: 'M', style: 'CODE'},
	fontFamily: {
		icon: null,
		label: 'font-family',
		style: 'fontFamily',
		component: FontFamily
	},
	fontSize: {
		icon: null,
		label: 'font-size',
		style: 'fontSize',
		component: FontSize
	},
	fontColor: {
		icon: null,
		label: 'font-color',
		style: 'fontColor',
		component: FontColor
	},
	image: {
		icon: null,
		label: 'image',
		style: 'image',
		component: Image
	},
};
const ToolbarBlocks = {
	listOrdered: {icon: images.listOrdered, label: 'OL', style: 'ordered-list-item', blocks: true},
	listUnordered: {icon: images.listUnordered, label: 'UL', style: 'unordered-list-item', blocks: true},
};
const ToolbarMenu = [
	'bold', 'italic', 'underline', 'listOrdered', 'listUnordered', 'fontFamily', 'fontSize', 'fontColor', 'image'
];

const Toolbar = (props) => {
	const edState = props.editorState && props.editorState.getCurrentInlineStyle();
	if (!edState) {
		return null;
	}

	if (!props.focus) {
		props.focus = () => {
		};
	}

	return (
		<div className="editor__toolbar">
			{ToolbarMenu.map((val) => {
				let type = 'inline';
				let T = ToolbarStyles[val];
				if (!T) {
					T = ToolbarBlocks[val];
					type = 'block';
				}
				if (!T) return null;

				if (T.component) {
					return <T.component
						key={T.style}
						label={T.label}
						icon={T.icon}
						active={edState.has(T.style)}
						style={T.style}
						focus={props.focus}
						toggle={type === 'block' ? props.toggleBlocks : props.toggleStyles}
						className={props.className}
						editorState={props.editorState}
						handleEditorChange={props.handleEditorChange}
						internals={props.internals}
						hash={props.hash}
					/>
				} else {
					return (
						<BasicButton
							key={T.style}
							label={T.label}
							icon={T.icon}
							active={edState.has(T.style)}
							style={T.style}
							focus={props.focus}
							toggle={type === 'block' ? props.toggleBlocks : props.toggleStyles}
							className={props.className}
							internals={props.internals}
							hash={props.hash}
						/>
					)
				}
			})}
		</div>
	)
};

export default Toolbar
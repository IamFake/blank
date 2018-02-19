import 'draft-js/dist/Draft.css'
import React from 'react'
import {
	CompositeDecorator,
	convertFromRaw,
	DefaultDraftBlockRenderMap,
	Editor,
	EditorState,
	getDefaultKeyBinding,
	RichUtils
} from 'draft-js'
import FontFamily from './plugins/FontFamily'
import FontSize from './plugins/FontSize'
import FontColor from './plugins/FontColor'
import Image from './plugins/Image'
import AtomicToolbar from './plugins/AtomicToolbar'
import {AtomicComponent, AtomicWrapper} from './common/Atomic'
import Toolbar from './common/Toolbar'
import StatusBar from './common/Statusbar'
import Immutable from 'immutable'

export default class EditorWysiwyg extends React.Component {
	pluginStylesPipe = [];
	pluginDecoratorPipe = [];
	pluginHandleDropPipe = [];
	blockRendererFnPipe = [];
	pluginStatusBarPipe = [];
	pluginOnchangePipe = [];

	draft = null;
	draftInited = false;

	nodeEditor = null;
	nodeStatusSystem = null;
	nodeExternal = null;

	atomicComponentBlank = null;

	atomicSelected = null;

	blockRenderMap = null;

	innerHelpers = {
		getEditorNode: () => (
			this.nodeEditor
		),
		getExternalNode: () => (
			this.nodeExternal
		),
		getStatusSystemNode: () => (
			this.nodeStatusSystem
		),
		setSelectedAtomic: (atomic) => {
			this.atomicSelected = atomic;
			this.nodeStatusSystem && this.nodeStatusSystem.forceUpdate();
		},
		getSelectedAtomic: () => {
			return this.atomicSelected;
		},
		nullSelectedAtomic: (original) => {
			if (this.atomicSelected && this.atomicSelected !== original) return;
			this.atomicSelected = null;
			this.nodeStatusSystem && this.nodeStatusSystem.forceUpdate();
		},
		hasSelectedAtomic: () => {
			return this.atomicSelected !== null;
		},
		setEditorState: ::this.handleEditorChange,
		getEditorState: () => {
			return this.state.editorState
		},
		focus: () => {
			setTimeout(() => {
				this.nodeEditor.focus()
			}, 10)
		}
	};

	constructor() {
		super(...arguments);

		this.state = {
			editorState: null
		};

		this.blockRenderMap = DefaultDraftBlockRenderMap.merge(Immutable.Map({
			atomic: {
				element: 'figure',
				wrapper: <AtomicWrapper/>
			}
		}));

		this.draft = this.props.edit;
		this.atomicComponentBlank = AtomicComponent({
			entityPipe: this.blockRendererFnPipe,
			internals: ::this.internals
		});

		this.pluginRegister(FontFamily);
		this.pluginRegister(FontSize);
		this.pluginRegister(FontColor);
		this.pluginRegister(Image);
		this.pluginRegister(AtomicToolbar);
	}

	componentWillReceiveProps(nextProps) {
		if (!this.draftInited && nextProps.edit) {
			this.draft = nextProps.edit;
			this.draftInited = true;
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.editorState && (this.state.editorState !== nextState.editorState || this.draft);
	}

	getEditorState() {
		return this.state.editorState
	}

	pluginRegister(Plugin) {
		const data = Plugin.pluginData();
		if (typeof data['styleFn'] === 'function') {
			this.pluginStylesPipe.push(data['styleFn'])
		}
		if (typeof data['blockRendererFn'] === 'function') {
			this.blockRendererFnPipe.push(data['blockRendererFn'])
		}
		if (typeof data['handleDrop'] === 'function') {
			this.pluginHandleDropPipe.push(data['handleDrop']);
		}
		if (typeof data['onChange'] === 'function') {
			this.pluginOnchangePipe.push(data['onChange']);
		}
		if (typeof data['decorator'] === 'object') {
			this.pluginDecoratorPipe.push(data['decorator']);
		}
		if (data['toolbar']) {
			this.pluginStatusBarPipe.push(data['toolbar']);
		}
	}

	handleEditorChange(editorState) {
		if (editorState === this.state.editorState) return;

		let editorStateObject = editorState;
		this.pluginOnchangePipe.forEach((plugin) => {
			const temp = plugin(editorStateObject);
			if (!temp) {
				console.log("WARNING wrong return from plugin's onChange", temp, 'for', plugin);
				return;
			}
			editorStateObject = temp;
		});

		this.setState({editorState: editorStateObject});
	};

	toggleStyles(style) {
		this.handleEditorChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
	};

	toggleBlocks(btype) {
		this.handleEditorChange(RichUtils.toggleBlockType(this.state.editorState, btype));
	};

	handleCommand(cmd, edState) {
		const newState = RichUtils.handleKeyCommand(edState, cmd);
		if (newState) {
			this.handleEditorChange(newState);

			return true;
		}

		return false;
	};

	handleTab(ev) {
		const indent = 4;
		this.handleEditorChange(RichUtils.onTab(ev, this.state.editorState, indent));
	};

	customStyleFn(style, block) {
		let styles = {};
		this.pluginStylesPipe.forEach(plug => {
			const result = plug(style, block);
			if (result) {
				Object.assign(styles, result)
			}
		});

		if (Object.getOwnPropertyNames(styles).length > 0) {
			return styles
		}
	}

	handleKeyFn(key) {
		if (!this.state) return;
		return getDefaultKeyBinding(key)
	}

	blockRendererFn(contentBlock) {
		if (contentBlock.getType() === 'atomic') {
			return {
				editable: false,
				component: this.atomicComponentBlank
			};
		}
	}

	handleDropFn(selectionState, dataTransfer, isInternal) {
		let result = null;
		const maxItems = this.pluginHandleDropPipe.length;

		for (let i = 0; i < maxItems; i++) {
			const fn = this.pluginHandleDropPipe[i];
			result = fn(
				selectionState,
				dataTransfer,
				isInternal,
				this.state.editorState,
				::this.handleEditorChange
			);
			if (result) break;
		}

		if (!result) return 'not-handled';
		return 'handled';
	}

	handleFocus() {
		this.innerHelpers.nullSelectedAtomic();
		this.nodeStatusSystem && this.nodeStatusSystem.forceUpdate();
	}

	internals() {
		return this.innerHelpers;
	}

	render() {
		if (this.draft) {
			let draftState = null;
			try {
				draftState = JSON.parse(this.draft);
			} catch (e) {
				console.log("Editor Render DRAFT state JSON.parse error", e.message, this.props.edit);
			}

			this.draft = null;
			if (draftState) {
				let decorators = null;
				if (this.pluginDecoratorPipe.length > 0) {
					decorators = CompositeDecorator(this.pluginDecoratorPipe)
				}
				this.state.editorState = EditorState.createWithContent(convertFromRaw(draftState), decorators)
			}
		}

		if (this.state.editorState === null) {
			if (this.pluginDecoratorPipe.length > 0) {
				this.state.editorState = EditorState.createEmpty(CompositeDecorator(this.pluginDecoratorPipe));
			} else {
				this.state.editorState = EditorState.createEmpty();
			}
		}

		let className = 'editor__container';
		if (this.props.className) {
			className += ' ' + this.props.className;
		}

		return (
			<div className={className} style={{position: 'relative'}}>
				<Toolbar
					editorState={this.state.editorState}
					handleEditorChange={::this.handleEditorChange}
					toggleStyles={::this.toggleStyles}
					toggleBlocks={::this.toggleBlocks}
					focus={() => {
						setTimeout(() => {
							this.nodeEditor.focus()
						}, 10)
					}}
					internals={::this.internals}
					hash={this.props.hash}
				/>
				<div className="editor__content">
					<Editor
						editorState={this.state.editorState}
						onChange={::this.handleEditorChange}
						onTab={::this.handleTab}
						handleKeyCommand={::this.handleCommand}
						keyBindingFn={::this.handleKeyFn}
						customStyleFn={::this.customStyleFn}
						blockRendererFn={::this.blockRendererFn}
						blockRenderMap={this.blockRenderMap}
						handleDrop={::this.handleDropFn}
						onFocus={::this.handleFocus}
						ref={(ref) => {
							this.nodeEditor = ref
						}}
					/>
					<StatusBar
						pluginStatusBarPipe={this.pluginStatusBarPipe}
						internals={::this.internals}
						ref={(ref) => {
							this.nodeStatusSystem = ref
						}}
						hash={this.props.hash}
					/>
				</div>
			</div>
		)
	}
}

import {convertFromRaw, DefaultDraftBlockRenderMap, DefaultDraftInlineStyle, EditorState} from 'draft-js'
import {getPluginsData} from '../../client/components/Editor/plugins'
import Immutable from 'immutable'

let pluginsRegistry: Array = [];

export function convertToHTML(raw: Object) {
	const contentState = convertFromRaw(raw);
	const editorState = EditorState.createWithContent(contentState);

	const forest = [];
	const blocks = contentState.getBlockMap();
	const entities = contentState.getEntityMap();
	blocks.forEach((blk) => {
		let tree = editorState.getBlockTree(blk.getKey()).toJS();

		const entitiesList = [];
		const chars = blk.getCharacterList();
		chars.forEach((char, idx) => {
			const key = char.getEntity();
			if (key !== null) {
				entitiesList.push({
					offset: idx,
					length: 1,
					key
				})
			}
		});

		const block = {
			key: blk.getKey(),
			type: blk.getType(),
			text: blk.getText(),
			data: blk.getData().toJS(),
			tree: tree.map((range) => {
				range["leaves"] = range["leaves"].map((chunk) => {
					chunk["styles"] = blk.getInlineStyleAt(chunk.start).toJS();
					return chunk
				});

				return range;
			}),
			entityRanges: entitiesList
		};

		forest.push(block)
	});

	pluginsRegistry = getPluginsData();

	const html = [];
	forest.forEach((block) => {
		if (block.type === 'atomic') {
			html.push(atomicBlock(block, contentState));
		} else {
			html.push(defaultBlock(block));
		}
	});

	return html.join('')
}

function atomicBlock(block, contentState) {
	if (!(block["entityRanges"] instanceof Array)) return '';

	const html = [];
	const childsHtml = [];

	const htmlElement = DefaultDraftBlockRenderMap.get(block.type);
	if (!htmlElement || htmlElement === '') {
		console.log("Bad htmlElement for block", block.type, htmlElement, block);
		return '';
	}

	const singleAtomic = block["entityRanges"].length === 1 && block["entityRanges"][0].length === 1;
	let atomicStyles = [];

	block["entityRanges"].forEach((entityObject) => {
		const entityKey = entityObject["key"];
		const entity = contentState.getEntity(entityKey);

		if (entity["type"] === "IMAGE") {
			// minimum 9 symbols because http://x.y = 10
			if (entity["data"]["src"].length < 10) return;

			const localStyles = ["display: block"];
			if (entity["data"]) {
				if (entity["data"]["alignment"] && entity["data"]["alignment"] !== "none") {
					if (entity["data"]["alignment"] === "center") {
						// localStyles.push("margin-left: auto; margin-right: auto");
						localStyles.push("text-align: center");
					} else {
						localStyles.push("float: " + entity["data"]["alignment"]);
					}
				}
				if (entity["data"]["paddings"]) {
					if (entity["data"]["paddings"]["top"] > 0)
						localStyles.push("padding-top: " + entity["data"]["paddings"]["top"] + "px");
					if (entity["data"]["paddings"]["left"] > 0)
						localStyles.push("padding-left: " + entity["data"]["paddings"]["left"] + "px");
					if (entity["data"]["paddings"]["right"] > 0)
						localStyles.push("padding-right: " + entity["data"]["paddings"]["right"] + "px");
					if (entity["data"]["paddings"]["bottom"] > 0)
						localStyles.push("padding-bottom: " + entity["data"]["paddings"]["bottom"] + "px");
				}
			}

			if (singleAtomic) {
				atomicStyles = atomicStyles.concat(localStyles);
				childsHtml.push(`<img src="${entity["data"]["src"]}" />`)
			} else {
				childsHtml.push(`<img src="${entity["data"]["src"]}" style="${localStyles.join('; ')}" />`)
			}
		}
	});

	html.push(`<${htmlElement.element}${atomicStyles.length > 0 ? ' style="' + atomicStyles.join('; ') + '"' : ''}>`);
	html.push(childsHtml.join(''));
	html.push(`</${htmlElement.element}>`);

	return html.join('')
}

function defaultBlock(block) {
	const html = [];

	const htmlElement = DefaultDraftBlockRenderMap.get(block.type);
	if (!htmlElement || htmlElement === '') {
		console.log("Bad htmlElement for block", block.type, htmlElement, block);
		return '';
	}

	html.push(`<${htmlElement.element}>`);

	block["tree"].forEach((subblock) => {
		const localText = block.text.substr(subblock.start, (subblock.end - subblock.start));

		subblock["leaves"].forEach((chunk) => {
			let chunkText = localText.substr(chunk.start, (chunk.end - chunk.start));
			if (chunkText.trim().length === 0) {
				chunkText = "&nbsp;";
			}

			const styles = flattingStyles(chunk.styles);

			html.push(`<span${styles.length > 0 ? ' style="' + styles + '"' : ''}>`);
			html.push(chunkText);
			html.push(`</span>`);
		})
	});

	html.push(`</${htmlElement.element}>`);

	return html.join('')
}

function flattingStyles(styles: Array) {
	const styleHtml = [];

	styles.forEach((style) => {
		const defaultStyle = DefaultDraftInlineStyle[style];
		if (defaultStyle) {
			for (let i in defaultStyle) {
				if (!defaultStyle.hasOwnProperty(i)) continue;
				styleHtml.push(`${convertCssPropertyName(i)}: ${defaultStyle[i]}`)
			}
		} else {
			pluginsRegistry.forEach(plug => {
				if (typeof plug["styleFn"] === 'function') {
					const r: DraftInlineStyle = 1;
					const result = plug["styleFn"](Immutable.OrderedSet([style]));
					if (result) {
						for (let i in result) {
							if (!result.hasOwnProperty(i)) continue;
							styleHtml.push(`${convertCssPropertyName(i)}: ${result[i]}`)
						}
					}
				}
			})
		}
	});

	return styleHtml.join('; ')
}

function convertCssPropertyName(name) {
	name = name.replace(new RegExp('([A-Z])', 'g'), (match, m1) => {
		return '-' + m1.toLowerCase()
	});

	return name;
}

function isList(block) {
	return block.type === 'unordered-list-item' || block.type === 'ordered-list-item';
}

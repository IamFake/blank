import {Map} from 'immutable'

if (!Array.prototype.getUnique) {
	Array.prototype.getUnique = function () {
		return this.filter((value, index, self) => {
			return self.indexOf(value) === index;
		})
	}
}

export function getSelectedBlocks(editorState) {
	const selection = editorState.getSelection();
	const content = editorState.getCurrentContent();
	const blockMap = content.getBlockMap();

	const startKey = selection.getStartKey();
	const endKey = selection.getEndKey();

	return blockMap
		.skipUntil((v, k) => k === startKey)
		.takeUntil((v, k) => k === endKey)
		.concat(Map([[endKey, blockMap.get(endKey)]]));
}

export function getSelectedInlineStyles(editorState) {
	const contentState = editorState.getCurrentContent();
	const selectionState = editorState.getSelection();
	const blockMap = contentState.getBlockMap();

	const startKey = selectionState.getStartKey();
	const startOffset = selectionState.getStartOffset();
	const endKey = selectionState.getEndKey();
	const endOffset = selectionState.getEndOffset();

	const inlineStyles = [];
	blockMap
		.skipUntil((_, k) => k === startKey)
		.takeUntil((_, k) => k === endKey)
		.concat(Map([[endKey, blockMap.get(endKey)]]))
		.forEach((block, blockKey) => {
			let sliceStart;
			let sliceEnd;

			if (startKey === endKey) {
				sliceStart = startOffset;
				sliceEnd = endOffset;
			} else {
				sliceStart = blockKey === startKey ? startOffset : 0;
				sliceEnd = blockKey === endKey ? endOffset : block.getLength();
			}

			let chars = block.getCharacterList();
			let current;
			while (sliceStart < sliceEnd) {
				current = chars.get(sliceStart).getStyle().toJS();
				inlineStyles.push(...current);
				sliceStart++;
			}
		});

	return inlineStyles.getUnique()
}
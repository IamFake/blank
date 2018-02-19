import Image from './Image'
import AtomicToolbar from './AtomicToolbar'
import FontColor from './FontColor'
import FontFamily from './FontFamily'
import FontSize from './FontSize'

export const list = {
	Image,
	AtomicToolbar,
	FontSize,
	FontFamily,
	FontColor
};

export function getPluginsData() {
	let stack = [];

	for (let i in list) {
		if (!list.hasOwnProperty(i)) continue;
		if (typeof list[i].pluginData === 'function') {
			const data = list[i].pluginData();
			if (typeof data === 'object') {
				stack.push(data)
			}
		}
	}

	return stack;
}
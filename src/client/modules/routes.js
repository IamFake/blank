import {withMetaRouter} from '../components/spec/MetaComponent'

const modulesMap = {
	about: {
		name: 'About'
	},
	blog: {
		name: 'Blog'
	},
	home: {
		name: 'Home'
	},
	adm: {
		name: 'Admin pannel module'
	}
};
const modules = Object.keys(modulesMap);

export default function (store) {
	let exportMap = {};

	for (let mod of modules) {
		const capitalize = mod.replace(/\b\w/g, l => l.toUpperCase());
		exportMap[capitalize] = withMetaRouter(mod, store);
		store.queueReducer(mod, (state = null) => state);
	}

	return exportMap;
}

export function getRoutes() {
	return modulesMap;
}
export function routesMap(cb, currentModule) {
	let r = [];
	for (let i in modulesMap) {
		if (!modulesMap.hasOwnProperty(i) || i === currentModule) continue;

		r.push(cb(i, modulesMap[i]))
	}

	return r
}
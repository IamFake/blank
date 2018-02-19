import * as Models from '../../models'
import config from '../../config'
import crypto from 'crypto'
import gm from '../../utils/gmagick'
import Sec from '../../utils/sanitize'
import {convertToHTML} from '../../utils/editor_utils'
import fs from 'fs'

export const uploadEnable = true;

async function getList() {
	const pagesList = await Models.About.findAll({
		where: {
			active: true
		},
		attributes: [
			'id', 'title', 'path'
		]
	});

	if (pagesList.length === 0) {
		pagesList.push({})
	}

	return {
		list: pagesList
	}
}

async function getPage(specifier) {
	const pageData = await Models.About.findOne({
		where: {
			path: specifier
		}
	});

	if (!pageData) return {
		id: -1,
		title: "404 Not found",
		error: "404 Not found",
		errorCode: 404
	};

	const dataExport = {
		id: pageData["id"],
		title: pageData["title"],
		date: pageData["date"],
		text: pageData["text"],
		parent: pageData["parent"]
	};

	return {
		data: dataExport
	}
}

async function adminReciveFile(req, pageId: string) {
	const app = req.app;
	const hash = Sec.toAlnum(req.body.hash);
	const ext = req.file.originalname.split('.').pop();
	const promises = [];

	const origIdent = await gm(req.file.path).identifyPromise();
	const sizes = origIdent["size"];
	let format = (origIdent["format"] + '').toLowerCase();
	if (format === 'jpeg') format = 'jpg';

	if (config.upload.images.allowedFormats.indexOf(format) === -1) {
		fs.unlinkSync(req.file.path);

		return {
			done: false,
			error: 'wrong format'
		};
	}

	const stack = {
		'orig': {
			file: req.file.path,
			path: req.file.path.replace(app.get('publicPath'), ''),
			w: sizes.width,
			h: sizes.height
		}
	};
	config.upload.images.dimensions.forEach(function (dim) {
		const hash = crypto.createHash('sha1');
		hash.update(req.file.path);
		hash.update(dim['w'].toString());
		hash.update(dim['h'].toString());
		const hex = hash.digest('hex');
		const thumbFile = req.file.destination + hex + '.' + ext;

		promises.push(gm(req.file.path)
			.resize(dim.w, dim.h, '^')
			.noProfile()
			.cropThumb(dim.w, dim.h, thumbFile, 100, 'center', false, (err) => {
				stack[dim.w + "x" + dim.h] = {
					file: thumbFile,
					path: thumbFile.replace(app.get('publicPath'), ''),
					w: dim.w,
					h: dim.h
				}
			}));
	});

	await Promise.all(promises);

	const newItem = await Models.Attachments.create({
		uname: req.file.originalname,
		extension: ext,
		hash: hash,
		generaltype: 'image',
		store: stack,
		owner: 1
	});

	const stackExport = {};
	for (let item in stack) {
		if (!stack.hasOwnProperty(item)) continue;

		stackExport[item] = {
			path: stack[item].path,
			w: stack[item].w,
			h: stack[item].h
		};
	}

	return {
		done: newItem.id > 0,
		id: newItem.id,
		items: stackExport
	}
}

async function adminGetImages(req, stack) {
	const posthash = stack[1];
	if (posthash.trim().length === 0) return {};

	const items = await Models.Attachments.findAll({
		where: {
			hash: posthash,
			active: true
		},
		attributes: ['id', 'date', 'uname', 'generaltype', 'store']
	});

	const results = [];
	items.forEach((item) => {
		const newStore = {};
		for (let subitem in item.store) {
			if (!item.store.hasOwnProperty(subitem)) continue;

			newStore[subitem] = {
				path: item.store[subitem].path,
				w: item.store[subitem].w,
				h: item.store[subitem].h
			};
		}

		results.push({
			id: item.id,
			date: item.date,
			uname: item.uname,
			generaltype: item.generaltype,
			items: newStore
		})
	});

	return results;
}

async function adminGetPostHash() {
	const hex = await new Promise((resolve, reject) => {
		crypto.randomBytes(32, (err, buf) => {
			if (err) reject(err);
			resolve(buf.toString('hex'))
		});
	});

	return {hex}
}

async function adminEditPage(specifier) {
	const pageData = await Models.About.findOne({
		where: {
			id: specifier
		}
	});

	return pageData || {id: -1}
}

async function adminSavePage(req) {
	console.log(req.body);
	let converted = '';
	try {
		const rawState = JSON.parse(req.body["editor"]);
		converted = convertToHTML(rawState);
	} catch (e) {
		console.log("Api.About.savePage top exception", e.message);
		return {
			id: -1,
			error: 'Something wrong with text here...'
		}
	}
	console.log("converted:", converted);

	const title = Sec.toClear(req.body.title, Sec.flags.STRCL_PUNC | Sec.flags.STRCL_QOUT);
	const active = req.body.active === '1';
	const short = Sec.toClear(req.body.short, Sec.flags.STRCL_PUNC | Sec.flags.STRCL_QOUT, 600);
	const hash = Sec.toAlnum(req.body.hash, Sec.flags.STRCL_STRICT_ALNUM);

	let edit = parseInt(req.body.edit, 10);
	if (isNaN(edit)) edit = 0;

	const values = {
		title,
		desc: short,
		text: converted,
		active,
		path: title,
		hash,
		draft: req.body["editor"]
	};

	let result = {};
	if (edit > 0) {
		result = await Models.About.update(values, {
			where: {
				id: edit
			}
		});
	} else {
		result = await Models.About.create(values);
	}

	return {
		id: result.id
	}
}

async function adminGetList() {
	const pagesList = await Models.About.findAll({
		attributes: [
			'id', 'title', 'path', 'desc'
		],
		order: [['id', 'DESC']]
	});

	if (pagesList.length === 0) {
		pagesList.push({})
	}

	return {
		list: pagesList
	}
}

export async function run(params, req) {
	try {
		if (!(params.stack instanceof Array)) params.stack = [];

		let specifier = params.stack && params.stack[0];
		if (!specifier || specifier === '') {
			specifier = 'index';
		}

		if (req.method === "PUT") {
			return await adminReciveFile(req, specifier);
		}

		if (specifier === '_list') {
			return await getList()
		} else if (specifier === 'edit') {
			specifier = params.stack[1];
			return await adminEditPage(specifier)
		} else if (specifier === 'save') {
			return await adminSavePage(req)
		} else if (specifier === 'getimages') {
			return await adminGetImages(req, params.stack)
		} else if (specifier === 'getlist') {
			return await adminGetList()
		} else if (specifier === 'getposthash') {
			return await adminGetPostHash()
		} else {
			specifier = params.stack[1];
			return await getPage(specifier, params.stack.slice(1))
		}
	} catch (err) {
		console.log("Admin.About server handler EXCEPTION", err);
	}
}
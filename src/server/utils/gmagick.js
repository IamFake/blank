import _gm from 'gm'

_gm.prototype.sizePromise = function () {
	return new Promise((resolve, reject) => {
		this.size((err, size) => {
			if (err) {
				reject(err)
			} else {
				resolve(size)
			}
		});
	});
};

_gm.prototype.identifyPromise = function (fmt) {
	return new Promise((resolve, reject) => {
		this.identify(Object.assign({}, fmt), (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data)
			}
		});
	});
};

_gm.prototype.cropThumb = function (w, h, name, quality, align, progressive, callback, opts) {
	const self = this,
		args = Array.prototype.slice.call(arguments);

	opts = args.pop();

	if (typeof opts === 'function') {
		callback = opts;
		opts = '';
	} else {
		callback = args.pop();
	}

	w = args.shift();
	h = args.shift();
	name = args.shift();
	quality = args.shift() || 63;
	align = args.shift() || 'topleft';
	const interlace = args.shift() ? 'Line' : 'None';

	return new Promise((resolve, reject) => {
		self.size(function (err, size) {
			if (err) {
				reject(err);
				return callback.apply(self, arguments);
			}

			w = parseInt(w, 10);
			h = parseInt(h, 10);

			let w1, h1;
			let xoffset = 0;
			let yoffset = 0;

			if (size.width < size.height) {
				w1 = w;
				h1 = Math.floor(size.height * (w / size.width));
				if (h1 < h) {
					w1 = Math.floor(w1 * (((h - h1) / h) + 1));
					h1 = h;
				}
			} else if (size.width > size.height) {
				h1 = h;
				w1 = Math.floor(size.width * (h / size.height));
				if (w1 < w) {
					h1 = Math.floor(h1 * (((w - w1) / w) + 1));
					w1 = w;
				}
			} else if (size.width === size.height) {
				let bigger = (w > h ? w : h);
				w1 = bigger;
				h1 = bigger;
			}

			if (align === 'center') {
				if (w < w1) {
					xoffset = (w1 - w) / 2;
				}
				if (h < h1) {
					yoffset = (h1 - h) / 2;
				}
			}

			self.crop(w, h, xoffset, yoffset)
				.noProfile()
				.write(name, function () {
					callback.apply(self, arguments);
					resolve(true);
				});
		});
	});
};

const imageMagick = _gm.subClass({imageMagick: true});

export default imageMagick;

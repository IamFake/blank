const Multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function mkdirsSync(targetDir, mode) {
	const sep = path.sep;
	const initDir = path.isAbsolute(targetDir) ? sep : "";
	let noErrors = true;

	targetDir.split(sep).reduce((parentDir, childDir) => {
		const curDir = path.resolve(parentDir, childDir);
		try {
			fs.mkdirSync(curDir, mode);
		} catch (err) {
			if (err.code !== "EEXIST") {
				noErrors = false;
				console.error("Server.config::mkdirsSync error", err)
			}
		}

		return curDir;
	}, initDir);

	return noErrors;
}

export default {
	db: {
		user: "reactorusr_tp1",
		paswd: "97300dc8c6544946a1d56187ba1",
		database: "reactor_tp1",
		host: "10.0.0.1",
		port: "5432" // 6432 = pgbouncer
	},
	cookies: {
		secret: "224c1a7897300dc8c6544946a1d56187ba119e83c638403",
		name: "usid"
	},
	misc: {
		apiMatchMask: "/api/:module/:stack*"
	},
	upload: {
		images: {
			allowedFormats: ["jpg", "png", "gif"],
			dimensions: [
				{w: 60, h: 60, crop: true},
				{w: 140, h: 140, crop: true},
				{w: 60, h: 60, crop: true},
				{w: 200, h: 150, crop: true},
				{w: 300, h: 210, crop: true},
				{w: 600, h: 450, crop: true},
				{w: 800, h: 600, crop: false}
			]
		}
	},
	multer: (publicPath) => ({
		// dest: publicPath + '/stock/',
		storage: Multer.diskStorage({
			destination: function (req, file, cb) {
				const hash = crypto.createHash("sha1");
				hash.update(file.originalname);
				hash.update(file.mimetype);
				const hex = hash.digest("hex");
				const dir = publicPath + "/stock/" + hex.substr(1, 2) + "/" + hex.substr(5, 2) + "/" + hex.substr(10, 2) + "/";
				const r = mkdirsSync(dir, 0o777);

				cb(null, dir)
			},
			filename: function (req, file, cb) {
				const hash = crypto.createHash("sha1");
				hash.update(file.originalname);
				hash.update(file.mimetype);
				const hex = hash.digest("hex");
				const ext = file.originalname.split(".").pop();

				cb(null, hex + "." + ext)
			}
		}),
		// fileFilter: '',
		limits: {
			fields: 256,
			fileSize: 1024 * 1024 * 8,
			files: 20
		},
		preservePath: false
	})
};
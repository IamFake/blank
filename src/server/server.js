const path = require("path");
const Express = require("express");
const Helmet = require("helmet");
const BodyParser = require("body-parser");
const Multer = require("multer");
const Pathmatch = require("path-match");
const Session = require("express-session");
const CookieParser = require("cookie-parser");

require("ignore-styles");

const AppStartup = require("./entry").default;
const config = require("../client/configuration/config").default;
const srvconfig = require("./config").default;

const app = new Express();
const upload = Multer(srvconfig.multer(path.join(__dirname, "../public")));
const routeMatch = Pathmatch({
	sensitive: false,
	strict: false,
	end: false
})(srvconfig.misc.apiMatchMask);

app.locals.devel = config.__DEV__;
app.locals.prod = config.__PROD__;
app.set("publicPath", path.join(__dirname, "../public"));

/**
 * buildrun defined in webpack config. when it's true we run builded es5 version, so we don't need middleware
 **/
const build = typeof buildrun !== "undefined" && buildrun; // eslint-disable-line no-undef
if (!build && app.locals.devel) {
	const webpack = require("webpack");
	const webpackConfigScripts = require("../../webpack.config.babel").default;
	const compilerScripts = webpack(webpackConfigScripts);

	app.use(
		require("webpack-dev-middleware")(compilerScripts, {
			noInfo: false,
			quiet: false,
			lazy: false,
			publicPath: webpackConfigScripts.output.publicPath,
			stats: {
				colors: true,
				reasons: false,
			},
		})
	);
}

app.use(CookieParser(srvconfig.cookies.secret));
app.use(Session({
	secret: srvconfig.cookies.secret,
	name: srvconfig.cookies.name,
	resave: false,
	maxAge: 60 * 60 * 24 * 30 * 1000,
	saveUninitialized: false,
	path: "/",
	httpOnly: true,
	secure: false,
	sameSite: true
	// store: '' // change to connect-redis (for example) on production use
}));
app.use(Helmet({hsts: false}));
app.use(Express.static(path.join(__dirname, "../public"), {
	index: false,
	setHeaders: res => {
		res.set("Cache-Control", "public,max-age=31536000,immutable");
	}
}));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));

app.get("/favicon.ico", (req, res) => {
	res.send("");
});

const handlerApi = (req, res, next) => {
	const routeParams = routeMatch(req.path);
	const moduleName = routeParams.module;
	let module = null;

	try {
		module = require("./api/" + moduleName + "/index.js");
	} catch (e) {
		next();
		return;
	}

	if (req.method === "PUT" && !module.uploadEnable) {
		next();
		res.json([]);
		return;
	}

	try {
		let result = [];
		if (module && module.run) {
			result = module.run(routeParams, req);
		} else {
			res.json([]);
		}

		if (result.then) {
			result.then((ans) => {
				res.json(ans);
			})
		} else {
			res.json(result);
		}
	} catch (e) {
		console.error("Server api call error: ", e.message, e);
		res.json([]);
	}
};
app.get("/api/*", handlerApi);
app.post("/api/*", upload.array(), handlerApi);
app.put("/api/*", upload.single("file"), handlerApi);

app.get("*", (req, res) => {
	let status = 200;

	const context = {};
	let markup = "";

	if (config.ssr_enable) {
		markup = AppStartup(req, context);
	}

	const launch = (markup) => {
		if (context.url) {
			return res.redirect(302, context.url);
		}

		if (context.is404) {
			status = 404;
		}

		res.status(status).send(markup);
	};

	if (markup.then) {
		markup.then((data) => {
			launch(data)
		})
	} else {
		launch(markup)
	}
});

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || "production";
app.listen(port, (err) => {
	if (err) {
		return console.error(err);
	}
	return console.info(
		`
      Server running on http://localhost:${port} [${env}]
    `);
});


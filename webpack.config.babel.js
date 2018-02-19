import path from "path"
import config from "./src/client/configuration/config"
import webpack from "webpack"
import PluginExtractText from "extract-text-webpack-plugin"
import PluginCopy from "copy-webpack-plugin"

const client = {
	context: path.resolve(__dirname),
	entry: {
		index: path.resolve(__dirname, "./src/client/app-client.js")
	},
	output: {
		path: path.resolve(config.paths.public),
		filename: "js/index.js",
		chunkFilename: "js/[name].js",
		publicPath: "/",
		sourceMapFilename: "[file].map"
	},
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				options: {
					babelrc: false,
					cacheDirectory: true,
					comments: true,
					presets: [["env", {"modules": false}], "react", "flow"],
					plugins: [
						"transform-class-properties",
						"syntax-dynamic-import",
						"transform-es2015-destructuring",
						"transform-es2015-parameters",
						"transform-object-rest-spread",
						"transform-function-bind"
						/*"transform-runtime"*/
					]
				}
			},
			{
				test: /\.(sass|scss|css)$/,
				use: PluginExtractText.extract({
					fallback: "style-loader",
					use: [
						{
							loader: "css-loader",
							options: {
								sourceMap: config.sourcemaps,
								minimize: config.__PROD__ && {
									autoprefixer: {
										add: true,
										remove: false,
										browsers: ["last 3 versions"],
									},
									discardComments: {
										removeAll: true,
									},
									discardUnused: false,
									mergeIdents: false,
									reduceIdents: false,
									safe: true,
									sourcemap: config.sourcemaps,
								},
							},
						},
						{
							loader: "sass-loader",
							options: {
								sourceMap: config.sourcemaps,
								outputStyle: config.__PROD__ ? "compressed" : "expanded",
								includePaths: [
									path.join(__dirname, "node_modules/compass-mixins/lib")
								],
							}
						}
					]
				})
			},
			{
				test: /\.(gif|png|jpe?g|svg)$/i,
				loader: "file-loader",
				include: path.join(__dirname, "src/client/images/"),
				options: {
					name: "images/[path][name].[ext]",
					context: path.join(__dirname, "src/client/images/")
				}
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin(Object.assign({
			"process.env": {
				NODE_ENV: JSON.stringify(config.env)
			},
			__DEV__: config.__DEV__,
			__TEST__: config.__TEST__,
			__PROD__: config.__PROD__,
			__WP__: true
		}, config.globals)),
		new PluginExtractText({filename: "css/[name].css", allChunks: true}),
		new webpack.NormalModuleReplacementPlugin(
			/query_wrap_server/,
			function (res) {
				res.request = res.request.replace("server", "client")
			}
		),
		new PluginCopy([{
			from: path.join(__dirname, "src/client/images/"),
			to: path.join(__dirname, "dist/public/images/")
		}])
	]
};

if (config.__PROD__) {
	client.plugins.push(new webpack.optimize.UglifyJsPlugin({
		uglifyOptions: {
			ecma: 6,
			compress: {
				dead_code: true,
				// conditionals: true,
				// unused: true
			},
			output: {
				beautify: true
			}
		}
	}))
}

export default client;

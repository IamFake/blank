import React from 'react'
import {Helmet} from 'react-helmet'
import {renderToString} from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import App from '../client/components/App'
import {minify} from 'html-minifier'
import RoutesCreate from '../client/modules/routes'
import configureStore from '../client/configuration/store'
import Boostrap from '../client/utils/bootstrap';
import clientConfig from '../client/configuration/config'

const renderHtml = (appMarkup, store, session) => {
	let metadata = Helmet.renderStatic();
	const htmlAttrs = metadata.htmlAttributes.toString();
	const bodyAttrs = metadata.bodyAttributes.toString();
	console.info('state to hydrate: ', JSON.stringify(store.getState()));

	const html = `<!DOCTYPE html>
		<html ${htmlAttrs}>
		<head>
			<meta charSet="utf-8"/>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<script>window.auth = {ok: ${session.auth}}</script>
			${metadata.title.toString()}
			${metadata.meta.toString()}
			${metadata.link.toString()}
			${metadata.style.toString()}
			<link rel="stylesheet" href="/css/index.css"/>
		</head>
		<body ${bodyAttrs}>
		<div id="main" class="app-shell">${appMarkup}</div>
		<script>window.preloadedState = '${JSON.stringify(store.getState()).replace(/\\"/g, '\\\\"')/*.replace(/</g, '\\\u003c')*/}'</script>
		<script src="/js/index.js">{}</script>
		${metadata.script.toString()}
		</body>
		</html>
	`;

	return minify(html, {
		removeComments: false,
		collapseWhitespace: true,
		conservativeCollapse: true,
		minifyCSS: true
	});
};

export default (req, context) => {
	const store = configureStore();
	const routes = RoutesCreate(store);
	store.initStore();

	const AppNode = (
		<StaticRouter location={req.url} context={context}>
			<App store={store} routeMap={routes} session={{ok: req.session.auth}} />
		</StaticRouter>
	);

	if (clientConfig.ssr_enable) {
		return Boostrap(AppNode, {ssr: true}).then(() => {
			return renderHtml(renderToString(AppNode), store.getStore(), req.session)
		})
	} else {
		return renderHtml(renderToString(AppNode), store.getStore(), req.session)
	}
}
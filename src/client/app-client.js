import "babel-polyfill"
import "raf/polyfill"

import "./scss/index.scss"

import React from "react"
import {hydrate, render} from "react-dom"
import {BrowserRouter} from "react-router-dom"

import config from "./configuration/config"
import App from "./components/App"
import Boostrap from "./utils/bootstrap"
import RoutesCreate from "./modules/routes"
import configureStore from "./configuration/store"

let preloadedState = null;
try {
	preloadedState = JSON.parse(window.preloadedState)
} catch (e) {
	preloadedState = null;
	console.log("ERROR WITH HANDLE JSON IN PRELOAD STATE", e.message)
}

const store = configureStore(preloadedState);
const routes = RoutesCreate(store);

store.initStore();

const AppClient = (
	<BrowserRouter>
		<App store={store} routeMap={routes} session={window.auth}/>
	</BrowserRouter>
);

if (config.ssr_enable) {
	Boostrap(AppClient).then(
		() => {
			hydrate(AppClient, document.getElementById("main"))
		}
	)
} else {
	window.onload = () => {
		render(<AppClient/>, document.getElementById("main"))
	}
}

import reactTreeWalker from 'react-tree-walker'

export default function bootstrap(app, options) {
	const visitor = (element, instance) => {
		if (instance && typeof instance.bootstrap === 'function') {
			return instance.bootstrap()
		}
		return true
	};

	const ssr = options && options.ssr;
	if (ssr) {
		delete options.ssr;
	}

	return reactTreeWalker(app, visitor, {bootstrap: true, ssr}, options)
}
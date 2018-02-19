import path from 'path';

const NODE_ENV = process.env.NODE_ENV || 'development';

const __DEV__ = NODE_ENV === 'development';
const __TEST__ = NODE_ENV === 'test';
const __PROD__ = NODE_ENV === 'production';

const config = {
	publicPath: path.join(__dirname, '/../../../dist/public'),
	paths: {
		public: path.join(__dirname, '/../../../dist/public'),
		publicJs: path.join(__dirname, '/../../../dist/public/js'),
		publicCss: path.join(__dirname, '/../../../dist/public/css')
	},
	ssr_enable: true,
	env: NODE_ENV,
	sourcemaps: true,
	globals: {},
	__DEV__,
	__TEST__,
	__PROD__
};

export default config;

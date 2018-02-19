module.exports = {
	"env": {
		"browser": true,
		"es6": true,
		"node": true
	},
	"extends": ["eslint:recommended", "plugin:react/recommended"],
	"parserOptions": {
		"ecmaFeatures": {
			"experimentalObjectRestSpread": true,
			"jsx": true
		},
		"sourceType": "module"
	},
	"plugins": [
		"react", "jsx-a11y"
	],
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"no-unused-vars": [
			"error",
			{
				"vars": "all",
				"args": "after-used",
				"ignoreRestSiblings": false
			}
		],
		"no-console": 0
	}
};
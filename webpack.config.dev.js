'use strict';

const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
	mode: 'development',
	entry: [
	'./src/app.js',
	],
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: 'vue-loader',
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
		]
	},
	plugins: [
		new VueLoaderPlugin(),
	],
	resolve: { alias: { vue: 'vue/dist/vue.esm.js' } },
	watch: true,
	output: {
		path: __dirname + "/../delish-christmas/assets",
		filename: "meal-plan-vue.js"
	}
};

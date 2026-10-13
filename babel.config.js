module.exports = function (api) {
	const env = api.env();
	const isEsm = env === 'esm';
	const isCjs = env === 'cjs';

	return {
		presets: [
			[
				'@wordpress/babel-preset-default',
				{
					modules: isEsm ? false : 'commonjs',
					useESModules: isEsm,
				},
			],
		],
		// @wordpress/babel-preset-default ignores the `modules` option above (it derives the module
		// format from the Babel caller, not preset options), so it always leaves ESM `import`/`export`
		// in place. For the CommonJS build that would make `dist/cjs` (the package `main`) unusable
		// under a plain Node `require`, so transform modules to CommonJS explicitly here.
		plugins: isCjs ? [ require.resolve( '@babel/plugin-transform-modules-commonjs' ) ] : [],
	};
};

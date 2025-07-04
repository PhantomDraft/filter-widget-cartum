import resolve from '@rollup/plugin-node-resolve';
import babel   from '@rollup/plugin-babel';

export default [
	{
		input: 'src/filterWidget.js',
		output: {
			file: 'dist/filterWidget.js',
			format: 'esm',
		},
		plugins: [
			resolve(),
			babel({
				babelHelpers: 'bundled',
				presets: ['@babel/preset-env']
			})
		]
	},
	{
		input: 'src/filterWidget.js',
		output: {
			file: 'dist/filterWidget.umd.js',
			format: 'umd',
			name: 'FilterWidget',     // <-- вот как будет называться глобально
			exports: 'default'
		},
		plugins: [
			resolve(),
			babel({
				babelHelpers: 'bundled',
				presets: ['@babel/preset-env']
			})
		]
	}
];
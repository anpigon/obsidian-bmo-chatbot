import react from '@vitejs/plugin-react';
import builtins from 'builtin-modules';
import {defineConfig} from 'vite';
import {pathToFileURL} from 'url';
import typescript from '@rollup/plugin-typescript';

const setOutDir = (mode: string) => {
	switch (mode) {
		case 'development':
			return './build/smart-second-brain/';
		case 'production':
			return 'build/prod';
	}
};

export default defineConfig(({mode}) => {
	return {
		plugins: [react()],
		build: {
			lib: {
				entry: 'src/main',
				formats: ['cjs'],
			},
			rollupOptions: {
				plugins: [typescript({tsconfig: './tsconfig.json'})],
				output: {
					entryFileNames: 'main.js',
					assetFileNames: 'styles.css',
					sourcemapBaseUrl: pathToFileURL(`${__dirname}/build/smart-second-brain/`).toString(),
				},
				external: [
					'obsidian',
					'electron',
					'@codemirror/autocomplete',
					'@codemirror/collab',
					'@codemirror/commands',
					'@codemirror/language',
					'@codemirror/lint',
					'@codemirror/search',
					'@codemirror/state',
					'@codemirror/view',
					'@lezer/common',
					'@lezer/highlight',
					'@lezer/lr',
					...builtins,
				],
			},
			outDir: setOutDir(mode),
			emptyOutDir: false,
			sourcemap: true,
		},
		css: {
			devSourcemap: true,
		},
	};
});

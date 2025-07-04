import { defineNuxtConfig } from 'nuxt/config';
import { resolve } from 'path';

export default defineNuxtConfig({
	ssr: false,
	app: {
		head: {
			script: [
				{
					src: 'https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js',
					defer: true,
				},
				// Add 3Dmol.js CDN
				{
					src: 'https://cdn.jsdelivr.net/npm/3dmol@latest/build/3Dmol-min.js',
					defer: true,
				},
			],
		},
	},
	compatibilityDate: '2024-04-03',
	typescript: {
		strict: true,
		typeCheck: true,
	},
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
	alias: {
		'@': resolve(__dirname, './'),
	},
	vite: {
		optimizeDeps: {
			exclude: ['@rdkit/rdkit'],
		},
	},

	nitro: {
		experimental: {
			wasm: true,
		},
	},
	modules: [
		'@nuxt/eslint',
		[
			'@nuxtjs/google-fonts',
			{
				families: {
					Inter: '200..700',
				},
			},
		],
		'@pinia/nuxt',
	],
	runtimeConfig: {},
});

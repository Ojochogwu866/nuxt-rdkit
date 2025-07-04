<template>
	<div class="molecule-viewer">
		<div
			v-if="loading"
			class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
		>
			<div class="text-center">
				<div
					class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
				></div>
				<p class="mt-2 text-sm text-gray-600">Loading structure...</p>
			</div>
		</div>

		<div
			v-else-if="error"
			class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-red-300 bg-red-50"
		>
			<div class="text-center">
				<svg
					class="mx-auto h-8 w-8 text-red-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
					></path>
				</svg>
				<p class="mt-2 text-sm text-red-600">Failed to load structure</p>
				<button
					class="mt-2 rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
					@click="renderMolecule"
				>
					Retry
				</button>
			</div>
		</div>

		<div
			v-else-if="svgContent"
			class="molecule-structure rounded-lg border-2 border-gray-200 bg-white p-4"
			v-html="svgContent"
		></div>

		<div
			v-else-if="is3D && threeDContent"
			ref="threeDContainer"
			class="molecule-3d rounded-lg border-2 border-gray-200 bg-white p-4"
		></div>

		<div
			v-else
			class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
		>
			<div class="text-center text-gray-500">
				<svg
					class="mx-auto h-8 w-8"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
					></path>
				</svg>
				<p class="mt-2 text-sm">No structure available</p>
			</div>
		</div>

		<div
			v-if="svgContent || (is3D && threeDContent)"
			class="mt-4 flex justify-center space-x-2"
		>
			<button
				class="rounded px-3 py-1 text-sm transition-colors"
				:class="
					is3D
						? 'bg-green-500 text-white hover:bg-green-600'
						: 'bg-blue-500 text-white hover:bg-blue-600'
				"
				@click="toggle3D"
			>
				{{ is3D ? '2D View' : '3D View' }}
			</button>
			<button
				v-if="!is3D"
				class="rounded bg-purple-500 px-3 py-1 text-sm text-white transition-colors hover:bg-purple-600"
				@click="exportSVG"
			>
				Export SVG
			</button>
			<button
				class="rounded bg-gray-500 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600"
				@click="refreshStructure"
			>
				Refresh
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

	// Props interface
	interface Props {
		smiles: string;
		width?: number;
		height?: number;
		options?: Record<string, any>;
	}

	// Props with defaults
	const props = withDefaults(defineProps<Props>(), {
		width: 400,
		height: 300,
		options: () => ({}),
	});

	const loading = ref(false);
	const error = ref(false);
	const svgContent = ref('');
	const is3D = ref(false);
	const threeDContent = ref(false);
	const threeDContainer = ref<HTMLElement>();
	let currentMol: any = null;

	const initRDKit = (() => {
		let rdkitPromise: Promise<any> | null = null;

		return () => {
			if (!rdkitPromise) {
				rdkitPromise = new Promise((resolve, reject) => {
					if (
						typeof window !== 'undefined' &&
						(window as any).initRDKitModule
					) {
						(window as any)
							.initRDKitModule()
							.then((RDKit: any) => {
								(window as any).RDKit = RDKit;
								console.log('RDKit initialized successfully');
								resolve(RDKit);
							})
							.catch((e: any) => {
								console.error('Failed to initialize RDKit:', e);
								reject(e);
							});
					} else {
						reject(
							new Error(
								'RDKit not available. Make sure to include the RDKit script.'
							)
						);
					}
				});
			}
			return rdkitPromise;
		};
	})();

	async function renderMolecule() {
		if (!props.smiles) {
			error.value = false;
			svgContent.value = '';
			threeDContent.value = false;
			return;
		}

		loading.value = true;
		error.value = false;
		svgContent.value = '';
		threeDContent.value = false;

		try {
			const RDKit = await initRDKit();
			if (currentMol) {
				currentMol.delete();
				currentMol = null;
			}

			const mol = RDKit.get_mol(props.smiles);

			if (!mol) {
				throw new Error('Invalid SMILES string');
			}
			currentMol = RDKit.get_mol(props.smiles);

			if (is3D.value) {
				await render3D(mol);
			} else {
				await render2D(mol);
			}

			mol.delete();
		} catch (err) {
			console.error('Error rendering molecule:', err);
			error.value = true;
		} finally {
			loading.value = false;
		}
	}

	async function render2D(mol: any) {
		const drawingOptions = {
			width: props.width,
			height: props.height,
			bondLineWidth: 1,
			addStereoAnnotation: true,
			...props.options,
		};

		const svg = mol.get_svg_with_highlights(JSON.stringify(drawingOptions));
		svgContent.value = svg;
	}

	async function render3D(mol: any) {
		try {
			if (typeof (window as any).$3Dmol === 'undefined') {
				console.log('3Dmol not found, loading dynamically...');
				await load3DmolJS();
			} else {
				console.log('3Dmol already available');
			}

			// Generate 3D coordinates if not present
			if (!mol.has_coords()) {
				console.log('Generating 3D coordinates...');
				mol.set_new_coords();
			}
			const molblock = mol.get_molblock();

			await nextTick();

			if (!threeDContainer.value) {
				throw new Error('3D container not available');
			}
			threeDContainer.value.innerHTML = '';

			const viewer = (window as any).$3Dmol.createViewer(
				threeDContainer.value,
				{
					width: props.width,
					height: props.height,
					backgroundColor: 'white',
				}
			);

			// Add molecule to viewer
			viewer.addModel(molblock, 'mol');
			viewer.setStyle({}, { stick: { radius: 0.1 } });
			viewer.zoomTo();
			viewer.render();

			console.log('3D render completed successfully');
			threeDContent.value = true;
		} catch (err) {
			console.error('3D rendering failed, falling back to 2D:', err);
			is3D.value = false;
			await render2D(mol);
		}
	}

	// Load 3Dmol.js library
	async function load3DmolJS(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (typeof (window as any).$3Dmol !== 'undefined') {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src =
				'https://cdn.jsdelivr.net/npm/3dmol@latest/build/3Dmol-min.js';
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Failed to load 3Dmol.js'));
			document.head.appendChild(script);
		});
	}

	async function toggle3D() {
		console.log('Toggle 3D clicked, current state:', is3D.value);
		is3D.value = !is3D.value;
		console.log('New state:', is3D.value);

		if (is3D.value) {
			console.log('Switching to 3D mode...');
			console.log(
				'3Dmol available?',
				typeof (window as any).$3Dmol !== 'undefined'
			);
		} else {
			console.log('Switching to 2D mode...');
		}

		await renderMolecule();
	}

	function exportSVG() {
		if (!svgContent.value) return;

		try {
			const blob = new Blob([svgContent.value], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;
			link.download = `molecule-${props.smiles.substring(0, 10)}.svg`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			URL.revokeObjectURL(url);
		} catch (err) {
			console.error('Error exporting SVG:', err);
		}
	}

	function refreshStructure() {
		renderMolecule();
	}

	watch(() => props.smiles, renderMolecule, { immediate: false });

	onMounted(() => {
		if (props.smiles) {
			renderMolecule();
		}
	});

	onUnmounted(() => {
		if (currentMol) {
			currentMol.delete();
			currentMol = null;
		}
	});
</script>

<style scoped>
	.molecule-viewer {
		@apply w-full;
	}

	.molecule-structure :deep(svg) {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.molecule-structure :deep(svg rect:first-of-type) {
		fill: transparent !important;
	}

	/* 3D viewer container */
	.molecule-3d {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 300px;
	}
</style>

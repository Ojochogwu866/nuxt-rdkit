<template>
	<div>
		<MoleculeViewer smiles="CCCCCC" :width="800" :height="700" />
	</div>
</template>
<script setup>
	import { useMolecularProperties } from '@/composables/useMolecularProperties';

	const { calculateProperties } = useMolecularProperties();

	const smiles = 'CCCCCC';
	const properties = await calculateProperties(smiles);

	console.log(properties);
</script>

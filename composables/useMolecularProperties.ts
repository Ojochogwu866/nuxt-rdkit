import initRDKit from '@/utils/initRDKit';
import type { JSMol } from '@rdkit/rdkit';

interface MolecularProperties {
	molecularWeight: number;
	logP: number;
	tpsa: number;
	numHBD: number;
	numHBA: number;
	numRotatableBonds: number;
	numAromaticRings: number;
	molecularFormula: string;
}

export const useMolecularProperties = () => {
	const calculateProperties = async (
		smiles: string
	): Promise<MolecularProperties> => {
		try {
			const RDKit = await initRDKit();

			const mol: JSMol | null = RDKit.get_mol(smiles);
			if (!mol) {
				throw new Error('Invalid SMILES');
			}

			const descriptors = JSON.parse(mol.get_descriptors());
			const properties: MolecularProperties = {
				molecularWeight: descriptors.AMW || 0,
				logP: descriptors.CrippenClogP || 0,
				tpsa: descriptors.TPSA || 0,
				numHBD: descriptors.NumHBD || 0,
				numHBA: descriptors.NumHBA || 0,
				numRotatableBonds: descriptors.NumRotatableBonds || 0,
				numAromaticRings: descriptors.NumAromaticRings || 0,
				molecularFormula:
					mol.get_molblock().split('\n')[3]?.trim() || 'Unknown',
			};

			mol.delete();

			return properties;
		} catch (error) {
			console.error('Error calculating properties:', error);
			throw error;
		}
	};

	const validateSMILES = async (smiles: string): Promise<boolean> => {
		try {
			const RDKit = await initRDKit();
			const mol: JSMol | null = RDKit.get_mol(smiles);
			const isValid = !!mol;

			if (mol) mol.delete();
			return isValid;
		} catch {
			return false;
		}
	};

	return {
		calculateProperties,
		validateSMILES,
	};
};

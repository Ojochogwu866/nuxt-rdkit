export {};

declare global {
	interface Window {
		RDKit: any;
		initRDKitModule?: () => Promise<any>;
	}
}

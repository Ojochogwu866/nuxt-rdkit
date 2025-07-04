// utils/initRDKit.ts

import type { RDKitModule } from '@rdkit/rdkit';

const initRDKit = (() => {
	let rdkitLoadingPromise: Promise<RDKitModule>;

	return () => {
		/**
		 * Utility function ensuring there's only one call made to load RDKit
		 * It returns a promise with the resolved RDKit API as value on success,
		 * and a rejected promise with the error on failure.
		 *
		 * The RDKit API is also attached to the global object on successful load.
		 */
		if (!rdkitLoadingPromise) {
			rdkitLoadingPromise = new Promise((resolve, reject) => {
				if (typeof window !== 'undefined' && window.initRDKitModule) {
					window
						.initRDKitModule()
						.then((RDKit) => {
							(window as any).RDKit = RDKit;
							console.log('RDKit initialized successfully');
							resolve(RDKit);
						})
						.catch((e) => {
							console.error('Failed to initialize RDKit:', e);
							reject(e);
						});
				} else {
					reject(
						new Error(
							'initRDKitModule not found on window. Make sure RDKit is loaded via CDN.'
						)
					);
				}
			});
		}
		return rdkitLoadingPromise;
	};
})();

export default initRDKit;

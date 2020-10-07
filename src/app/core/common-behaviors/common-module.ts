import { HighContrastModeDetector } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { Inject, InjectionToken, isDevMode, NgModule, Optional, Version } from '@angular/core';
import { VERSION as CDK_VERSION } from '@angular/cdk';
import { DOCUMENT } from '@angular/common';

const VERSION = new Version('0.0.0-PLACEHOLDER');

export function MATERIAL_SANITY_CHECKS_FACTORY(): SanityChecks {
	return true;
}

export const MATERIAL_SANITY_CHECKS = new InjectionToken<SanityChecks>('dia-sanity-checks', {
	providedIn: 'root',
	factory: MATERIAL_SANITY_CHECKS_FACTORY,
});

export type SanityChecks = boolean | GranularSanityChecks;

export interface GranularSanityChecks {
	doctype: boolean;
	theme: boolean;
	version: boolean;
}

@NgModule({
	imports: [BidiModule],
	exports: [BidiModule],
})
export class MatCommonModule {
	private _hasDoneGlobalChecks = false;
	private _sanityChecks: SanityChecks;
	protected _document: Document;

	constructor(
		highContrastModeDetector: HighContrastModeDetector,
		@Optional() @Inject(MATERIAL_SANITY_CHECKS) sanityChecks: any,
		@Inject(DOCUMENT) document: any) {
		this._document = document;
		highContrastModeDetector._applyBodyHighContrastModeCssClasses();
		this._sanityChecks = sanityChecks;

		if (!this._hasDoneGlobalChecks) {
			this._checkDoctypeIsDefined();
			this._checkThemeIsPresent();
			this._checkCdkVersionMatch();
			this._hasDoneGlobalChecks = true;
		}
	}

	private _getWindow(): Window | null {
		const win = this._document.defaultView || window;
		return typeof win === 'object' && win ? win : null;
	}

	private _checksAreEnabled(): boolean {
		return isDevMode() && !this._isTestEnv();
	}

	private _isTestEnv() {
		const window = this._getWindow() as any;
		return window && (window.__karma__ || window.jasmine);
	}

	private _checkDoctypeIsDefined(): void {
		const isEnabled = this._checksAreEnabled() &&
			(this._sanityChecks === true || (this._sanityChecks as GranularSanityChecks).doctype);

		if (isEnabled && !this._document.doctype) {
			console.warn(
				'Current document does not have a doctype. This may cause ' +
				'some Angular Material components not to behave as expected.'
			);
		}
	}

	private _checkThemeIsPresent(): void {
		const isDisabled = !this._checksAreEnabled() ||
			(this._sanityChecks === false || !(this._sanityChecks as GranularSanityChecks).theme);

		if (isDisabled || !this._document.body || typeof getComputedStyle !== 'function') {
			return;
		}

		const testElement = this._document.createElement('div');

		testElement.classList.add('dia-theme-loaded-marker');
		this._document.body.appendChild(testElement);

		const computedStyle = getComputedStyle(testElement);

		if (computedStyle && computedStyle.display !== 'none') {
			console.warn(
				'Could not find Angular Material core theme. Most Material ' +
				'components may not work as expected. For more info refer ' +
				'to the theming guide: https://material.angular.io/guide/theming'
			);
		}

		this._document.body.removeChild(testElement);
	}

	private _checkCdkVersionMatch(): void {
		const isEnabled = this._checksAreEnabled() &&
			(this._sanityChecks === true || (this._sanityChecks as GranularSanityChecks).version);

		if (isEnabled && VERSION.full !== CDK_VERSION.full) {
			console.warn(
				'The Angular Material version (' + VERSION.full + ') does not match ' +
				'the Angular CDK version (' + CDK_VERSION.full + ').\n' +
				'Please ensure the versions of these two packages exactly match.'
			);
		}
	}
}

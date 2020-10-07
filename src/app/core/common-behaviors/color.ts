import { Constructor } from './constructor';
import { ElementRef } from '@angular/core';

export interface CanColor {
	color: ThemePalette;
	defaultColor: ThemePalette | undefined;
}

export type CanColorCtor = Constructor<CanColor>;

export interface HasElementRef {
	_elementRef: ElementRef;
}

export type ThemePalette = 'primary' | 'accent' | 'warn' | undefined;

export function mixinColor<T extends Constructor<HasElementRef>>(
	base: T, defaultColor?: ThemePalette): CanColorCtor & T {
	return class extends base {
		private _color: ThemePalette;
		defaultColor = defaultColor;

		get color(): ThemePalette { return this._color; }
		set color(value: ThemePalette) {
			const colorPalette = value || this.defaultColor;

			if (colorPalette !== this._color) {
				if (this._color) {
					this._elementRef.nativeElement.classList.remove(`dia-${this._color}`);
				}
				if (colorPalette) {
					this._elementRef.nativeElement.classList.add(`dia-${colorPalette}`);
				}

				this._color = colorPalette;
			}
		}

		constructor(...args: any[]) {
			super(...args);

			this.color = defaultColor;
		}
	};
}


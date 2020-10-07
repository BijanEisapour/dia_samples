import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Constructor, AbstractConstructor } from './constructor';

export interface CanDisableRipple {
	disableRipple: boolean;
}

export type CanDisableRippleCtor = Constructor<CanDisableRipple>;

export function mixinDisableRipple<T extends AbstractConstructor<{}>>(
	base: T): CanDisableRippleCtor & T {
	abstract class Mixin extends (base as unknown as Constructor<{}>) {
		private _disableRipple: boolean = false;

		get disableRipple() { return this._disableRipple; }
		set disableRipple(value: any) { this._disableRipple = coerceBooleanProperty(value); }

		constructor(...args: any[]) { super(...args); }
	}

	return Mixin as unknown as T & CanDisableRippleCtor;
}

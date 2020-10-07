import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Constructor, AbstractConstructor } from './constructor';
import { CanDisable } from './disabled';

export interface HasTabIndex {
	tabIndex: number;
	defaultTabIndex: number;
}

export type HasTabIndexCtor = Constructor<HasTabIndex>;

export function mixinTabIndex<T extends AbstractConstructor<CanDisable>>(
	base: T,
	defaultTabIndex = 0
): HasTabIndexCtor & T {
	abstract class Mixin extends ((base as any) as Constructor<CanDisable>) {
		private _tabIndex: number = defaultTabIndex;
		defaultTabIndex = defaultTabIndex;

		get tabIndex(): number {
			return this.disabled ? -1 : this._tabIndex;
		}
		set tabIndex(value: number) {
			this._tabIndex =
				value != null
					? coerceNumberProperty(value)
					: this.defaultTabIndex;
		}

		constructor(...args: any[]) {
			super(...args);
		}
	}

	return (Mixin as unknown) as T & Constructor<HasTabIndex>;
}

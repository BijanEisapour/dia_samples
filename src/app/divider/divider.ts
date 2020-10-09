import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
	selector: 'dia-divider',
	host: {
		'role': 'separator',
		'[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"',
		'[class.dia-divider-vertical]': 'vertical',
		'[class.dia-divider-horizontal]': '!vertical',
		'[class.dia-divider-inset]': 'inset',
		'class': 'dia-divider'
	},
	template: '',
	styleUrls: ['divider.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiaDivider {
	@Input()
	get vertical(): boolean { return this._vertical; }
	set vertical(value: boolean) { this._vertical = coerceBooleanProperty(value); }
	private _vertical: boolean = false;

	@Input()
	get inset(): boolean { return this._inset; }
	set inset(value: boolean) { this._inset = coerceBooleanProperty(value); }
	private _inset: boolean = false;

	static ngAcceptInputType_vertical: BooleanInput;
	static ngAcceptInputType_inset: BooleanInput;
}

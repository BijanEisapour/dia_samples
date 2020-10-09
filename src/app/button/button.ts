import { FocusMonitor, FocusableOption, FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	OnDestroy,
	ViewChild,
	ViewEncapsulation,
	Optional,
	Inject,
	Input,
	AfterViewInit
} from '@angular/core';
import {
	CanColor,
	CanDisable,
	CanDisableRipple,
	CanColorCtor,
	CanDisableCtor,
	CanDisableRippleCtor,
	DiaRipple,
	mixinColor,
	mixinDisabled,
	mixinDisableRipple
} from '../core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

const DEFAULT_ROUND_BUTTON_COLOR = 'accent';

const BUTTON_HOST_ATTRIBUTES = [
	'dia-button',
	'dia-flat-button',
	'dia-icon-button',
	'dia-raised-button',
	'dia-stroked-button',
	'dia-mini-fab',
	'dia-fab'
];

class DiaButtonBase {
	constructor(public _elementRef: ElementRef) { }
}

const _DiaButtonMixinBase: CanDisableRippleCtor &
	CanDisableCtor &
	CanColorCtor &
	typeof DiaButtonBase = mixinColor(
		mixinDisabled(mixinDisableRipple(DiaButtonBase))
	);

@Component({
	selector: `button[dia-button], button[dia-raised-button], button[dia-icon-button],
             button[dia-fab], button[dia-mini-fab], button[dia-stroked-button],
             button[dia-flat-button]`,
	exportAs: 'diaButton',
	host: {
		'[attr.disabled]': 'disabled || null',
		'[class._dia-animation-noopable]':
			'_animationMode === "NoopAnimations"',
		'[class.dia-button-disabled]': 'disabled',
		class: 'dia-focus-indicator'
	},
	templateUrl: 'button.html',
	styleUrls: ['button.scss'],
	inputs: ['disabled', 'disableRipple', 'color'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiaButton extends _DiaButtonMixinBase
	implements AfterViewInit,
	OnDestroy,
	CanDisable,
	CanColor,
	CanDisableRipple,
	FocusableOption {
	readonly isRoundButton: boolean = this._hasHostAttributes(
		'dia-fab',
		'dia-mini-fab'
	);

	readonly isIconButton: boolean = this._hasHostAttributes('dia-icon-button');

	@ViewChild(DiaRipple) ripple: DiaRipple;

	constructor(
		elementRef: ElementRef,
		private _focusMonitor: FocusMonitor,
		@Optional()
		@Inject(ANIMATION_MODULE_TYPE)
		public _animationMode: string
	) {
		super(elementRef);

		for (const attr of BUTTON_HOST_ATTRIBUTES) {
			if (this._hasHostAttributes(attr)) {
				(this._getHostElement() as HTMLElement).classList.add(attr);
			}
		}

		elementRef.nativeElement.classList.add('dia-button-base');

		if (this.isRoundButton) {
			this.color = DEFAULT_ROUND_BUTTON_COLOR;
		}
	}

	ngAfterViewInit() {
		this._focusMonitor.monitor(this._elementRef, true);
	}

	ngOnDestroy() {
		this._focusMonitor.stopMonitoring(this._elementRef);
	}

	focus(origin: FocusOrigin = 'program', options?: FocusOptions): void {
		this._focusMonitor.focusVia(this._getHostElement(), origin, options);
	}

	_getHostElement() {
		return this._elementRef.nativeElement;
	}

	_isRippleDisabled() {
		return this.disableRipple || this.disabled;
	}

	_hasHostAttributes(...attributes: string[]) {
		return attributes.some((attribute) =>
			this._getHostElement().hasAttribute(attribute)
		);
	}

	static ngAcceptInputType_disabled: BooleanInput;
	static ngAcceptInputType_disableRipple: BooleanInput;
}

@Component({
	selector: `a[dia-button], a[dia-raised-button], a[dia-icon-button], a[dia-fab],
             a[dia-mini-fab], a[dia-stroked-button], a[dia-flat-button]`,
	exportAs: 'diaButton, matAnchor',
	host: {
		'[attr.tabindex]': 'disabled ? -1 : (tabIndex || 0)',
		'[attr.disabled]': 'disabled || null',
		'[attr.aria-disabled]': 'disabled.toString()',
		'(click)': '_haltDisabledEvents($event)',
		'[class._dia-animation-noopable]':
			'_animationMode === "NoopAnimations"',
		'[class.dia-button-disabled]': 'disabled',
		class: 'dia-focus-indicator'
	},
	inputs: ['disabled', 'disableRipple', 'color'],
	templateUrl: 'button.html',
	styleUrls: ['button.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiaAnchor extends DiaButton {
	@Input() tabIndex: number;

	constructor(
		focusMonitor: FocusMonitor,
		elementRef: ElementRef,
		@Optional()
		@Inject(ANIMATION_MODULE_TYPE)
		animationMode: string
	) {
		super(elementRef, focusMonitor, animationMode);
	}

	_haltDisabledEvents(event: Event) {
		if (this.disabled) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	}
}

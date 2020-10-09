import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
	AfterViewChecked,
	Attribute,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	ErrorHandler,
	inject,
	Inject,
	InjectionToken,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	SimpleChanges,
	ViewEncapsulation,
} from '@angular/core';
import { CanColor, CanColorCtor, mixinColor } from '../core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { DiaIconRegistry } from './icon-registry';


class DiaIconBase {
	constructor(public _elementRef: ElementRef) { }
}
const _DiaIconMixinBase: CanColorCtor & typeof DiaIconBase = mixinColor(DiaIconBase);

export const DIA_ICON_LOCATION = new InjectionToken<DiaIconLocation>('dia-icon-location', {
	providedIn: 'root',
	factory: DIA_ICON_LOCATION_FACTORY
});

export interface DiaIconLocation {
	getPathname: () => string;
}

export function DIA_ICON_LOCATION_FACTORY(): DiaIconLocation {
	const _document = inject(DOCUMENT);
	const _location = _document ? _document.location : null;

	return {
		getPathname: () => _location ? (_location.pathname + _location.search) : ''
	};
}

const funcIriAttributes = [
	'clip-path',
	'color-profile',
	'src',
	'cursor',
	'fill',
	'filter',
	'marker',
	'marker-start',
	'marker-mid',
	'marker-end',
	'mask',
	'stroke'
];

const funcIriAttributeSelector = funcIriAttributes.map(attr => `[${attr}]`).join(', ');

const funcIriPattern = /^url\(['"]?#(.*?)['"]?\)$/;

@Component({
	template: '<ng-content></ng-content>',
	selector: 'dia-icon',
	exportAs: 'diaIcon',
	styleUrls: ['icon.scss'],
	inputs: ['color'],
	host: {
		'role': 'img',
		'class': 'dia-icon notranslate',
		'[attr.data-dia-icon-type]': '_usingFontIcon() ? "font" : "svg"',
		'[attr.data-dia-icon-name]': '_svgName || fontIcon',
		'[attr.data-dia-icon-namespace]': '_svgNamespace || fontSet',
		'[class.dia-icon-inline]': 'inline',
		'[class.dia-icon-no-color]': 'color !== "primary" && color !== "accent" && color !== "warn" && color !== "success"',
	},
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiaIcon extends _DiaIconMixinBase implements OnChanges, OnInit, AfterViewChecked,
	CanColor, OnDestroy {

	@Input()
	get inline(): boolean {
		return this._inline;
	}
	set inline(inline: boolean) {
		this._inline = coerceBooleanProperty(inline);
	}
	private _inline: boolean = false;

	@Input() svgIcon: string;

	@Input()
	get fontSet(): string { return this._fontSet; }
	set fontSet(value: string) {
		this._fontSet = this._cleanupFontValue(value);
	}
	private _fontSet: string;

	@Input()
	get fontIcon(): string { return this._fontIcon; }
	set fontIcon(value: string) {
		this._fontIcon = this._cleanupFontValue(value);
	}
	private _fontIcon: string;

	private _previousFontSetClass: string;
	private _previousFontIconClass: string;

	_svgName: string | null;
	_svgNamespace: string | null;

	private _previousPath?: string;

	private _elementsWithExternalReferences?: Map<Element, { name: string, value: string }[]>;

	private _currentIconFetch = Subscription.EMPTY;

	constructor(
		elementRef: ElementRef<HTMLElement>, private _iconRegistry: DiaIconRegistry,
		@Attribute('aria-hidden') ariaHidden: string,
		@Inject(DIA_ICON_LOCATION) private _location: DiaIconLocation,
		private readonly _errorHandler: ErrorHandler) {
		super(elementRef);

		if (!ariaHidden) {
			elementRef.nativeElement.setAttribute('aria-hidden', 'true');
		}
	}

	private _splitIconName(iconName: string): [string, string] {
		if (!iconName) {
			return ['', ''];
		}
		const parts = iconName.split(':');
		switch (parts.length) {
			case 1: return ['', parts[0]]; case 2: return <[string, string]>parts;
			default: throw Error(`Invalid icon name: "${iconName}"`);
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		const svgIconChanges = changes['svgIcon'];

		this._svgNamespace = null;
		this._svgName = null;

		if (svgIconChanges) {
			this._currentIconFetch.unsubscribe();

			if (this.svgIcon) {
				const [namespace, iconName] = this._splitIconName(this.svgIcon);

				if (namespace) {
					this._svgNamespace = namespace;
				}

				if (iconName) {
					this._svgName = iconName;
				}

				this._currentIconFetch = this._iconRegistry.getNamedSvgIcon(iconName, namespace)
					.pipe(take(1))
					.subscribe(svg => this._setSvgElement(svg), (err: Error) => {
						const errorMessage = `Error retrieving icon ${namespace}:${iconName}! ${err.message}`;
						this._errorHandler.handleError(new Error(errorMessage));
					});
			} else if (svgIconChanges.previousValue) {
				this._clearSvgElement();
			}
		}

		if (this._usingFontIcon()) {
			this._updateFontIconClasses();
		}
	}

	ngOnInit() {
		if (this._usingFontIcon()) {
			this._updateFontIconClasses();
		}
	}

	ngAfterViewChecked() {
		const cachedElements = this._elementsWithExternalReferences;

		if (cachedElements && cachedElements.size) {
			const newPath = this._location.getPathname();

			if (newPath !== this._previousPath) {
				this._previousPath = newPath;
				this._prependPathToReferences(newPath);
			}
		}
	}

	ngOnDestroy() {
		this._currentIconFetch.unsubscribe();

		if (this._elementsWithExternalReferences) {
			this._elementsWithExternalReferences.clear();
		}
	}

	_usingFontIcon(): boolean {
		return !this.svgIcon;
	}

	private _setSvgElement(svg: SVGElement) {
		this._clearSvgElement();

		const styleTags = svg.querySelectorAll('style') as NodeListOf<HTMLStyleElement>;

		for (let i = 0; i < styleTags.length; i++) {
			styleTags[i].textContent += ' ';
		}

		const path = this._location.getPathname();
		this._previousPath = path;
		this._cacheChildrenWithExternalReferences(svg);
		this._prependPathToReferences(path);
		this._elementRef.nativeElement.appendChild(svg);
	}

	private _clearSvgElement() {
		const layoutElement: HTMLElement = this._elementRef.nativeElement;
		let childCount = layoutElement.childNodes.length;

		if (this._elementsWithExternalReferences) {
			this._elementsWithExternalReferences.clear();
		}

		while (childCount--) {
			const child = layoutElement.childNodes[childCount];

			if (child.nodeType !== 1 || child.nodeName.toLowerCase() === 'svg') {
				layoutElement.removeChild(child);
			}
		}
	}

	private _updateFontIconClasses() {
		if (!this._usingFontIcon()) {
			return;
		}

		const elem: HTMLElement = this._elementRef.nativeElement;
		const fontSetClass = this.fontSet ?
			this._iconRegistry.classNameForFontAlias(this.fontSet) :
			this._iconRegistry.getDefaultFontSetClass();

		if (fontSetClass != this._previousFontSetClass) {
			if (this._previousFontSetClass) {
				elem.classList.remove(this._previousFontSetClass);
			}
			if (fontSetClass) {
				elem.classList.add(fontSetClass);
			}
			this._previousFontSetClass = fontSetClass;
		}

		if (this.fontIcon != this._previousFontIconClass) {
			if (this._previousFontIconClass) {
				elem.classList.remove(this._previousFontIconClass);
			}
			if (this.fontIcon) {
				elem.classList.add(this.fontIcon);
			}
			this._previousFontIconClass = this.fontIcon;
		}
	}

	private _cleanupFontValue(value: string) {
		return typeof value === 'string' ? value.trim().split(' ')[0] : value;
	}

	private _prependPathToReferences(path: string) {
		const elements = this._elementsWithExternalReferences;

		if (elements) {
			elements.forEach((attrs, element) => {
				attrs.forEach(attr => {
					element.setAttribute(attr.name, `url('${path}#${attr.value}')`);
				});
			});
		}
	}

	private _cacheChildrenWithExternalReferences(element: SVGElement) {
		const elementsWithFuncIri = element.querySelectorAll(funcIriAttributeSelector);
		const elements = this._elementsWithExternalReferences =
			this._elementsWithExternalReferences || new Map();

		for (let i = 0; i < elementsWithFuncIri.length; i++) {
			funcIriAttributes.forEach(attr => {
				const elementWithReference = elementsWithFuncIri[i];
				const value = elementWithReference.getAttribute(attr);
				const diach = value ? value.match(funcIriPattern) : null;

				if (diach) {
					let attributes = elements.get(elementWithReference);

					if (!attributes) {
						attributes = [];
						elements.set(elementWithReference, attributes);
					}

					attributes!.push({ name: attr, value: diach[1] });
				}
			});
		}
	}

	static ngAcceptInputType_inline: BooleanInput;
}

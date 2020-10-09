import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
	ErrorHandler,
	Inject,
	Injectable,
	InjectionToken,
	Optional,
	SecurityContext,
	SkipSelf,
	OnDestroy,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { forkJoin, Observable, of as observableOf, throwError as observableThrow } from 'rxjs';
import { catchError, finalize, map, share, tap } from 'rxjs/operators';

export function getDiaIconNameNotFoundError(iconName: string): Error {
	return Error(`Unable to find icon with the name "${iconName}"`);
}

export function getDiaIconNoHttpProviderError(): Error {
	return Error('Could not find HttpClient provider for use with Angular Material icons. ' +
		'Please include the HttpClientModule from @angular/common/http in your ' +
		'app imports.');
}

export function getDiaIconFailedToSanitizeUrlError(url: SafeResourceUrl): Error {
	return Error(`The URL provided to DiaIconRegistry was not trusted as a resource URL ` +
		`via Angular's DomSanitizer. Attempted URL was "${url}".`);
}

export function getDiaIconFailedToSanitizeLiteralError(literal: SafeHtml): Error {
	return Error(`The literal provided to DiaIconRegistry was not trusted as safe HTML by ` +
		`Angular's DomSanitizer. Attempted literal was "${literal}".`);
}

export interface IconOptions {
	viewBox?: string;
	withCredentials?: boolean;
}

class SvgIconConfig {
	svgElement: SVGElement | null;

	constructor(
		public url: SafeResourceUrl,
		public svgText: string | null,
		public options?: IconOptions) { }
}

type LoadedSvgIconConfig = SvgIconConfig & { svgText: string };

@Injectable({ providedIn: 'root' })
export class DiaIconRegistry implements OnDestroy {
	private _document: Document;
	private _svgIconConfigs = new Map<string, SvgIconConfig>();
	private _iconSetConfigs = new Map<string, SvgIconConfig[]>();
	private _cachedIconsByUrl = new Map<string, SVGElement>();
	private _inProgressUrlFetches = new Map<string, Observable<string>>();
	private _fontCssClassesByAlias = new Map<string, string>();
	private _defaultFontSetClass = 'material-icons';

	constructor(
		@Optional() private _httpClient: HttpClient,
		private _sanitizer: DomSanitizer,
		@Optional() @Inject(DOCUMENT) document: any,
		private readonly _errorHandler: ErrorHandler) {
		this._document = document;
	}

	addSvgIcon(iconName: string, url: SafeResourceUrl, options?: IconOptions): this {
		return this.addSvgIconInNamespace('', iconName, url, options);
	}

	addSvgIconLiteral(iconName: string, literal: SafeHtml, options?: IconOptions): this {
		return this.addSvgIconLiteralInNamespace('', iconName, literal, options);
	}

	addSvgIconInNamespace(namespace: string, iconName: string, url: SafeResourceUrl,
		options?: IconOptions): this {
		return this._addSvgIconConfig(namespace, iconName, new SvgIconConfig(url, null, options));
	}

	addSvgIconLiteralInNamespace(namespace: string, iconName: string, literal: SafeHtml,
		options?: IconOptions): this {
		const cleanLiteral = this._sanitizer.sanitize(SecurityContext.HTML, literal);

		if (!cleanLiteral) {
			throw getDiaIconFailedToSanitizeLiteralError(literal);
		}

		return this._addSvgIconConfig(namespace, iconName,
			new SvgIconConfig('', cleanLiteral, options));
	}

	addSvgIconSet(url: SafeResourceUrl, options?: IconOptions): this {
		return this.addSvgIconSetInNamespace('', url, options);
	}

	addSvgIconSetLiteral(literal: SafeHtml, options?: IconOptions): this {
		return this.addSvgIconSetLiteralInNamespace('', literal, options);
	}

	addSvgIconSetInNamespace(namespace: string, url: SafeResourceUrl, options?: IconOptions): this {
		return this._addSvgIconSetConfig(namespace, new SvgIconConfig(url, null, options));
	}

	addSvgIconSetLiteralInNamespace(namespace: string, literal: SafeHtml,
		options?: IconOptions): this {
		const cleanLiteral = this._sanitizer.sanitize(SecurityContext.HTML, literal);

		if (!cleanLiteral) {
			throw getDiaIconFailedToSanitizeLiteralError(literal);
		}

		return this._addSvgIconSetConfig(namespace, new SvgIconConfig('', cleanLiteral, options));
	}

	registerFontClassAlias(alias: string, className: string = alias): this {
		this._fontCssClassesByAlias.set(alias, className);
		return this;
	}

	classNameForFontAlias(alias: string): string {
		return this._fontCssClassesByAlias.get(alias) || alias;
	}

	setDefaultFontSetClass(className: string): this {
		this._defaultFontSetClass = className;
		return this;
	}

	getDefaultFontSetClass(): string {
		return this._defaultFontSetClass;
	}

	getSvgIconFromUrl(safeUrl: SafeResourceUrl): Observable<SVGElement> {
		const url = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl);

		if (!url) {
			throw getDiaIconFailedToSanitizeUrlError(safeUrl);
		}

		const cachedIcon = this._cachedIconsByUrl.get(url);

		if (cachedIcon) {
			return observableOf(cloneSvg(cachedIcon));
		}

		return this._loadSvgIconFromConfig(new SvgIconConfig(safeUrl, null)).pipe(
			tap(svg => this._cachedIconsByUrl.set(url!, svg)),
			map(svg => cloneSvg(svg)),
		);
	}

	getNamedSvgIcon(name: string, namespace: string = ''): Observable<SVGElement> {
		const key = iconKey(namespace, name);
		const config = this._svgIconConfigs.get(key);

		if (config) {
			return this._getSvgFromConfig(config);
		}

		const iconSetConfigs = this._iconSetConfigs.get(namespace);

		if (iconSetConfigs) {
			return this._getSvgFromIconSetConfigs(name, iconSetConfigs);
		}

		return observableThrow(getDiaIconNameNotFoundError(key));
	}

	ngOnDestroy() {
		this._svgIconConfigs.clear();
		this._iconSetConfigs.clear();
		this._cachedIconsByUrl.clear();
	}

	private _getSvgFromConfig(config: SvgIconConfig): Observable<SVGElement> {
		if (config.svgText) {
			return observableOf(cloneSvg(this._svgElementFromConfig(config as LoadedSvgIconConfig)));
		} else {
			return this._loadSvgIconFromConfig(config).pipe(map(svg => cloneSvg(svg)));
		}
	}

	private _getSvgFromIconSetConfigs(name: string, iconSetConfigs: SvgIconConfig[]):
		Observable<SVGElement> {
		const namedIcon = this._extractIconWithNameFromAnySet(name, iconSetConfigs);

		if (namedIcon) {
			return observableOf(namedIcon);
		}

		const iconSetFetchRequests: Observable<string | null>[] = iconSetConfigs
			.filter(iconSetConfig => !iconSetConfig.svgText)
			.map(iconSetConfig => {
				return this._loadSvgIconSetFromConfig(iconSetConfig).pipe(
					catchError((err: HttpErrorResponse) => {
						const url = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, iconSetConfig.url);

						const errorMessage = `Loading icon set URL: ${url} failed: ${err.message}`;
						this._errorHandler.handleError(new Error(errorMessage));
						return observableOf(null);
					})
				);
			});

		return forkJoin(iconSetFetchRequests).pipe(map(() => {
			const foundIcon = this._extractIconWithNameFromAnySet(name, iconSetConfigs);

			if (!foundIcon) {
				throw getDiaIconNameNotFoundError(name);
			}

			return foundIcon;
		}));
	}

	private _extractIconWithNameFromAnySet(iconName: string, iconSetConfigs: SvgIconConfig[]):
		SVGElement | null {
		for (let i = iconSetConfigs.length - 1; i >= 0; i--) {
			const config = iconSetConfigs[i];

			if (config.svgText && config.svgText.indexOf(iconName) > -1) {
				const svg = this._svgElementFromConfig(config as LoadedSvgIconConfig);
				const foundIcon = this._extractSvgIconFromSet(svg, iconName, config.options);
				if (foundIcon) {
					return foundIcon;
				}
			}
		}
		return null;
	}

	private _loadSvgIconFromConfig(config: SvgIconConfig): Observable<SVGElement> {
		return this._fetchIcon(config).pipe(
			tap(svgText => config.svgText = svgText),
			map(() => this._svgElementFromConfig(config as LoadedSvgIconConfig))
		);
	}

	private _loadSvgIconSetFromConfig(config: SvgIconConfig): Observable<string | null> {
		if (config.svgText) {
			return observableOf(null);
		}

		return this._fetchIcon(config).pipe(tap(svgText => config.svgText = svgText));
	}

	private _extractSvgIconFromSet(iconSet: SVGElement, iconName: string,
		options?: IconOptions): SVGElement | null {
		const iconSource = iconSet.querySelector(`[id="${iconName}"]`);

		if (!iconSource) {
			return null;
		}

		const iconElement = iconSource.cloneNode(true) as Element;
		iconElement.removeAttribute('id');

		if (iconElement.nodeName.toLowerCase() === 'svg') {
			return this._setSvgAttributes(iconElement as SVGElement, options);
		}

		if (iconElement.nodeName.toLowerCase() === 'symbol') {
			return this._setSvgAttributes(this._toSvgElement(iconElement), options);
		}

		const svg = this._svgElementFromString('<svg></svg>');
		svg.appendChild(iconElement);

		return this._setSvgAttributes(svg, options);
	}

	private _svgElementFromString(str: string): SVGElement {
		const div = this._document.createElement('DIV');
		div.innerHTML = str;
		const svg = div.querySelector('svg') as SVGElement;

		if (!svg) {
			throw Error('<svg> tag not found');
		}

		return svg;
	}

	private _toSvgElement(element: Element): SVGElement {
		const svg = this._svgElementFromString('<svg></svg>');
		const attributes = element.attributes;

		for (let i = 0; i < attributes.length; i++) {
			const { name, value } = attributes[i];

			if (name !== 'id') {
				svg.setAttribute(name, value);
			}
		}

		for (let i = 0; i < element.childNodes.length; i++) {
			if (element.childNodes[i].nodeType === this._document.ELEMENT_NODE) {
				svg.appendChild(element.childNodes[i].cloneNode(true));
			}
		}

		return svg;
	}

	private _setSvgAttributes(svg: SVGElement, options?: IconOptions): SVGElement {
		svg.setAttribute('fit', '');
		svg.setAttribute('height', '100%');
		svg.setAttribute('width', '100%');
		svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
		svg.setAttribute('focusable', 'false');
		if (options && options.viewBox) {
			svg.setAttribute('viewBox', options.viewBox);
		}

		return svg;
	}

	private _fetchIcon(iconConfig: SvgIconConfig): Observable<string> {
		const { url: safeUrl, options } = iconConfig;
		const withCredentials = options?.withCredentials ?? false;

		if (!this._httpClient) {
			throw getDiaIconNoHttpProviderError();
		}

		if (safeUrl == null) {
			throw Error(`Cannot fetch icon from URL "${safeUrl}".`);
		}

		const url = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl);

		if (!url) {
			throw getDiaIconFailedToSanitizeUrlError(safeUrl);
		}

		const inProgressFetch = this._inProgressUrlFetches.get(url);

		if (inProgressFetch) {
			return inProgressFetch;
		}

		const req = this._httpClient.get(url, { responseType: 'text', withCredentials }).pipe(
			finalize(() => this._inProgressUrlFetches.delete(url)),
			share(),
		);

		this._inProgressUrlFetches.set(url, req);
		return req;
	}

	private _addSvgIconConfig(namespace: string, iconName: string, config: SvgIconConfig): this {
		this._svgIconConfigs.set(iconKey(namespace, iconName), config);
		return this;
	}

	private _addSvgIconSetConfig(namespace: string, config: SvgIconConfig): this {
		const configNamespace = this._iconSetConfigs.get(namespace);

		if (configNamespace) {
			configNamespace.push(config);
		} else {
			this._iconSetConfigs.set(namespace, [config]);
		}

		return this;
	}

	private _svgElementFromConfig(config: LoadedSvgIconConfig): SVGElement {
		if (!config.svgElement) {
			const svg = this._svgElementFromString(config.svgText);
			this._setSvgAttributes(svg, config.options);
			config.svgElement = svg;
		}

		return config.svgElement;
	}
}

export function ICON_REGISTRY_PROVIDER_FACTORY(
	parentRegistry: DiaIconRegistry,
	httpClient: HttpClient,
	sanitizer: DomSanitizer,
	errorHandler: ErrorHandler,
	document?: any) {
	return parentRegistry || new DiaIconRegistry(httpClient, sanitizer, document, errorHandler);
}

export const ICON_REGISTRY_PROVIDER = {
	provide: DiaIconRegistry,
	deps: [
		[new Optional(), new SkipSelf(), DiaIconRegistry],
		[new Optional(), HttpClient],
		DomSanitizer,
		ErrorHandler,
		[new Optional(), DOCUMENT as InjectionToken<any>],
	],
	useFactory: ICON_REGISTRY_PROVIDER_FACTORY,
};

function cloneSvg(svg: SVGElement): SVGElement {
	return svg.cloneNode(true) as SVGElement;
}

function iconKey(namespace: string, name: string) {
	return namespace + ':' + name;
}

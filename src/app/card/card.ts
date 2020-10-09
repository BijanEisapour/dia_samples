import {
	Component,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	Directive,
	Input,
	Optional,
	Inject,
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

@Directive({
	selector: 'dia-card-content, [dia-card-content], [diaCardContent]',
	host: { 'class': 'dia-card-content' }
})
export class DiaCardContent { }

@Directive({
	selector: `dia-card-title, [dia-card-title], [diaCardTitle]`,
	host: {
		'class': 'dia-card-title'
	}
})
export class DiaCardTitle { }

@Directive({
	selector: `dia-card-subtitle, [dia-card-subtitle], [diaCardSubtitle]`,
	host: {
		'class': 'dia-card-subtitle'
	}
})
export class DiaCardSubtitle { }

@Directive({
	selector: 'dia-card-actions',
	exportAs: 'diaCardActions',
	host: {
		'class': 'dia-card-actions',
		'[class.dia-card-actions-align-end]': 'align === "end"',
	}
})
export class DiaCardActions {
	@Input() align: 'start' | 'end' = 'start';
}

@Directive({
	selector: 'dia-card-footer',
	host: { 'class': 'dia-card-footer' }
})
export class DiaCardFooter { }

@Directive({
	selector: '[dia-card-image], [diaCardImage]',
	host: { 'class': 'dia-card-image' }
})
export class DiaCardImage { }

@Directive({
	selector: '[dia-card-sm-image], [diaCardImageSmall]',
	host: { 'class': 'dia-card-sm-image' }
})
export class DiaCardSmImage { }

@Directive({
	selector: '[dia-card-md-image], [diaCardImageMedium]',
	host: { 'class': 'dia-card-md-image' }
})
export class DiaCardMdImage { }

@Directive({
	selector: '[dia-card-lg-image], [diaCardImageLarge]',
	host: { 'class': 'dia-card-lg-image' }
})
export class DiaCardLgImage { }

@Directive({
	selector: '[dia-card-xl-image], [diaCardImageXLarge]',
	host: { 'class': 'dia-card-xl-image' }
})
export class DiaCardXlImage { }

@Directive({
	selector: '[dia-card-avatar], [diaCardAvatar]',
	host: { 'class': 'dia-card-avatar' }
})
export class DiaCardAvatar { }


@Component({
	selector: 'dia-card',
	exportAs: 'diaCard',
	templateUrl: 'card.html',
	styleUrls: ['card.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'class': 'dia-card dia-focus-indicator',
		'[class._dia-animation-noopable]': '_animationMode === "NoopAnimations"',
	}
})
export class DiaCard {
	constructor(@Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) { }
}


@Component({
	selector: 'dia-card-header',
	templateUrl: 'card-header.html',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'class': 'dia-card-header' }
})
export class DiaCardHeader { }


@Component({
	selector: 'dia-card-title-group',
	templateUrl: 'card-title-group.html',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'class': 'dia-card-title-group' }
})
export class DiaCardTitleGroup { }

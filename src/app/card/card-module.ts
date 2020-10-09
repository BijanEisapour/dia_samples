import { NgModule } from '@angular/core';
import { DiaCommonModule } from '../core';
import {
	DiaCard,
	DiaCardActions,
	DiaCardAvatar,
	DiaCardContent,
	DiaCardFooter,
	DiaCardHeader,
	DiaCardImage,
	DiaCardLgImage,
	DiaCardMdImage,
	DiaCardSmImage,
	DiaCardSubtitle,
	DiaCardTitle,
	DiaCardTitleGroup,
	DiaCardXlImage,
} from './card';

@NgModule({
	imports: [DiaCommonModule],
	exports: [
		DiaCard,
		DiaCardHeader,
		DiaCardTitleGroup,
		DiaCardContent,
		DiaCardTitle,
		DiaCardSubtitle,
		DiaCardActions,
		DiaCardFooter,
		DiaCardSmImage,
		DiaCardMdImage,
		DiaCardLgImage,
		DiaCardImage,
		DiaCardXlImage,
		DiaCardAvatar,
		DiaCommonModule,
	],
	declarations: [
		DiaCard, DiaCardHeader, DiaCardTitleGroup, DiaCardContent, DiaCardTitle, DiaCardSubtitle,
		DiaCardActions, DiaCardFooter, DiaCardSmImage, DiaCardMdImage, DiaCardLgImage, DiaCardImage,
		DiaCardXlImage, DiaCardAvatar,
	],
})
export class DiaCardModule { }

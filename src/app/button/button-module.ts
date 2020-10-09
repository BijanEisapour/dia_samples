import { NgModule } from '@angular/core';
import { DiaCommonModule, DiaRippleModule } from '../core';
import { DiaAnchor, DiaButton } from './button';

@NgModule({
	imports: [
		DiaRippleModule,
		DiaCommonModule,
	],
	exports: [
		DiaButton,
		DiaAnchor,
		DiaCommonModule,
	],
	declarations: [
		DiaButton,
		DiaAnchor,
	],
})
export class DiaButtonModule { }

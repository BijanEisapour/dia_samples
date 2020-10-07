import { NgModule } from '@angular/core';
import { MatCommonModule, MatRippleModule } from '../core';
import { MatAnchor, MatButton } from './button';

@NgModule({
	imports: [
		MatRippleModule,
		MatCommonModule,
	],
	exports: [
		MatButton,
		MatAnchor,
		MatCommonModule,
	],
	declarations: [
		MatButton,
		MatAnchor,
	],
})
export class MatButtonModule { }

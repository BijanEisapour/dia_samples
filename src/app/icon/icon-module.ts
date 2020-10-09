import { NgModule } from '@angular/core';
import { DiaCommonModule } from '../core';
import { DiaIcon } from './icon';


@NgModule({
	imports: [DiaCommonModule],
	exports: [DiaIcon, DiaCommonModule],
	declarations: [DiaIcon],
})
export class DiaIconModule { }

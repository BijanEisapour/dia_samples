import { NgModule } from '@angular/core';
import { DiaCommonModule } from '../core';
import { DiaDivider } from './divider';

@NgModule({
	imports: [DiaCommonModule],
	exports: [DiaDivider, DiaCommonModule],
	declarations: [DiaDivider],
})
export class DiaDividerModule { }

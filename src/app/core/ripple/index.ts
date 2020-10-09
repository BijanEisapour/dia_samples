import { NgModule } from '@angular/core';
import { PlatformModule } from '@angular/cdk/platform';
import { DiaCommonModule } from '../common-behaviors/common-module';
import { DiaRipple } from './ripple';

export * from './ripple';
export * from './ripple-ref';
export * from './ripple-renderer';

@NgModule({
	imports: [DiaCommonModule, PlatformModule],
	exports: [DiaRipple, DiaCommonModule],
	declarations: [DiaRipple],
})
export class DiaRippleModule { }

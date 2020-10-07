import { NgModule } from '@angular/core';
import { PlatformModule } from '@angular/cdk/platform';
import { MatCommonModule } from '../common-behaviors/common-module';
import { MatRipple } from './ripple';

export * from './ripple';
export * from './ripple-ref';
export * from './ripple-renderer';

@NgModule({
	imports: [MatCommonModule, PlatformModule],
	exports: [MatRipple, MatCommonModule],
	declarations: [MatRipple],
})
export class MatRippleModule { }

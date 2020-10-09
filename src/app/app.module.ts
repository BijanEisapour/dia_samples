import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DiaCardModule } from "./card/card-module";
import { DiaButtonModule } from "./button/button-module";
import { DiaIconModule } from "./icon/icon-module";
import { DiaDividerModule } from "./divider/divider-module";

import { ButtonComponent } from './pages/button/button.component';

@NgModule({
	declarations: [AppComponent, ButtonComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		DiaCardModule,
		DiaButtonModule,
		DiaIconModule,
		DiaDividerModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DiaCardModule } from "./card/card-module";
import { DiaButtonModule } from "./button/button-module";
import { MatInputModule } from "./input/input-module";
import { DiaIconModule } from "./icon/icon-module";
import { DiaDividerModule } from "./divider/divider-module";

import { ButtonComponent } from './pages/button/button.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputComponent } from './pages/input/input.component';

@NgModule({
	declarations: [AppComponent, ButtonComponent, InputComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		DiaCardModule,
    DiaButtonModule,
    MatInputModule,
		DiaIconModule,
		DiaDividerModule,
		BrowserAnimationsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

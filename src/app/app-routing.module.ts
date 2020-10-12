import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

import { ButtonComponent } from './pages/button/button.component';
import { InputComponent } from './pages/input/input.component';

const routes: Routes = [
	{ path: '', component: AppComponent },
  { path: 'button', component: ButtonComponent },
  { path: 'input', component: InputComponent }

];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }

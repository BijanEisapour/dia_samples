import { Injectable } from '@angular/core';
import { FormGroupDirective, NgForm, FormControl } from '@angular/forms';

@Injectable()
export class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		return !!(control && control.invalid && (control.dirty || (form && form.submitted)));
	}
}

@Injectable({ providedIn: 'root' })
export class ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		return !!(control && control.invalid && (control.touched || (form && form.submitted)));
	}
}

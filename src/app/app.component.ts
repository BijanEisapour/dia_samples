import { Component, Renderer2 } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	private readonly darkThemeClassName: string = "dia-dark-theme";
	private isDark: boolean;

	constructor(private renderer: Renderer2) {
		this.isDark = false;
	}

	toggleTheme() {
		if (this.isDark)
			this.renderer.removeClass(document.body, this.darkThemeClassName);
		else
			this.renderer.addClass(document.body, this.darkThemeClassName);

		this.isDark = !this.isDark;
	}
}

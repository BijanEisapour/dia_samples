import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
	selector: 'page-button',
	templateUrl: './button.component.html',
	styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements AfterViewInit {
	@ViewChild("playgroundButtons") playgroundButtonsRef: ElementRef;

	public playgroundButtons: Button[] = [];

	ngAfterViewInit() {
		this.playgroundButtons.push(new Button(this.playgroundButtonsRef, false, "dia-flat-button", "dia-primary"));
		this.playgroundButtons.push(new Button(this.playgroundButtonsRef, true, "dia-flat-button", "dia-primary"));
	}

	changeButtonType(e) {
		this.playgroundButtons[0].setType(e.target.value);
		this.playgroundButtons[1].setType(e.target.value);
	}

	changeButtonColor(e, disabled: boolean = false) {
		this.playgroundButtons[0].setColor(e.target.value, disabled);
		this.playgroundButtons[1].setColor(e.target.value, disabled);
	}
}

class Button {
	public element;
	public contentElement;

	public constructor(parent: ElementRef, public isAnchor: boolean, public type: string, public color: string, public icon: string = "favorite", public isIcon: boolean = false) {
		this.element = parent.nativeElement.getElementsByTagName(isAnchor ? "a" : "button")[0];
		this.contentElement = this.element.getElementsByClassName("dia-button-wrapper")[0];
	}

	public setType(_type: string) {
		this.element.classList.remove(this.type);
		this.type = _type;

		if (["dia-icon-button", "dia-fab", "dia-mini-fab"].includes(this.type)) {
			if (this.isAnchor) {
				this.type = "dia-button";
			}
			else {
				this.isIcon = true;
				this.contentElement.innerHTML = `<dia-icon role="img" class="dia-icon notranslate material-icons dia-icon-no-color" aria-hidden="true" data-dia-icon-type="font">favorite</dia-icon>`;
			}
		}
		else if (!this.isAnchor) {
			this.contentElement.innerHTML = "Button";
		}

		this.element.classList.add(this.type);
	}

	public setColor(_color: string, _disabled: boolean) {
		if (this.isAnchor)
			return;

		if (this.color)
			this.element.classList.remove(this.color);
		this.color = _color;
		this.element.classList.add(this.color);

		if (_disabled)
			this.element.setAttribute("disabled", "true");
		else
			this.element.setAttribute("disabled", "false");
	}
}

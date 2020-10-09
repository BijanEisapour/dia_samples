import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
	selector: 'page-button',
	templateUrl: './button.component.html',
	styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements AfterViewInit {
	@ViewChild("playgroundButtons") playgroundButtonsRef: ElementRef;

	public playgroundButtons: Button[] = [];
	public title = "OUT";

	ngAfterViewInit() {
		this.playgroundButtons.push(new Button(this.playgroundButtonsRef, "dia-button", "", "Basic"));
		// this.playgroundButtons[1] = new Button(this.playgroundButtonsRef.nativeElement.getElementsByTagName("a")[0], "dia-button", "");
	}

	changeButtonType(e, isAnchor: boolean, title: string = "favorite") {
		console.log(this.playgroundButtons[0]);
		if (!isAnchor)
			this.playgroundButtons[0].setType(e.target.value, title);
		else
			this.playgroundButtons[1].setType(e.target.value, title);
	}

	changeButtonColor(e, isAnchor: boolean) {
		if (!isAnchor)
			this.playgroundButtons[0].setColor(e.target.value);
		else
			this.playgroundButtons[1].setColor(e.target.value);
	}
}

class Button {
	public element;
	public contentElement;

	public constructor(parent: ElementRef, public type: string, public color: string, public title: string, public icon: string = "favorite", public isIcon: boolean = false) {
		this.element = parent.nativeElement.getElementsByTagName("button")[0];
		this.contentElement = this.element.getElementsByClassName("dia-button-wrapper")[0];

		this.setType("dia-button", "Basic");
	}

	public setType(_type: string, content: string) {
		this.element.classList.remove(this.type);
		this.type = _type;
		this.element.classList.add(this.type);

		if (["dia-icon-button", "dia-fab", "dia-mini-fab"].includes(this.type)) {
			this.isIcon = true;
			this.contentElement.innerHTML = `<dia-icon role="img" class="dia-icon notranslate material-icons dia-icon-no-color" aria-hidden="true" data-dia-icon-type="font">${content}</dia-icon>`;
		}
		else {
			this.contentElement.innerHTML = content;
		}
	}

	public setColor(_color: string) {
		this.element.classList.remove(this.color);
		this.color = _color;
		this.element.classList.add(this.color);
	}
}

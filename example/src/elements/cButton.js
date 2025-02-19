class BaseElement {
    constructor (parentElement, config) {
        this.parentElement = parentElement;
        this.config = config;
    }
}
class Button extends BaseElement {
    static TYPE = 'button';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }

    create() {
        let icon = '';
        let text = '';
        if(this.config.icon){
            icon = `<i class="bi bi-${this.config.icon}${(this.config.text)?' me-2':''}"></i>`;
        }
        if(this.config.text){
            text = this.config.text;
        }
        this.parentElement.insertAdjacentHTML("beforeend", `<button class="btn btn-outline-secondary btn-sm">${icon}${text}</button>`);
    }
}
PageBuilder.addComponent(Button.TYPE, Button);
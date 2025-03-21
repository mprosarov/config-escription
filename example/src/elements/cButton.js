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
        this.parentElement.insertAdjacentHTML("beforeend", `<button style="width: fit-content;" class="btn btn-outline-secondary btn-sm">${icon}${text}</button>`);
        let dom = this.parentElement.lastElementChild;
        BaseElement.applyCss(dom, this.config);
    }
}
PageBuilder.addComponent(Button.TYPE, Button);
class InputField extends BaseElement {
    static TYPE = 'input';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    create() {
        this.parentElement.insertAdjacentHTML("beforeend", `<div class="form-floating">
                <input type="${this.config.dataType}" class="form-control" id="${this.config.id}" ${this.config.disabled} placeholder="">
                <label for="${this.config.id}">${this.config.label}</label></div>`);
        let dom = this.parentElement.lastElementChild;
        BaseElement.applyCss(dom, this.config);
    }
}
PageBuilder.addComponent(InputField.TYPE, InputField);


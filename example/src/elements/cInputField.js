class InputField extends BaseElement {
    static TYPE = 'input';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    create() {
        this.parentElement.insertAdjacentHTML("beforeend", `<div class="input-group input-group-sm mb-3">
  <span class="input-group-text" id="${this.config.id}">${this.config.label}</span>
  <input type="${this.config.dataType}" class="form-control" aria-label="" aria-describedby="${this.config.id}" ${this.config.disabled} >
</div>`);
        let dom = this.parentElement.lastElementChild;
        BaseElement.applyCss(dom, this.config);
    }
}
PageBuilder.addComponent(InputField.TYPE, InputField);



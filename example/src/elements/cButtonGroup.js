class ButtonGroup extends BaseElement {
    static TYPE = 'button-group';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    create() {
        let content = "";
        for (let i = 0; i < this.config.items.length; i++){
            let icon = '';
            let text = '';
            if(this.config.items[i].icon)
                icon = `<i class="bi bi-${this.config.items[i].icon}${(this.config.items[i].text)?' me-2':''}"></i>`;
            if(this.config.items[i].text)
                text = this.config.items[i].text;
            content += `<button class="btn btn-outline-${this.config.items[i].class} btn-sm" type="button">${icon}${text}</button>`;
        } 
        let result = `<div class="input-group">${content}</div>`;
        this.parentElement.insertAdjacentHTML("beforeend", result);
        let dom = this.parentElement.lastElementChild;
        BaseElement.applyCss(dom, this.config);
    }
}
PageBuilder.addComponent(ButtonGroup.TYPE, ButtonGroup); 
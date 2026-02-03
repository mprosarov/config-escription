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
        this.parentElement.insertAdjacentHTML("beforeend", `<button style="width: fit-content;" class="btn btn-outline-secondary btn-sm" ${this.config.status}>${icon}${text}</button>`);
        let dom = this.parentElement.lastElementChild;
        BaseElement.applyCss(dom, this.config);

        this.buttonElement = dom;
        console.log("Button config: ", this.config)
        //проверяем есть ли в конфиге экшены 
        if (this.config.actions) {
            console.log("Button has actions, creating BaseAction:", this.config.actions);
            
            //создаем BaseAction для кнопки 
            new BaseAction(this.parentElement, this.config.actions, this.buttonElement);
        }
    }
}
PageBuilder.addComponent(Button.TYPE, Button);
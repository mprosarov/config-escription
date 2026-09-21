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

        // Сохраняем ссылку на DOM элемент
        this.buttonElement = dom;

        console.log("Button config: ", this.config)

        // Если есть actions, создаем BaseAction для кнопки (так же как в TableTabulator)
        if (this.config.actions) {
            console.log("Button has actions, creating via ActionRegistry:", this.config.actions);
            
            // Создаем экшены через ActionRegistry (аналогично TableTabulator)
            ActionRegistry.createFromConfig(this.parentElement, this.config.actions, this.buttonElement);
        }
    }
}
PageBuilder.addComponent(Button.TYPE, Button);
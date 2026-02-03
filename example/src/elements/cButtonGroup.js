class ButtonGroup extends BaseElement {
  static TYPE = "button-group";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  create() {
    let content = "";
    const groupId = this.config.id || `btngroup_${Date.now()}`;
    console.log("ButtonGroup config: ", this.config);
    for (let i = 0; i < this.config.elements.length; i++) {
      console.log("ButtonGroup config id", this.config.elements[i].id)
      let icon = "";
      let text = "";
      if (this.config.elements[i].icon)
        icon = `<i class="bi bi-${this.config.elements[i].icon}${
          this.config.elements[i].text ? " me-2" : ""
        }"></i>`;
      if (this.config.elements[i].text) text = this.config.elements[i].text;
      content += `<button class="btn btn-outline-${this.config.elements[i].class} btn-sm" type="button" id="${this.config.elements[i].id}" ${this.config.elements[i].status}>${icon}${text}</button>`;
    }
    let result = `<div class="input-group">${content}</div>`;
    this.parentElement.insertAdjacentHTML("beforeend", result);
    let dom = this.parentElement.lastElementChild;
    BaseElement.applyCss(dom, this.config);

    //добавляем экшены для каждой кнопки 
    for (let i = 0; i < this.config.elements.length; i++) {
        const elementConfig = this.config.elements[i];
        console.log("ButtonGroup elementConfig for:", elementConfig);
        console.log("ButtonGroup elementConfig id for", elementConfig.id);

        const buttonId = elementConfig.id || `${groupId}_btn${i}`;
        const buttonElement = document.getElementById(buttonId);

        console.log("ButtonGroup log buttonElement: ", buttonElement)
        console.log("ButtonGroup log elementConfig.action: ", elementConfig.actions)
        console.log("ButtonGroup log isIf: ", buttonElement && elementConfig.actions)

        if (buttonElement && elementConfig.actions) {
          console.log("Creating BaseAction for button:", buttonId, elementConfig.actions);
          
          //создаем BaseAction для кнопки в группе кнопок
          new BaseAction(this.parentElement, elementConfig.actions, buttonElement);
        }
      }
  }
}
PageBuilder.addComponent(ButtonGroup.TYPE, ButtonGroup);

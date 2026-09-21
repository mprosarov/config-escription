class ButtonGroup extends BaseElement {
  static TYPE = "button-group";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  /**
   * TODO: дописать проверку на id с добавлением дефолтного значения
   */
  create() {
    
    let content = "";
    let result = "";
    const groupId = this.config.id || `btngroup_${Date.now()}`;

    console.log("ButtonGroup config: ", this.config);
    console.log("ButtonGroup parentElement", this.parentElement);

    for (let i = 0; i < this.config.elements.length; i++) {
      let icon = "";
      let text = "";
      if (this.config.elements[i].icon)
        icon = `<i class="bi bi-${this.config.elements[i].icon}${
          this.config.elements[i].text ? " me-2" : ""
        }"></i>`;
      if (this.config.elements[i].text) text = this.config.elements[i].text;
      content += `<button class="btn btn-outline-${this.config.elements[i].class} btn-sm" type="button" id="${this.config.elements[i].id}" ${this.config.elements[i].status}>${icon}${text}</button>`;
    }

    //Костыль для кнопок у таблицы
    console.log("isTable-menu: ", this.config["table-menu"]);
    if (this.config["table-menu"])
      result = `<div class="input-group-table">${content}</div>`;
    else 
      result = `<div class="input-group" >${content}</div>`;
    console.log("After result", result)

    //result = `<div class="input-group">${content}</div>`;
    this.parentElement.insertAdjacentHTML("beforeend", result);
    let dom = this.parentElement.lastElementChild;
    BaseElement.applyCss(dom, this.config);

    //после создания DOM, добавляем actions для каждой кнопки
    for (let i = 0; i < this.config.elements.length; i++) {
        const elementConfig = this.config.elements[i];
        const buttonId = elementConfig.id || `${groupId}_btn${i}`;
        const buttonElement = document.getElementById(buttonId);

        if (buttonElement && elementConfig.actions) {
          console.log("Creating BaseAction for button:", buttonId, elementConfig.actions);
          
          // Создаем BaseAction для кнопки 
          ActionRegistry.createFromConfig(this.parentElement, elementConfig.actions, buttonElement);
        }
      }
  }
}
PageBuilder.addComponent(ButtonGroup.TYPE, ButtonGroup);

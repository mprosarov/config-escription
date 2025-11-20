class ButtonGroup extends BaseElement {
  static TYPE = "button-group";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  create() {
    let content = "";
    for (let i = 0; i < this.config.elements.length; i++) {
      let icon = "";
      let text = "";
      if (this.config.elements[i].icon)
        icon = `<i class="bi bi-${this.config.elements[i].icon}${
          this.config.elements[i].text ? " me-2" : ""
        }"></i>`;
      if (this.config.elements[i].text) text = this.config.elements[i].text;
      content += `<button class="btn btn-outline-${this.config.elements[i].class} btn-sm" type="button" ${this.config.elements[i].status}>${icon}${text}</button>`;
    }
    let result = `<div class="input-group">${content}</div>`;
    this.parentElement.insertAdjacentHTML("beforeend", result);
    let dom = this.parentElement.lastElementChild;
    BaseElement.applyCss(dom, this.config);
  }
}
PageBuilder.addComponent(ButtonGroup.TYPE, ButtonGroup);

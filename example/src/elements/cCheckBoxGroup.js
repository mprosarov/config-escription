class CheckBoxGroup extends BaseElement {
    static TYPE = 'checkbox';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    create() {
      this.parentElement.insertAdjacentHTML("beforeend", `<div class="form-group ${this.config.inline ? "flex" : ""}"></div>`);
      let block = this.parentElement.lastElementChild;          
      let content = "";
      for (let i = 0; i < this.config.items.length; i++) {
        let item = this.config.items[i];
        content += `<div class="form-check ${item.role ? "form-switch" : ""} ">
                          <input class="form-check-input" type='checkbox' role="${item.role}" value="${item.value}" id="${item.id}" ${item.status} ${item.checked ? "checked" : ""} >
                          <label class="form-check-label" for=${item.id}>
                            ${item.label}
                          </label>
                      </div>`;
      }
  
      block.insertAdjacentHTML("beforeend", content);
      BaseElement.applyCss(this.parentElement.lastElementChild, this.config);
      return block;
     }
}
PageBuilder.addComponent(CheckBoxGroup.TYPE, CheckBoxGroup); 
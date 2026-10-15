class CheckBoxGroup extends BaseElement {
  static TYPE = "checkbox";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  //TODO: не работает статус, доработать
  create() {
    this.parentElement.insertAdjacentHTML(
      "beforeend",
      `<div class="form-group ${this.config.inline ? "flex" : ""}"></div>`,
    );
    let block = this.parentElement.lastElementChild;
    let content = "";
    const data = this.config.elements;
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      const value = PageBuilder.getParamValue(item.paramName);
      content += `<div class="form-check ${item.role ? "form-switch" : ""} ">
                          <input class="form-check-input"  role="${
                            item.role ? "form-switch" : ""
                          }" data-param = "${item.paramName}" type='checkbox' value="${value}" id="${item.id}" ${
                            item.status
                          } ${value == 1 ? "checked" : ""}>
                          <label class="form-check-label" for=${item.id}>
                            ${item.label}
                          </label>
                      </div>`;
    }

    block.insertAdjacentHTML("beforeend", content);
    // Событие изменения значения
    block.querySelectorAll("input").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        console.log(e);
        let p = e.target.dataset.param;
        super.updateParam(p, e.target.value);
      });
    });
    BaseElement.applyCss(this.parentElement.lastElementChild, this.config);
    return block;
  }
}
PageBuilder.addComponent(CheckBoxGroup.TYPE, CheckBoxGroup);

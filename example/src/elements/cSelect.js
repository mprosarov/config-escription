class Select extends BaseElement {
  static TYPE = "select";
  content = null;
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }

  async create() {
    if (this.config.datasource && this.config.datasource.length > 1) {
      const ds = PageBuilder.getDS(this.config.datasource);
      const data = await ds.fetchQuery();
      this.content = this.createOptions(
        data.resultset,
        this.config.dsValueField,
        this.config.dsTextField,
      );
    } else {
      this.content = this.createOptions(this.config.options, "value", "name");
    }
    this.parentElement.insertAdjacentHTML(
      "beforeend",
      `<div class="input-group input-group-sm">
        <select type="${this.config.type}"
        class="form-select form-select-sm" aria-label=".form-select-sm" ${
          this.config.status ? this.config.status : "unabled"
        }>${this.content}</select>`,
    );
    let position = "";
    if (this.config.labelPosition == "left") position = "afterbegin";
    else position = "beforeend";
    let dom = this.parentElement.lastElementChild;
    dom.insertAdjacentHTML(
      position,
      `<label class="input-group-text">
        ${this.config.label}
        </label></div>`,
    );
    dom.querySelector("select").addEventListener("change", (e) => {
      super.updateParam(this.config.paramName, e.target.value);
    });
    BaseElement.applyCss(dom, this.config);
  }
  createOptions(data, value, text) {
    // TODO: значение по умолчанию ?????
    // переадресация?
    let content = data
      .map((item) => `<option value=${item[value]}>${item[text]}</option>`)
      .join("");
    return content;
  }
}
PageBuilder.addComponent(Select.TYPE, Select);

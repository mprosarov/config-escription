class Select extends BaseElement {
    static TYPE = 'select';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    create() {
      let content = "";
      for (let i = 0; i < this.config.items.length; i++) {
        let item = this.config.items[i];
        content += `<option value=${item.value} ${item.selected?"selected":""}>${item.name}</option>`;
      }
      this.parentElement.insertAdjacentHTML("beforeend",`<div class="input-group input-group-sm mb-3">
        <select class="form-select form-select-sm" aria-label=".form-select-sm" ${this.config.status ? this.config.status:'unabled' }>${content}</select>` );
      let position = "";  
      if(this.config.labelPosition == 'left') position = "afterbegin"
      else position = "beforeend"
      let dom = this.parentElement.lastElementChild;
      dom.insertAdjacentHTML(position,`<label class="input-group-text">
        ${this.config.label}
        </label></div>`) 
      BaseElement.applyCss(dom, this.config);
  }
}
PageBuilder.addComponent(Select.TYPE, Select);
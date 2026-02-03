class ItemsBlock extends BaseElement {
  static TYPE = "block";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  create() {
    this.parentElement.insertAdjacentHTML(
      "beforeend",
      `<div class="itemsBlock d-flex flex-fill flex-${this.config.orientation}"></div>`
    );
    let dom = this.parentElement.lastElementChild;
    let items = this.config.items;
    for (let i = 0; i < items.length; i++) PageBuilder.create(dom, items[i]);
    BaseElement.applyCss(dom, this.config);
  }
}
PageBuilder.addComponent(ItemsBlock.TYPE, ItemsBlock);

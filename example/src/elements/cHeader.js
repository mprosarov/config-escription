/*
Пример конфигурации компонента:
 {
     "type": "header",
     "text": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, aperiam?",
     "size": "3"
 }
*/
class Header extends BaseElement {
  static TYPE = "header";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }

  create() {
    let headerSize = "";
    let text = "";
    if (this.config.text) {
      text = this.config.text;
    }
    if (this.config.size) {
        headerSize = "h" + this.config.size;
    } else {
        headerSize = "h1";
    }
    this.parentElement.insertAdjacentHTML("beforeend", `<div class="${headerSize}">${text}</div>`);
    let dom = this.parentElement.lastElementChild;
    BaseElement.applyCss(dom,this.config);
  }
}
PageBuilder.addComponent(Header.TYPE, Header);

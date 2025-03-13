/*
 1. Создать класс который наследуется от класса BaseElement
 2. Создать статическое свойство компонента TYPE, которое соответствует типу(поле typr) компонента в конфигурации.
 3. Переопределить конструктор и передать в конструктор родительского класса параметры элемента.
 4. Переопределить метод создания компонента(create), в котором будет создан элемент и добавлен в родительский элемент.
*/
class RadioGroup extends BaseElement {
  static TYPE = "radio-group";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  create() {
    this.parentElement.insertAdjacentHTML("beforeend", '<div class="form-group"></div>');
    let block = this.parentElement.lastElementChild;
    let content = "";
    for (let i = 0; i < this.config.items.length; i++) {
      let item = this.config.items[i];
      content += `<div class="form-check ${this.config.inline ? "form-check-inline" : ""}">
                        <input class="form-check-input" type='radio' name="${this.config.name}" value="" id="${item.id}" ${item.status} ${item.checked ? "checked" : ""} >
                        <label class="form-check-label" for=${item.id}>
                          ${item.label}
                        </label>
                    </div>`;
    }
    block.insertAdjacentHTML("beforeend", content);
    return block;
  }
}
PageBuilder.addComponent(RadioGroup.TYPE, RadioGroup);
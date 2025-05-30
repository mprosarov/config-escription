/*
 1. Создать класс который наследуется от класса BaseElement
 2. Создать статическое свойство компонента TYPE, которое соответствует типу(поле typr) компонента в конфигурации.
 3. Переопределить конструктор и передать в конструктор родительского класса параметры элемента.
 4. Переопределить метод создания компонента(create), в котором будет создан элемент и добавлен в родительский элемент.
*/

class PageParam {
    static TYPE = "param";
    params = [];
    constructor (parentElement, config) {
        this.parentElement = parentElement;
        this.config = config;
        this.create();

    }
    create() {
        console.log('PageParam')
    }

}
PageBuilder.addComponent(PageParam.TYPE, PageParam);
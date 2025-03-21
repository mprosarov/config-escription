/*
 1. Создать класс который наследуется от класса BaseElement
 2. Создать статическое свойство компонента TYPE, которое соответствует типу(поле typr) компонента в конфигурации.
 3. Переопределить конструктор и передать в конструктор родительского класса параметры элемента.
 4. Переопределить метод создания компонента(create), в котором будет создан элемент и добавлен в родительский элемент.
*/

class Tabs extends BaseElement {
    static TYPE = "tabs";
    static idCounter = 0; // Статическое свойство для хранения счетчика
    constructor(parentElement, config) {
        super(parentElement, config);
        Tabs.idCounter++;// Увеличиваем счетчик на 1 при создании нового экземпляра
        this.create();
    }

    create() {
        let globalID = Tabs.idCounter;
        let contentTab, contentUL;
        this.parentElement.insertAdjacentHTML("beforeend", '<ul class="nav nav-tabs" id="myTab" role="tablist"></ul>'); // убери тут id="myTab"
        let tabBox = this.parentElement.lastElementChild;
        let tabs = this.config.items;
        for (let i=0; i<tabs.length; i++) {
            contentTab = `<li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-${globalID}-${i}" data-bs-toggle="tab" data-bs-target="#tab-${globalID}-${i}-pane" type="button" role="tab" aria-controls="tab-${globalID}-${i}-pane" aria-selected="false">${tabs[i]["tab_name"]}</button>
                            </li>`;
            tabBox.insertAdjacentHTML("beforeend", contentTab);
        }
        tabBox.firstElementChild.querySelector("button").click();
        this.parentElement.insertAdjacentHTML("beforeend", '<div class="tab-content"></div>');
        let tab = this.parentElement.lastElementChild;
        for (let i=0; i<tabs.length; i++) {
            if (i==0) contentUL = `<div class="tab-pane fade show active" id="tab-${globalID}-${i}-pane" role="tabpanel" aria-labelledby="tab-${globalID}-${i}" tabindex="0"></div>`;
            else contentUL = `<div class="tab-pane fade" id="tab-${globalID}-${i}-pane" role="tabpanel" aria-labelledby="tab-${globalID}-${i}" tabindex="0"></div>`;
            
            tab.insertAdjacentHTML("beforeend", contentUL);
            for (let j = 0; j < tabs[i].items.length; j++) 
                PageBuilder.create(tab.lastElementChild,tabs[i].items[j]);
        }
    }
}

PageBuilder.addComponent(Tabs.TYPE, Tabs);
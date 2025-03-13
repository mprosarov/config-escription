//=========================================
//           pageBuilder.js
//=========================================
const PageBuilder = (function(){
    let navbar = null;
    let domPage = null;
    //Коллекция компонентов
    let components = {}
    //Добавление компонента в общий список
    function addComponent(type,component) {
        if (components[type]) {
          throw new Error(`Компонент с таким типом уже существует. type=${type}`);
        }
        components[type] = component;
    }
    function create(parentElement,config) {
        if(!components[config.type]){
            throw new Error(`Компонента с таким типом не существует. type=${config.type}`);
        }
        return new components[config.type](parentElement,config);
    }
    // Создаем навигационную панель
    function createMainNavBar(config){
        navbar = new NavBar(document.body, config);
    }
    // создать страницу по конфигурации
    function createPage(config){
        if (config["navbar"]) PageBuilder.createMainNavBar(config.navbar);
        document.body.insertAdjacentHTML("beforeend", '<div class="app-page"></div>');
        domPage = document.body.lastElementChild;
        if(config["page"]){
            config.page.forEach(item => {PageBuilder.create(domPage,item);});
        }
    }
    return {
      addComponent,
      create,
      createPage,
      createMainNavBar
    };
})();
/*=========================================
             cMenu.js
=========================================*/
class Menu {
  static TYPE = "menu";
  constructor(parent, menuData) {
    this.menuData = menuData;
    this.parent = parent;
    this.create();
  }

  create() {
    this.parent.insertAdjacentHTML("beforeend", `<div class="navbar navbar-expand"><ul class="navbar-nav mr-auto mb-2 mb-sm-0 flex-row"></ul></div>`);
    const menuContainer = this.parent.lastElementChild.lastElementChild;
    this.menuData.items.forEach((item) => {
      let menuItem = this.createMenuItem(menuContainer, item);
      menuContainer.appendChild(menuItem);
    });
    return menuContainer;
  }

  createMenuItem(parentEl, item) {
    parentEl.insertAdjacentHTML("beforeend", `<li class="nav-item"><a class="nav-link" href="${item.link}">${item.title}</a></li>`);
    const li_element = parentEl.lastElementChild;
    const a_element = li_element.lastElementChild;
    if (!item.submenu || item.submenu.length == 0) return li_element;
    // У пункта есть подменю - добавляем необходимые классы
    li_element.classList.add("dropdown");
    a_element.classList.add("dropdown-toggle");
    a_element.setAttribute("data-bs-toggle", "dropdown");
    a_element.setAttribute("data-bs-auto-close", "outside");
    li_element.insertAdjacentHTML("beforeend", `<ul class="dropdown-menu shadow"></ul>`);
    const submenuContainer = li_element.lastElementChild;
    item.submenu.forEach((subitem) => {
      submenuContainer.appendChild(this.createSubMenu(submenuContainer, subitem));
    });
    li_element.appendChild(submenuContainer);
    return li_element;
  }

  createSubMenu(parentEl, item) {
    parentEl.insertAdjacentHTML(
      "beforeend",
      `<li>
        <a class="dropdown-item" href="${item["link"] || "#"}">${item.title}</a>
      </li>`
    );
    const li_element = parentEl.lastElementChild;
    const a_element = li_element.lastElementChild;
    // Если нет подменю - возвращаем элемент
    if (!item.submenu || item.submenu.length == 0) return li_element;
    // У пункта есть подменю - добавляем необходимые классы
    li_element.classList.add("dropend");
    a_element.classList.add("dropdown-toggle");
    a_element.setAttribute("data-bs-toggle", "dropdown");
    a_element.setAttribute("data-bs-auto-close", "outside");
    li_element.insertAdjacentHTML("beforeend", `<ul class="dropdown-menu dropdown-submenu shadow"></ul>`);
    const submenuContainer = li_element.lastElementChild;
    item.submenu.forEach((subitem) => {
      this.createSubMenu(submenuContainer, subitem);
    });
    return li_element;
  }
}
PageBuilder.addComponent(Menu.TYPE, Menu);
class NavBar {
    static TYPE = 'navbar';
    menuBlock = null;
    buttonsBlock = null;
    titleBlock = null;
    constructor (parentElement, config) {
        this.parentElement = parentElement;
        this.config = config;
        this.create();
    }
    create() {
        // Если указана позиция left, заголовок будет слева иначе всегда справа
        let positionTitle = (this.config['titlePosition'] == 'left' ? '-reverse' : '');
        let positionMenu = (this.config['menuPosition'] == 'bottom' ? '-reverse' : '');
        let navbarHTML = `<nav class="navbar navbar-expand-sm navbar-light bg-light navbar-light shadow">
                            <div class="container-fluid flex-row${positionTitle}">
                                <div class="collapse navbar-collapse">
                                    <div style="display:flex;align-items: start;flex-direction:column${positionMenu}">
                                        <div data-menu class="navbar-nav mr-auto mb-2 mb-sm-0"></div>
                                        <div data-buttons class="navbar-nav mr-auto mb-2 mb-sm-0"></div>
                                    </div>
                                </div>
                                <div data-title class="navbar-brand"></div>
                            </div>
                        </nav>`;
        this.parentElement.insertAdjacentHTML('beforeend', navbarHTML);
        this.menuBlock = this.parentElement.lastElementChild.querySelector("[data-menu]");
        this.buttonsBlock = this.parentElement.lastElementChild.querySelector("[data-buttons]");
        this.titleBlock = this.parentElement.lastElementChild.querySelector("[data-title]");
        if(this.config.items && this.config.items.length) {
            this.config.items.forEach(item => {
                switch (item.type) {
                    case Menu.TYPE:
                        PageBuilder.create(this.menuBlock, item);
                        break;
                    case Button.TYPE:
                        PageBuilder.create(this.buttonsBlock, item);
                        break;
                    default:
                        console.warn(`Неизвестный тип компонента: ${item.type}`);
                        break;
                }
            });
        }
   }
}
PageBuilder.addComponent(NavBar.TYPE, NavBar);
class BaseElement {
    constructor (parentElement, config) {
        this.parentElement = parentElement;
        this.config = config;
    }
}
class Button extends BaseElement {
    static TYPE = 'button';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }

    create() {
        let icon = '';
        let text = '';
        if(this.config.icon){
            icon = `<i class="bi bi-${this.config.icon}${(this.config.text)?' me-2':''}"></i>`;
        }
        if(this.config.text){
            text = this.config.text;
        }
        this.parentElement.insertAdjacentHTML("beforeend", `<button class="btn btn-outline-secondary btn-sm">${icon}${text}</button>`);
    }
}
PageBuilder.addComponent(Button.TYPE, Button);
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
class TableTabulator extends BaseElement {
    static TYPE = 'table-tabulator';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    recursiveSearchColumns(data, target) {
      let values = {
        headerHozAlign: "center",
        hozAlign: "center",
        headerWordWrap: true,
      };
      if (!data[target] || data[target].length < 1) return;
      for (let i = 0; i < data[target].length; i++) {
        let child = data[target][i];
        child = Object.assign(child, values);
        this.recursiveSearchColumns(child, target);
      }
    }
    create(){
        let contentTable = `<div><h6>${this.config["name"]}</h6>
                                <div id="${this.config["id"]}"></div>
                            </div>`;
        this.parentElement.insertAdjacentHTML("beforeend", contentTable);

        this.recursiveSearchColumns(this.config["tdata"], "columns");
        if (this.config["indexCols"]) {
          this.config["tdata"]["data"].unshift(this.config["indexCols"]);
          this.config["tdata"]["frozenRows"] = 1;
        }
        new Tabulator(`#${this.config["id"]}`, this.config["tdata"]);
    }
}
PageBuilder.addComponent(TableTabulator.TYPE, TableTabulator);

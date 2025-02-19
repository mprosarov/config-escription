//=========================================
//           pageBuilder.js
//=========================================
const PageBuilder = (function(){
    let navbar = null;
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
    return {
      addComponent,
      create,
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

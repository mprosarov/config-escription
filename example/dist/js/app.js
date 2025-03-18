//=========================================
//           pageBuilder.js
//=========================================
const PageBuilder = (function(){
    const URL = "http://localhost:3000/config";
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
    // Загрузить json конфигурацию страницы с сервера по имени файла
    async function loadPageConfig(configName,params){
        // очищаем страницу, чтобы построить новую по загруженной конфигурации
        clear();
        // показываем лоадер
        document.body.insertAdjacentHTML("beforeend", `<section class="loader-container">
                                                            <div class="dot"></div>
                                                            <div class="dot"></div>
                                                            <div class="dot"></div>
                                                            <div class="dot"></div>
                                                            <div class="dot"></div>
                                                        </section>`);
        let loader = document.body.querySelector(".loader-container");
        try {
          let response = await fetch(`${URL}?name=${configName}`);
          let config = await response.json();
          console.log(response);
          // если файл не найден или произошла ошибка, то выводим сообщение об ошибке и завершаем работу
          if(response.status !== 200){
            throw new Error(`Ошибка при загрузке файла: ${configName}. ${config.error}`);
          }
          // создаем страницу по загруженной конфигурации
          createPage(config);
          // удаляем лоадер
          loader.remove();
        } catch (error) {
            loader.innerHTML = `<div class="loader-error">${error.message}</div>`;
        }
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
        if (config["sidebars"]) {
            PageBuilder.create(document.body,config["sidebars"]);
        }
    }
    //Очистить страницу
    function clear(){
        // проходим по всем элементам на странице и удаляем их
        let nodes = [...document.body.children].filter(node => node.nodeName !== "SCRIPT")
        nodes.forEach(node => node.parentElement.removeChild(node));
   }
    return {
      addComponent,
      create,
      createPage,
      createMainNavBar,
      loadPageConfig
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
    if (!item.submenu || item.submenu.length == 0){
      //TODO: проверять какое действие нужно делать если нет подменю
      a_element.onclick = () => {
        event.preventDefault();
        console.log(item.link)
        PageBuilder.loadPageConfig(item.link);
      }
      return li_element;
    }
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
/*
 1. Создать класс который наследуется от класса BaseElement
 2. Создать статическое свойство компонента TYPE, которое соответствует типу(поле typr) компонента в конфигурации.
 3. Переопределить конструктор и передать в конструктор родительского класса параметры элемента.
 4. Переопределить метод создания компонента(create), в котором будет создан элемент и добавлен в родительский элемент.
*/

class Tabs extends BaseElement {
    static TYPE = "tabs";
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }

    create() {
        let globalID = 1;
        let contentTab, contentUL;
        globalID++;
        this.parentElement.insertAdjacentHTML("beforeend", '<ul class="nav nav-tabs" id="myTab" role="tablist"></ul>');
        let tabBox = this.parentElement.lastElementChild;
        let tabs = this.config.items;
        for (let i=0; i<tabs.length; i++) {
            contentTab = `<li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-${globalID}-${i}" data-bs-toggle="tab" data-bs-target="#tab-${globalID}-${i}-pane" type="button" role="tab" aria-controls="tab-${globalID}-${i}-pane" aria-selected="false">${tabs[i]["tab_name"]}</button>
                            </li>`;
            tabBox.insertAdjacentHTML("beforeend", contentTab);
        }
        tabBox.firstElementChild.querySelector("button").click();
        this.parentElement.insertAdjacentHTML("beforeend", '<div class="tab-content" style="padding: 15px;"></div>');
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
/*
 1. Создать класс который наследуется от класса BaseElement
 2. Создать статическое свойство компонента TYPE, которое соответствует типу(поле typr) компонента в конфигурации.
 3. Переопределить конструктор и передать в конструктор родительского класса параметры элемента.
 4. Переопределить метод создания компонента(create), в котором будет создан элемент и добавлен в родительский элемент.
*/

class SideBar extends BaseElement {
    static TYPE = "sidebar";
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }

    create() {
        // const _allSidebars = [];
        // let openCount = 0;
        //     let obj = this.config.items
        //   let content = `<div class="offcanvas offcanvas-${obj.position}" tabindex="-1">
        //                     <button style="font-size: 0; z-index: 1060;" data-btn="btn-outline-${obj.position}" class="btn btn-outline-${obj.position} btn-sm" data-type="sidebar" type="button" aria-controls="${obj.id}"></button>
        //                     <div class="offcanvas-body"></div>
        //                </div>`;
        //   this.parentElement.insertAdjacentHTML("beforeend", content);
        //   //Проходим по дочерним элементам у sidebara
        //   parentForChild = this.parentElement.lastElementChild.querySelector(".offcanvas-body");
        //   for(let i=0;i<this.config.items.length;i++){
        //     PageBuilder.create(parentForChild,this.config.items[i]);
        //   }
        //   let sidebarBS = new bootstrap.Offcanvas(this.parentElement.lastElementChild);
        //   sidebarBS._element.querySelector(`button[data-type="sidebar"]`).onclick = function () {
        //     sidebarBS.toggle();
        //   };
        //   _allSidebars.push(sidebarBS);
        //   sidebarBS._element.addEventListener("hidden.bs.offcanvas", (event) => {
        //     openCount--;
        //   });
        //   sidebarBS._element.addEventListener("show.bs.offcanvas", (event) => {
        //     openCount++;
        //   });
       
        // function _initEvent(){
        //   window.addEventListener("click", (e) => {
        //     if(openCount<2) return;
        //     if (!e.target.closest(".offcanvas") && !e.target.closest(`[data-type="sidebar"]`)) {
        //       _allSidebars.forEach((offcanvas) => {
        //         offcanvas.hide();
        //       });
        //     }
        //   });
        // };
        //   _initEvent();

    }
}
PageBuilder.addComponent(SideBar.TYPE, SideBar);

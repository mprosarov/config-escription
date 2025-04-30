//=========================================
//           pageBuilder.js
//=========================================
const PageBuilder = (function(){
    const URL = "http://localhost:3000/config";
    //const URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest"
    
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
        // лоадер
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
        //   let response = await fetch(`${URL}/getinterfaceconfig?scode=${configName}`);
        //   let result = await response.json();
        //   let config = result.result;
          
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
            config["sidebars"].forEach(item=>{PageBuilder.create(document.body,item)})
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
//TODO:Сделоать объект в котором, указано на какое свойсво в конфиге смотреть, для каждого свойства указать какой параметр менять в style,
//какие единицы измерения использовать
/*
{
    configKey:"ИмяКлюча",
    values:[
        {
            configName:"ИмяКлюча",
            styleName:"ИмяСтиля(paddingTop)" ,
            demension:"px",
        }
    ]
}
        "Оформление":{
          "ВнутренниеОтступы":{
            "ВерхнийОтсуп":10,
            "НижнийОтступ":50
          },
          "Цвет":{
            "ЦветФона":"#0000ff",
            "ЦветТекста":"#ff0000"
          }
        }
*/

const CONFIG_PAGE = {
  STYLE: "Оформление",
  PADDING_STYLE: "ВнутренниеОтступы",
  PADDING_TOP: "ВерхнийОтсуп",
  PADDING_BOTTOM: "НижнийОтступ",
  COLOR_STYLE: "Цвет",
  COLOR_BG: "ЦветФона",
  COLOR_TEXT: "ЦветТекста",
  MARGIN_STYLE: "ВнешниеОтступы",
  MARGIN_TOP: "ВерхнийОтсуп",
  MARGIN_LEFT: "ЛевыйОтсуп",
  MARGIN_RIGHT: "ПравыйОтсуп",
  MARGIN_BOTTOM: "НижнийОтступ",
};
class BaseElement {
  constructor(parentElement, config) {
    this.parentElement = parentElement;
    this.config = config;
  }
  static applyCss(element, config) {
    if (!config[CONFIG_PAGE.STYLE]) return;
    const style = config[CONFIG_PAGE.STYLE];
    if (style[CONFIG_PAGE.PADDING_STYLE]) {
      if (style[CONFIG_PAGE.PADDING_STYLE][CONFIG_PAGE.PADDING_TOP]) {
        element.style.paddingTop = style[CONFIG_PAGE.PADDING_STYLE][CONFIG_PAGE.PADDING_TOP] + "px";
      }
      if (style[CONFIG_PAGE.PADDING_STYLE][CONFIG_PAGE.PADDING_BOTTOM]) {
        element.style.paddingBottom = style[CONFIG_PAGE.PADDING_STYLE][CONFIG_PAGE.PADDING_BOTTOM] + "px";
      }
    }
    // Применение цветов
    if (style[CONFIG_PAGE.COLOR_STYLE]) {
      if (style[CONFIG_PAGE.COLOR_STYLE][CONFIG_PAGE.COLOR_BG]) {
        element.style.backgroundColor = style[CONFIG_PAGE.COLOR_STYLE][CONFIG_PAGE.COLOR_BG];
      }
      if (style[CONFIG_PAGE.COLOR_STYLE][CONFIG_PAGE.COLOR_TEXT]) {
        element.style.color = style[CONFIG_PAGE.COLOR_STYLE][CONFIG_PAGE.COLOR_TEXT];
      }
    }
    // Применение внешних отступов
    if (style[CONFIG_PAGE.MARGIN_STYLE]) {
        let marginStyle = style[CONFIG_PAGE.MARGIN_STYLE];
        if(marginStyle[CONFIG_PAGE.MARGIN_TOP]) {
            element.style.marginTop = marginStyle[CONFIG_PAGE.MARGIN_TOP] + "px";
        }
        if(marginStyle[CONFIG_PAGE.MARGIN_BOTTOM]) {
            element.style.marginBottom = marginStyle[CONFIG_PAGE.MARGIN_BOTTOM] + "px";
        }
        if(marginStyle[CONFIG_PAGE.MARGIN_LEFT]) {
            element.style.marginLeft = marginStyle[CONFIG_PAGE.MARGIN_LEFT] + "px";
        }
        if(marginStyle[CONFIG_PAGE.MARGIN_RIGHT]) {
            element.style.marginRight = marginStyle[CONFIG_PAGE.MARGIN_RIGHT] + "px";
        }
    }
  }
}
// У конечного пункта могут быть варианты действий (переход на страницу или что-то другое)
// свойство "action": "redirect" - загрузка новой страницы, по имени конфигурации json, указанной в свойстве "link"
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
      // если есть свойство и  action равно redirect, то загружаем страницу по имени из свойства link
      //if(!item['action'] || item['action'] == 'redirect'){
      if(!item['action']||item['action']==''){
        a_element.onclick = () => {
          event.preventDefault();
          PageBuilder.loadPageConfig(item.link);
        };
      }
      
      if(item['action'] == 'redirect'){
        a_element.onclick = () => {
          event.preventDefault();
          if(item['action']['link']){
            let url = window.location.href;
            console.log(url)
            let searchParams = new URLSearchParams(url);
            let urlConfigName = searchParams.get("config");
            if(urlConfigName === null){
              searchParams.append("config",item['link'])
           //  window.open(url+''+ searchParams.toString(), '_blank').focus();
           //  PageBuilder.loadPageConfig(item.link);
           
            console.log(url+'?'+ encodeURIComponent(searchParams.toString()))
            //console.log(urlConfigName)
            } ;
          }
        } 
      }
//window.open(url, '_blank').focus();
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
                    case ButtonGroup.TYPE:
                        PageBuilder.create(this.buttonsBlock, item);
                        break; 
                    case CheckBoxGroup.TYPE:
                        PageBuilder.create(this.buttonsBlock, item);
                        break;         
                    case Header.TYPE:
                        PageBuilder.create(this.titleBlock, item);
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
        this.parentElement.insertAdjacentHTML("beforeend", `<button style="width: fit-content;" class="btn btn-outline-secondary btn-sm">${icon}${text}</button>`);
        let dom = this.parentElement.lastElementChild;
        BaseElement.applyCss(dom, this.config);
    }
}
PageBuilder.addComponent(Button.TYPE, Button);
class ButtonGroup extends BaseElement {
    static TYPE = 'button-group';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    create() {
        let content = "";
        for (let i = 0; i < this.config.items.length; i++){
            let icon = '';
            let text = '';
            if(this.config.items[i].icon)
                icon = `<i class="bi bi-${this.config.items[i].icon}${(this.config.items[i].text)?' me-2':''}"></i>`;
            if(this.config.items[i].text)
                text = this.config.items[i].text;
            content += `<button class="btn btn-outline-${this.config.items[i].class} btn-sm" type="button">${icon}${text}</button>`;
        } 
        let result = `<div class="input-group">${content}</div>`;
        this.parentElement.insertAdjacentHTML("beforeend", result);
        let dom = this.parentElement.lastElementChild;
        BaseElement.applyCss(dom, this.config);
    }
}
PageBuilder.addComponent(ButtonGroup.TYPE, ButtonGroup);
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
    BaseElement.applyCss(this.parentElement.lastElementChild, this.config);
    return block;
  }
}
PageBuilder.addComponent(RadioGroup.TYPE, RadioGroup);
class CheckBoxGroup extends BaseElement {
    static TYPE = 'checkbox';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    create() {
      this.parentElement.insertAdjacentHTML("beforeend", `<div class="form-group ${this.config.inline ? "flex" : ""}"></div>`);
      let block = this.parentElement.lastElementChild;          
      let content = "";
      for (let i = 0; i < this.config.items.length; i++) {
        let item = this.config.items[i];
        content += `<div class="form-check ${item.role ? "form-switch" : ""} ">
                          <input class="form-check-input" type='checkbox' role="${item.role}" value="${item.value}" id="${item.id}" ${item.status} ${item.checked ? "checked" : ""} >
                          <label class="form-check-label" for=${item.id}>
                            ${item.label}
                          </label>
                      </div>`;
      }
  
      block.insertAdjacentHTML("beforeend", content);
      BaseElement.applyCss(this.parentElement.lastElementChild, this.config);
      return block;
     }
}
PageBuilder.addComponent(CheckBoxGroup.TYPE, CheckBoxGroup);
class TableTabulator extends BaseElement {
    static TYPE = 'table-tabulator';
    static URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest"
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
    async create(){
      //--голый запрос для таблицы (без подставленных параметров) и сами параметры лежат в конфиге таблицы
      //--допустим,что есть и общие параметры, и личные для чего либо
      //--создаем 2 массива объектов параметров(PARAMS - общие, params - частные)
      //--предполагаемая структура параметра: 
      // param = {
      //   id: '', 
      //   type: 'date',
      //   name: '::pDate',
      //   value: '12/02/2024'
      // }

      var PARAMS = [];//задаем тоже где-то в общем конфиге
      if(this.config.query){
        let query = this.config.query;
        let allParams = [...this.config.params,...PARAMS];
        if(allParams.length)
          for(let i=0; i<allParams.length; i++){
            query = query.replace(allParams[i].name,allParams[i].value)
          }
        console.log('QUERY - ',query)
        console.log('PARAMS - ',allParams)
          var response = await fetch(`${TableTabulator.URL}/doquery`,{
            method: "POST",
            headers: { Accept:"text/plain","Content-Type": "text/plain" },
            body: query
          })
        let responseText = await response.text();
        let json = JSON.parse(responseText);
        this.config.tdata.data = json.resultset;
        console.log(this.config.tdata)
      }    
      //--должно прийти 
      // {
      //   message:'Успех',
      //   metadata: [],
      //   resultset: []
      // }
      
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
      
      if(!this.config["action"]){//пока непонятно везде будет или нет
        return
      }
      let action = this.config["action"];
      var table = Tabulator.findTable(`#${this.config["id"]}`)[0]
      for(let i=0; i<action.length; i++){
        switch(action[i].name){
          case "redirect":
            table.on(action[i].click, function(e, row){
              //e — объект события щелчка
              //row — компонент строки
              //например,берем значение из первого поля
              
              PageBuilder.loadPageConfig(row.getData()["1"],row.getData());
            });
            break
        }
      }
    }//end create
      
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
/*
 1. Создать класс который наследуется от класса BaseElement
 2. Создать статическое свойство компонента TYPE, которое соответствует типу(поле typr) компонента в конфигурации.
 3. Переопределить конструктор и передать в конструктор родительского класса параметры элемента.
 4. Переопределить метод создания компонента(create), в котором будет создан элемент и добавлен в родительский элемент.
*/

class SideBar {
    static TYPE = "sidebar";
    static openCount = 0;
    static _allSidebars = [];
    constructor (parentElement, config) {
        this.parentElement = parentElement;
        this.config = config;
        this.create();
    }

    create() {

          let content = `<div class="offcanvas offcanvas-${this.config.position}" tabindex="-1">
                            <button style="font-size: 0; z-index: 1060;" data-btn="btn-outline-${this.config.position}" class="btn btn-outline-${this.config.position} btn-sm" data-type="sidebar" type="button" aria-controls="${this.config.id}"></button>
                            <div class="offcanvas-body"></div>
                       </div>`;
          this.parentElement.insertAdjacentHTML("beforeend", content);
          //Проходим по дочерним элементам у sidebara
          var parentForChild;
          parentForChild = this.parentElement.lastElementChild.querySelector(".offcanvas-body");

          for(let i=0; i<this.config.items.length; i++){
                PageBuilder.create(parentForChild,this.config.items[i]);
          }

          let sidebarBS = new bootstrap.Offcanvas(this.parentElement.lastElementChild);
          sidebarBS._element.querySelector(`button[data-type="sidebar"]`).onclick = function () {
            sidebarBS.toggle();
          };
          SideBar._allSidebars.push(sidebarBS);
          sidebarBS._element.addEventListener("hidden.bs.offcanvas", (event) => {
            SideBar.openCount--;
          });
          sidebarBS._element.addEventListener("show.bs.offcanvas", (event) => {
            SideBar.openCount++;
          });
       
        function _initEvent(){
          window.addEventListener("click", (e) => {
            if(SideBar.openCount<2) return;
            if (!e.target.closest(".offcanvas") && !e.target.closest(`[data-type="sidebar"]`)) {
              SideBar._allSidebars.forEach((offcanvas) => {
                offcanvas.hide();
              });
            }
          });
        };
          _initEvent();

    }
}
PageBuilder.addComponent(SideBar.TYPE, SideBar);
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
        content += `<option value=${item.value} ${item.selected}>${item.name}</option>`;
      }
      this.parentElement.insertAdjacentHTML("beforeend",`<div class="input-group input-group-sm mb-3">
        <select class="form-select form-select-sm" aria-label=".form-select-sm" ${this.config.disabled}>${content}</select>` );
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
class InputField extends BaseElement {
    static TYPE = 'input';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    create() {
        this.parentElement.insertAdjacentHTML("beforeend", `<div class="input-group input-group-sm mb-3">
  <span class="input-group-text" id="${this.config.id}">${this.config.label}</span>
  <input type="${this.config.dataType}" class="form-control" aria-label="" aria-describedby="${this.config.id}" ${this.config.disabled} >
</div>`);
        let dom = this.parentElement.lastElementChild;
        BaseElement.applyCss(dom, this.config);
    }
}
PageBuilder.addComponent(InputField.TYPE, InputField);
class ItemsBlock extends BaseElement {
    static TYPE = 'block';
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    create() {
        this.parentElement.insertAdjacentHTML("beforeend", `<div class="itemsBlock d-flex flex-fill flex-${this.config.orientation}"></div>`);
        let dom = this.parentElement.lastElementChild;
        let items = this.config.items;
        for(let i=0; i<items.length; i++)
            PageBuilder.create(dom,items[i])
        BaseElement.applyCss(dom, this.config);
    }
}
PageBuilder.addComponent(ItemsBlock.TYPE, ItemsBlock);

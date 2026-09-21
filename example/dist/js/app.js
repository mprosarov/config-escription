//=========================================
//           pageBuilder.js
//=========================================
const PageBuilder = (function(){
  //   getParam(name) - который должен возвращать экземпляр компонента pageParam по переданному имени
  // getParamValue(name) - который должен возвращать занчение параметра, по имени параметра

  let URL = "";

  console.log("location.href: ", location.href)

  if (location.href.indexOf("file") >= 0) {
    URL = "http://localhost:3000/config";
  } else {
    URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest";
  }

  // Подписываемся на событие изменения истории(переход назад)
  window.addEventListener("popstate", (event) => {
    //console.log("popstate event:", event)
    //чистим историю
    clearState();
    // инициализируем зановo страницу
    initPage(); // глобальная функция для инициализации страницы( в templates.html)

  });
  let navbar = null;
  let domPage = null;
  //Коллекция компонентов
  let components = {};
  var pageParams = [];
  var DS = [];
  var createdComponents = [];
  
  function clearState(){
    DS = [];
    pageParams = [];
   // window.history.replaceState({}, null, 'url')

  }
  //ЭКШЕНЫ
  function performAnAction(name, obj, tableID) {
    //name - вид действия
    //id - идентификатор таблицы, если требуется для экшена
    //obj - объект действия
    console.warn(name);
    console.warn(obj);
    console.warn(tableID);
    switch (name) {
      case "redirect":
        break;
    }
  }
  //реагируем на изменение переключалок
  window.addEventListener("change", (e) => {
    //исключаем формы в модальном окне кнопок таблицы
    if (e.target.closest('form')) return;
    // Игнорируем изменения внутри форм (например, форма редактирования в модальном окне)
    updateParam(e.target, e.target.dataset["param"], e.target.getAttribute("type"));
  });

  //получаем датасорс
  function getDS(name) {
    let find = DS.find((ds) => ds.config.id === name);

    //console.log("ds sourse find: ", find);

    return find;
  }
  //Получаем объект параметра
  function getParam(name) {
    let find = pageParams.find((param) => param.getName() === name);

    //console.log("getParam find: ", find);

    if (!find) throw new Error("Параметр не удалось получить.Нет такого параметра");
    return find;
  }
  //Получаем значение параметра
  function getParamValue(name) {
    let find = pageParams.find((param) => param.getName() === name);

    //console.log("getParamValue find: ", find);

    if (!find) throw new Error("Значение не удалось получить.Нет такого параметра");
    return find.getValue();
  }
  //обновляем значения параметров при переключении чекбоксов и селектов
  function updateParam(el, name, type) {

    //console.log("el, name, type: ", el, name, type);
    //console.log(name, " ", type);

    var p = getParam(name);
    var value;
    switch (type) {
      case "checkbox":
        el.checked ? (value = 1) : (value = 0);
        break;
      case "select":
        value = el.value;
        break;
      case "date":
        value = el.value;
        break;
    }
    p.setParamValue(value);

    // Логируем изменение параметра
    ActionLogger.log('paramChange', 'Изменение параметра: ' + name + ' = ' + value, {
      name: name,
      value: value,
      type: type
    });
  }
  //Добавление компонента в общий список
  function addComponent(type, component) {

    //console.log('addComponent params: ', type, component)

    if (components[type]) {
      throw new Error(`Компонент с таким типом уже существует. type=${type}`);
    }
    components[type] = component;
  }
  function loadWithParams(configName, params) {

    //console.log("loadWithParams params: ", configName, params)

    // получаем все текущие GET параметры страницы
    let getParams = new URLSearchParams();

    //console.log("new URLSearchParams: ", getParams);

    // добавляем имя конфигурации в GEt параметры, чтобы при перезагрузке страницы(F5) - загрузилась нужная конфигурация
    getParams.set("config", configName);
    // добавляем переданные параметры в GEt параметры
    params.forEach((param) => {
      getParams.set(param.name, param.value);
    });
    // Меняем текущий адрес страницы
    window.history.pushState({}, configName, `?${getParams.toString()}`);
    loadPageConfig(configName);
  }
  // Загрузить json конфигурацию страницы с сервера по имени файла
  async function loadPageConfig(configName, params = []) {

    //console.log("configName loadPageConfig: ", configName);
    //console.log("params loadPageConfig: ", params);

    // очищаем страницу, чтобы построить новую по загруженной конфигурации
    clear();
    // лоадер
    document.body.insertAdjacentHTML(
      "beforeend",
      `<section class="loader-container">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
      </section>`
    );
    let loader = document.body.querySelector(".loader-container");
    try {
      console.log("${URL}?name=${configName}: ", `${URL}?name=${configName}`)
      let response = await fetch(`${URL}?name=${configName}`);
      let config = await response.json();
      console.log('-------> fetch config: ', config);
      //   let response = await fetch(`${URL}/getinterfaceconfig?scode=${configName}`);
      //   let result = await response.json();
      //   let config = result.result;

      // если файл не найден или произошла ошибка, то выводим сообщение об ошибке и завершаем работу
      if (response.status !== 200) {
        throw new Error(`Ошибка при загрузке файла: ${configName}. ${config.error}`);
      }
      // создаем страницу по загруженной конфигурации
      createdComponents = []
      createPage(config);
      // удаляем лоадер
      loader.remove();
    } catch (error) {
      //console.log('catch: ', error)
      loader.innerHTML = `<div class="loader-error">${error.message}</div>`;
      createdComponents = [];

      // Логируем ошибку загрузки конфигурации
      ActionLogger.log('error', 'Ошибка загрузки конфигурации: ' + configName, {
        configName: configName,
        errorMessage: error.message
      });
    }
  }
  function create(parentElement, config) {
    //console.log("parentElement create: ", parentElement);
    //console.log("config create: ", config);

    if (!components[config.type]) {
      throw new Error(`Компонента с таким типом не существует. type=${config.type}`);
    }
    return new components[config.type](parentElement, config);
  }
  // Создаем навигационную панель
  function createMainNavBar(config) {
    navbar = new NavBar(document.body, config);
  }
  // создать страницу по конфигурации
  function createPage(config) {
    
    //console.log("createPage config", config);

    if (config["pageParams"]) {
      config.pageParams.forEach((item) => {
        var param = new PageParam(`null`, item);
        console.log("-----> param createPage: ", param);

        pageParams.push(param);
      });

      //console.log("createPage pageParams: ", pageParams);

      //  console.log(pageParams)
    }
    if (config["dataSources"]) {
      config["dataSources"].forEach((item) => {
        var datasourse = PageBuilder.create(null, item);
        DS.push(datasourse);
      });
      //console.log("DS:", DS);
    }
    if (config["navbar"]) PageBuilder.createMainNavBar(config.navbar);
    document.body.insertAdjacentHTML("beforeend", '<div class="app-page"></div>');
    domPage = document.body.lastElementChild;
    if (config["page"]) {
      config.page.forEach((item) => {
        //PageBuilder.create(domPage, item);
        createdComponents.push(PageBuilder.create(domPage, item))

      });
    }
    if (config["sidebars"]) {
      config["sidebars"].forEach((item) => {
        PageBuilder.create(document.body, item);
      });
    }
    if (config["modals"]) {
      //console.log("!!!if modal config: ", config["modal"])

      config["modals"].forEach((item) => {
        PageBuilder.create(document.body, item);
      });
    }
    // Все компоненты отрисованы, выполняем запросы данных
    DS.forEach((item) => {
      item.execute();
    });

  }
  //Очистить страницу
  function clear() {
    // проходим по всем элементам на странице и удаляем их
    let nodes = [...document.body.children].filter((node) => node.nodeName !== "SCRIPT");
    nodes.forEach((node) => node.parentElement.removeChild(node));
  }
  return {
    addComponent,
    updateParam,
    performAnAction,
    getDS,
    getParam,
    getParamValue,
    create,
    createPage,
    createMainNavBar,
    loadPageConfig,
    loadWithParams,
    clearState
  };
})();
console.log("PAGEBUILDER RETURN: ", PageBuilder)
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
    //console.log("BaseElement element:", element)
    //console.log("BaseElement config:", config)

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

  actionRedirect(configAction, paramsObjArr = []){
    let resultParams = [];

    //console.log("Action Redirect in base Element: ")
    //console.log("paramsObjArr: ", paramsObjArr);
    //console.log("configAction: ", configAction);

    // Собираем "глобальные параметры" страницы, если они есть
    if (paramsObjArr.params?.pageParams) {
      for (let i = 0; i < paramsObjArr.params.pageParams.length; i++) {
        let param = paramsObjArr.params.pageParams[i];
        resultParams.push({
          name: param.pName,
          value: PageBuilder.getParamValue(param.pName),
        });
      }
    };
    //console.log("resultParams after if: ", resultParams)

    resultParams = resultParams.concat(paramsObjArr);

    //console.log("resultParams after concat: ", resultParams)

    if(configAction.config) this._redirectConfig(configAction, resultParams);
    else if(configAction.url) this._redirectToURL(configAction, resultParams);
    else{
      throw new Error("Не корректная конфигурация.Неизвестный тип redirect", configAction);
    }
  }

  _redirectConfig(configAction, resultParams = []) {
    // Загружаем конфигурацию на той же странице
    if (!configAction["newtab"]) {
      PageBuilder.loadWithParams(configAction.config, resultParams);
      return;
    }

    // Загружаем конфигурацию в новой вкладке
    let redirectUrl = new window.URL(window.location.href);
    let searchParams = new URLSearchParams(redirectUrl.search);
    searchParams.set("config", configAction.config);

    resultParams.forEach((p)=>searchParams.set(p.name, p.value));

    redirectUrl.search = searchParams.toString();
    window.open(redirectUrl, "_blank").focus();
  }
  _redirectToURL(configAction, resultParams = []) {
    //TODO: Реализовать редирект по url
    console.log('ПЕРЕАДРЕСАЦИЯ ПО УРЛ', configAction.url);
  }
}
// У конечного пункта могут быть варианты действий (переход на страницу или что-то другое)
// свойство "action": "redirect" - загрузка новой страницы, по имени конфигурации json, указанной в свойстве "config"
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
    parentEl.insertAdjacentHTML("beforeend", `<li class="nav-item"><a class="nav-link" href="${item.config}">${item.title}</a></li>`);
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
        <a class="dropdown-item" href="${item["config"] || "#"}">${item.title}</a>
      </li>`
    );
    const li_element = parentEl.lastElementChild;
    const a_element = li_element.lastElementChild;
    // Если нет подменю - возвращаем элемент
    if (!item.submenu || item.submenu.length == 0){
      //TODO: проверять какое действие нужно делать если нет подменю
      // если есть свойство и  action равно redirect, то загружаем страницу по имени из свойства config
      if(!item['action']||item['action']==''){
        a_element.onclick = () => {
          event.preventDefault();
          PageBuilder.loadPageConfig(item.config);
        };
      }
      
      if(item['action'] == 'redirect'){
        a_element.onclick = () => {
          event.preventDefault();
          if (item["url"]) {
            window.open(item["url"], "_blank").focus();
          } else if (item["url"] == "" && !item['config']) {
            throw new Error(`не указан ни один параметр для перехода (url,config)`);
          }
          if (!item["newtab"]) PageBuilder.loadPageConfig(item.config);
          else {
              let redirectUrl = new URL(window.location.href);
              let searchParams = new URLSearchParams(redirectUrl.search);
              searchParams.set("config", item["config"]);
              redirectUrl.search = searchParams.toString();
              window.open(redirectUrl, "_blank").focus();
          } 
        } 
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
        
        console.log("parent Element NavBar: ", parentElement);
        console.log("config NavBar: ", config);

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
                    case DateRange.TYPE:
                        PageBuilder.create(this.buttonsBlock, item);
                        break;
                    case Select.TYPE:
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
        this.parentElement.insertAdjacentHTML("beforeend", `<button style="width: fit-content;" class="btn btn-outline-secondary btn-sm" ${this.config.status}>${icon}${text}</button>`);
        let dom = this.parentElement.lastElementChild;
        BaseElement.applyCss(dom, this.config);

        // Сохраняем ссылку на DOM элемент
        this.buttonElement = dom;

        console.log("Button config: ", this.config)

        // Если есть actions, создаем BaseAction для кнопки (так же как в TableTabulator)
        if (this.config.actions) {
            console.log("Button has actions, creating via ActionRegistry:", this.config.actions);
            
            // Создаем экшены через ActionRegistry (аналогично TableTabulator)
            ActionRegistry.createFromConfig(this.parentElement, this.config.actions, this.buttonElement);
        }
    }
}
PageBuilder.addComponent(Button.TYPE, Button);
class ButtonGroup extends BaseElement {
  static TYPE = "button-group";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  /**
   * TODO: дописать проверку на id с добавлением дефолтного значения
   */
  create() {
    
    let content = "";
    let result = "";
    const groupId = this.config.id || `btngroup_${Date.now()}`;

    console.log("ButtonGroup config: ", this.config);
    console.log("ButtonGroup parentElement", this.parentElement);

    for (let i = 0; i < this.config.elements.length; i++) {
      let icon = "";
      let text = "";
      if (this.config.elements[i].icon)
        icon = `<i class="bi bi-${this.config.elements[i].icon}${
          this.config.elements[i].text ? " me-2" : ""
        }"></i>`;
      if (this.config.elements[i].text) text = this.config.elements[i].text;
      content += `<button class="btn btn-outline-${this.config.elements[i].class} btn-sm" type="button" id="${this.config.elements[i].id}" ${this.config.elements[i].status}>${icon}${text}</button>`;
    }

    //Костыль для кнопок у таблицы
    console.log("isTable-menu: ", this.config["table-menu"]);
    if (this.config["table-menu"])
      result = `<div class="input-group-table">${content}</div>`;
    else 
      result = `<div class="input-group" >${content}</div>`;
    console.log("After result", result)

    //result = `<div class="input-group">${content}</div>`;
    this.parentElement.insertAdjacentHTML("beforeend", result);
    let dom = this.parentElement.lastElementChild;
    BaseElement.applyCss(dom, this.config);

    //после создания DOM, добавляем actions для каждой кнопки
    for (let i = 0; i < this.config.elements.length; i++) {
        const elementConfig = this.config.elements[i];
        const buttonId = elementConfig.id || `${groupId}_btn${i}`;
        const buttonElement = document.getElementById(buttonId);

        if (buttonElement && elementConfig.actions) {
          console.log("Creating BaseAction for button:", buttonId, elementConfig.actions);
          
          // Создаем BaseAction для кнопки 
          ActionRegistry.createFromConfig(this.parentElement, elementConfig.actions, buttonElement);
        }
      }
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
    this.parentElement.insertAdjacentHTML(
      "beforeend",
      '<div class="form-group"></div>'
    );
    let block = this.parentElement.lastElementChild;
    let content = "";
    for (let i = 0; i < this.config.elements.length; i++) {
      let item = this.config.elements[i];
      content += `<div class="form-check ${
        this.config.inline ? "form-check-inline" : ""
      }">
                        <input class="form-check-input" type='radio' name="${
                          this.config.name
                        }" value="" id="${item.id}" ${item.status} ${
        item.checked ? "checked" : ""
      } >
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
  static TYPE = "checkbox";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  //TODO: не работает статус, доработать
  create() {
    this.parentElement.insertAdjacentHTML(
      "beforeend",
      `<div class="form-group ${this.config.inline ? "flex" : ""}"></div>`
    );
    let block = this.parentElement.lastElementChild;
    let content = "";

    for (let i = 0; i < this.config.elements.length; i++) {
      let item = this.config.elements[i];
      content += `<div class="form-check ${item.role ? "form-switch" : ""} ">
                          <input class="form-check-input"  role="${
                            item.role ? "form-switch" : ""
                          }" data-param='${
        item.paramName
      }' type='checkbox' value="${item.checked ? "1" : "0"}" id="${item.id}" ${
        item.status
      } ${item.checked ? "checked" : ""}>
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
    static PARAMS = [];//задаем тоже где-то в общем конфиге
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }

    recursiveSearchColumns(data, target) {
      
      let values = {
        headerHozAlign: "center",
        hozAlign: "center",
        headerWordWrap: true,
        //headerVerticalAlign: "middle",
      };

      if (!data[target] || data[target].length < 1) return;
      for (let i = 0; i < data[target].length; i++) {
        let child = data[target][i];
        child = Object.assign(child, values);
        this.recursiveSearchColumns(child, target);
      }
    }

    /**
     * Рекурсивно применяет titleFormatter к листовым колонкам для отображения нумерации.
     * Нумерация располагается в нижней части каждой листовой колонки.
     * Позиционирование выполняется через CSS.
     *
     * ВАЖНО: Этот метод НЕ изменяет DOM после построения таблицы.
     * Вся работа делается через titleFormatter, который Tabulator вызывает
     * при рендеринге заголовка. Это исключает конфликты с fitColumns.
     *
     * @param {Array} columns - массив колонок для обработки
     * @param {Object} indexCols - объект с номерами строк {field: number}
     */
    applyNumberingTitleFormatter(columns, indexCols) {
      if (!columns || columns.length === 0) return;

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];

        if (col.columns && col.columns.length > 0) {
          // Родительская колонка - рекурсивно обрабатываем дочерние
          this.applyNumberingTitleFormatter(col.columns, indexCols);
        } else if (col.field) {
          // Листовая колонка - добавляем titleFormatter
          const field = col.field;
          const numbering = (indexCols && indexCols[field] !== undefined) ? String(indexCols[field]) : '';

          // Добавляем CSS-класс для листовых колонок с нумерацией
          const leafClass = 'tabulator-col-leaf';
          if (!col.cssClass) {
            col.cssClass = leafClass;
          } else if (col.cssClass.indexOf(leafClass) === -1) {
            col.cssClass = col.cssClass.trim() + ' ' + leafClass;
          }

          col.titleFormatter = function(cell, formatterParams, onRendered) {
            // Создаём контейнер для заголовка и нумерации
            const container = document.createElement('div');
            container.className = 'tabulator-col-numbering-wrap';

            // Текст заголовка
            const titleSpan = document.createElement('span');
            titleSpan.className = 'tabulator-col-title-text';
            const title = cell.getColumn().getDefinition().title || '';
            titleSpan.textContent = title;

            // Нумерация в нижней части
            const numberSpan = document.createElement('span');
            numberSpan.className = 'tabulator-col-numbering';
            numberSpan.textContent = numbering;

            container.appendChild(titleSpan);
            container.appendChild(numberSpan);

            return container;
          };
        }
      }
    }

    // ========================================================================
    // ПРЕДЫДУЩЕЕ РЕШЕНИЕ (equalizeNestedLeafColumnHeights) — сохранено для
    // возможности отката. Использовало JS для принудительного выравнивания
    // высоты вложенных листовых колонок через установку inline minHeight.
    // Проблема: вызывало reflow DOM, который триггерил пересчёт Tabulator
    // (fitColumns), сбрасывающий пользовательские изменения ширины колонок.
    // ========================================================================
    //
    // equalizeNestedLeafColumnHeights() {
    //   if (!this.tableObj) return;
    //
    //   const tableElement = this.tableObj.element;
    //   if (!tableElement) return;
    //
    //   const headerElement = tableElement.querySelector('.tabulator-header');
    //   if (!headerElement) return;
    //
    //   // Сбрасываем minHeight ТОЛЬКО у тех элементов, которым мы его устанавливали
    //   const equalized = headerElement.querySelectorAll('[data-equalized]');
    //   equalized.forEach(el => {
    //     el.style.minHeight = '';
    //     el.removeAttribute('data-equalized');
    //   });
    //
    //   // Выбираем ТОЛЬКО вложенные листовые колонки (внутри .tabulator-col-group-cols)
    //   const nestedLeafCols = headerElement.querySelectorAll('.tabulator-col-group-cols .tabulator-col.tabulator-col-leaf');
    //   if (nestedLeafCols.length === 0) return;
    //
    //   // Группируем по непосредственному родительскому .tabulator-col-group-cols
    //   const groups = new Map();
    //   nestedLeafCols.forEach(col => {
    //     let container = col.parentElement;
    //     while (container && container !== headerElement) {
    //       if (container.classList.contains('tabulator-col-group-cols')) break;
    //       container = container.parentElement;
    //     }
    //     if (!container) return;
    //     if (!groups.has(container)) groups.set(container, []);
    //     groups.get(container).push(col);
    //   });
    //
    //   // Для каждой группы выравниваем высоту
    //   groups.forEach((cols) => {
    //     let maxHeight = 0;
    //     cols.forEach(col => {
    //       const h = col.offsetHeight;
    //       if (h > maxHeight) maxHeight = h;
    //     });
    //     if (maxHeight === 0) return;
    //
    //     cols.forEach(col => {
    //       col.style.minHeight = maxHeight + 'px';
    //       col.style.boxSizing = 'border-box';
    //       col.setAttribute('data-equalized', 'true');
    //     });
    //
    //     // Корректируем родительские group-колонки
    //     cols.forEach(col => {
    //       let parent = col.parentElement;
    //       while (parent && parent !== headerElement) {
    //         if (parent.classList.contains('tabulator-col-group-cols')) {
    //           const cur = parseInt(parent.style.minHeight) || 0;
    //           if (cur < maxHeight) {
    //             parent.style.minHeight = maxHeight + 'px';
    //             parent.setAttribute('data-equalized', 'true');
    //           }
    //           const pCol = parent.parentElement;
    //           if (pCol && pCol.classList.contains('tabulator-col')) {
    //             const curP = parseInt(pCol.style.minHeight) || 0;
    //             if (curP < maxHeight) {
    //               pCol.style.minHeight = maxHeight + 'px';
    //               pCol.setAttribute('data-equalized', 'true');
    //             }
    //           }
    //         }
    //         parent = parent.parentElement;
    //       }
    //     });
    //   });
    // }

    create(){
      
      const ds = PageBuilder.getDS(this.config.datasourse);
      const config = this.config;
      const parentElement = this.parentElement;
      //let isEdit = config.actions?.items.some(item => item.action == 'tabulatorEditAction') ?? false;

      ds.addSubscribe(this)
      this.config["tdata"].data = [];

      // Определяем, есть ли toolbar
      const hasToolbar = config.toolbar && config.toolbar.items && config.toolbar.items.length > 0;
      const toolbarHtml = hasToolbar
        ? `<div class="table-tabulator-toolbar" id="toolbar-${config.id}"></div>`
        : '';

      // Новая структура: wrapper > container > content + toolbar
      let contentTable = `<div class="table-tabulator-wrapper">
        ${config.name ? `<h6>${config.name}</h6>` : ''}
        <div class="table-tabulator-container">
          <div class="table-tabulator-content">
            <div id="${config.id}"></div>
          </div>
          ${toolbarHtml}
        </div>
      </div>`;
      this.parentElement.insertAdjacentHTML("beforeend", contentTable);
      
      // Применяем titleFormatter к листовым колонкам для отображения нумерации
      if (this.config["tdata"].columns) {
        this.applyNumberingTitleFormatter(this.config["tdata"].columns, this.config.indexCols || {});
      }
      
      this.recursiveSearchColumns(this.config["tdata"], "columns");
      
      // Устанавливаем headerHeight: false для автоматического расчета высоты заголовков
      if (!this.config["tdata"].hasOwnProperty("headerHeight")) {
        this.config["tdata"].headerHeight = false;
      }
      
      this.tableObj = new Tabulator(`#${this.config["id"]}`, this.config["tdata"]);

      var table = Tabulator.findTable(`#${this.config["id"]}`)[0];

      const self = this;
      this.tableObj.on("tableBuilt", () => {
        // НОВОЕ РЕШЕНИЕ: применяем CSS-выравнивание высоты через flexbox.
        // Вызывается ОДИН раз при инициализации, не триггерит reflow.
        self._applyHeaderFlexAlignment();
        
        // СТАРОЕ РЕШЕНИЕ (закомментировано) — вызывало equalizeNestedLeafColumnHeights
        // после построения таблицы, что могло конфликтовать с fitColumns.
        // requestAnimationFrame(() => {
        //   console.log(">>>> equalize nested leaf column heights after tableBuilt");
        //   self.equalizeNestedLeafColumnHeights();
        // });
        
        if (config.actions) ActionRegistry.createFromConfig(parentElement, config.actions, table);

        // Создаём toolbar после построения таблицы
        if (hasToolbar) self.createToolbar();
      })

      // ВАЖНО: Не подписываемся на columnResized!
      // Любое изменение DOM после ресайза колонки вызывает reflow,
      // который триггерит внутренний пересчёт Tabulator (fitColumns),
      // сбрасывающий пользовательские изменения ширины.
      //
      // СТАРОЕ РЕШЕНИЕ (закомментировано) — подписывалось на columnResized
      // и вызывало equalizeNestedLeafColumnHeights, что ломало ресайз.
      // this.tableObj.on("columnResized", (column) => {
      //   console.log("Ширина изменена, колонка:", column ? column.getField() : 'unknown');
      //   requestAnimationFrame(() => {
      //     self.equalizeNestedLeafColumnHeights();
      //   });
      // });
      //
      // Также закомментирован ResizeObserver — он тоже вызывал лишние reflow.
      // const tableContainer = document.getElementById(this.config.id);
      // if (tableContainer) {
      //   this._resizeObserver = new ResizeObserver(() => {
      //     requestAnimationFrame(() => {
      //       self.equalizeNestedLeafColumnHeights();
      //     });
      //   });
      //   this._resizeObserver.observe(tableContainer);
      // }
    } //end create

    /**
     * НОВОЕ РЕШЕНИЕ: Применяет CSS-выравнивание высоты для вложенных
     * листовых колонок через flexbox. Вызывается ОДИН раз после tableBuilt.
     *
     * В отличие от equalizeNestedLeafColumnHeights, этот метод не устанавливает
     * inline-стили minHeight/height, а добавляет CSS-класс, который через
     * flexbox выравнивает высоту колонок внутри одной группы.
     *
     * Это гарантирует, что Tabulator сохраняет полный контроль над макетом,
     * и пользовательские изменения ширины колонок не сбрасываются.
     */
    _applyHeaderFlexAlignment() {
      if (!this.tableObj) return;

      const tableElement = this.tableObj.element;
      if (!tableElement) return;

      const headerElement = tableElement.querySelector('.tabulator-header');
      if (!headerElement) return;

      // Добавляем CSS-класс на таблицу для активации flex-выравнивания
      tableElement.classList.add('tabulator-header-flex-equalized');

      // Для group-контейнеров внутри заголовка добавляем класс,
      // который через CSS flex выравнивает высоту дочерних колонок
      const groupCols = headerElement.querySelectorAll('.tabulator-col-group-cols');
      groupCols.forEach(el => {
        el.classList.add('tabulator-group-cols-flex');
      });
    }

    /**
     * Создаёт вертикальную панель кнопок (toolbar) справа от таблицы.
     * Каждая кнопка создаётся на основе конфига из this.config.toolbar.items.
     * Если у кнопки есть секция actions, для неё создаётся BaseAction.
     */
    createToolbar() {
      const toolbarConfig = this.config.toolbar;
      if (!toolbarConfig || !toolbarConfig.items || toolbarConfig.items.length === 0) return;

      const toolbarId = `toolbar-${this.config.id}`;
      const toolbar = document.getElementById(toolbarId);
      if (!toolbar) return;

      const self = this;

      for (let i = 0; i < toolbarConfig.items.length; i++) {
        const btnConfig = toolbarConfig.items[i];

        // Иконка (Bootstrap Icons)
        let iconHtml = '';
        if (btnConfig.icon) {
          iconHtml = `<i class="bi bi-${btnConfig.icon} toolbar-btn-icon"></i>`;
        }

        // Текст кнопки
        let textHtml = '';
        if (btnConfig.text) {
          textHtml = `<span class="toolbar-btn-text">${btnConfig.text}</span>`;
        }

        // Атрибут disabled, если указан статус
        const disabledAttr = (btnConfig.status === 'disabled') ? 'disabled' : '';

        // Создаём DOM кнопки
        const btnHtml = `<button class="toolbar-btn" ${disabledAttr}>${iconHtml}${textHtml}</button>`;
        toolbar.insertAdjacentHTML('beforeend', btnHtml);
        const btnElement = toolbar.lastElementChild;

        // Если у кнопки есть actions в формате BaseAction, создаём BaseAction
        if (btnConfig.actions && btnConfig.actions.items && btnConfig.actions.items.length > 0) {
          ActionRegistry.createFromConfig(toolbar, btnConfig.actions, btnElement);
        }
      }
    }

    updatedDS(data) {
      console.log('TABLETABULATOR data', data);
      console.log('TABLETABULATOR this.config', this.config);
      console.log('TABLETABULATOR this.config.indexCols', this.config.indexCols);
      console.log('TABLETABULATOR data.resultset', data.resultset);

      console.log("tabulator this tableobj: ", this.tableObj);
      const self = this;
      if (!this.tableObj.initialized){
        this.tableObj.on("tableBuilt", function () {
          this.setData(data.resultset);

          console.log("UpdatedDS MetaData: ", this.metadata);
          this.metadata = data.metadata;

          // НОВОЕ РЕШЕНИЕ: после загрузки данных применяем flex-выравнивание (один раз)
          self._applyHeaderFlexAlignment();

          // СТАРОЕ РЕШЕНИЕ (закомментировано):
          // requestAnimationFrame(() => {
          //   console.log(">>>>> equalize nested leaf column heights after data load");
          //   self.equalizeNestedLeafColumnHeights();
          // });

          this.off("tableBuilt");
        });
        return;
      }
      this.tableObj.setData(data.resultset);
      
      // НОВОЕ РЕШЕНИЕ: после обновления данных flex-выравнивание уже активно
      // через CSS-класс, поэтому дополнительных действий не требуется.
      //
      // СТАРОЕ РЕШЕНИЕ (закомментировано):
      // requestAnimationFrame(() => {
      //   console.log(">>>>> equalize nested leaf column heights after setData");
      //   if (self.tableObj) {
      //     self.equalizeNestedLeafColumnHeights();
      //   }
      // });
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

        console.log("Tabs config: ", this.config);
        console.log("Tabs parentElement: ", this.parentElement);

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

        // Решение визуальной проблемы отрисовки таблицы без размеров при переключении вкладок
        // Обрабатываем событие показа вкладки Bootstrap
        tabBox.addEventListener('shown.bs.tab', (event) => {
            const targetId = event.target.getAttribute('data-bs-target');
            const targetPane = document.querySelector(targetId);
            if (!targetPane) return;

            // Находим все Tabulator внутри показанной панели и перерисовываем их
            const tabulatorElements = targetPane.querySelectorAll('[tabulator-layout]');
            tabulatorElements.forEach((el) => {
                const tables = Tabulator.findTable(`#${el.id}`);
                if (tables && tables.length > 0) {
                    tables[0].redraw(true);
                }
            });
        });
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
  static TYPE = "select";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  create() {
    let content = "";
    for (let i = 0; i < this.config.options.length; i++) {
      let item = this.config.options[i];
      content += `<option value=${item.value} ${
        item.selected ? "selected" : ""
      }>${item.name}</option>`;
    }
    this.parentElement.insertAdjacentHTML(
      "beforeend",
      `<div class="input-group input-group-sm">
        <select type="${this.config.type}" data-param="${
        this.config.paramName
      }"  class="form-select form-select-sm" aria-label=".form-select-sm" ${
        this.config.status ? this.config.status : "unabled"
      }>${content}</select>`
    );
    let position = "";
    if (this.config.labelPosition == "left") position = "afterbegin";
    else position = "beforeend";
    let dom = this.parentElement.lastElementChild;
    dom.insertAdjacentHTML(
      position,
      `<label class="input-group-text">
        ${this.config.label}
        </label></div>`
    );
    BaseElement.applyCss(dom, this.config);
  }
}
PageBuilder.addComponent(Select.TYPE, Select);
class InputField extends BaseElement {
  static TYPE = "input";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  create() {
    this.parentElement.insertAdjacentHTML(
      "beforeend",
      `<div class="input-group input-group-sm mb-3">
          ${this.config.label ? `<span class="input-group-text" id="${this.config.id}">${this.config.label}</span> ` : "" }
          <input type="${this.config.dataType}" class="form-control" aria-label="" aria-describedby="${this.config.id}" ${this.config.status ? this.config.status : "unabled"} >
      </div>`
    );
    let dom = this.parentElement.lastElementChild;
    BaseElement.applyCss(dom, this.config);
  }
}
PageBuilder.addComponent(InputField.TYPE, InputField);
class ItemsBlock extends BaseElement {
  static TYPE = "block";
  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }
  create() {
    this.parentElement.insertAdjacentHTML(
      "beforeend",
      `<div class="itemsBlock  flex-fill flex-${this.config.orientation}"></div>`
      //`<div class="itemsBlock  flex-${this.config.orientation}"></div>`
    );
    let dom = this.parentElement.lastElementChild;
    let items = this.config.items;
    for (let i = 0; i < items.length; i++) PageBuilder.create(dom, items[i]);
    BaseElement.applyCss(dom, this.config);
  }
}
PageBuilder.addComponent(ItemsBlock.TYPE, ItemsBlock);
class DataSources {
  static TYPE = "dataSource";
  params = [];
  subscribes = [];
  constructor(parentElement, config) {
    this.parentElement = parentElement;
    this.config = config;
    this.create();
  }
  create() {
    let matches = this.config.query.match(/\{.+?\}/g);
    let arrQueryParams = [];
    if (matches) {
      arrQueryParams = Array.from(
        new Set(
          matches.map(function (x) {
            return x.slice(1, -1);
          })
        )
      );
    }

    console.log("datasources set to array: ", arrQueryParams);

    for (let i = 0; i < arrQueryParams.length; i++) {
      let objParam = {
        param: arrQueryParams[i],
        value: "",
      };

      this.params.push( );
      // Подписываемся на изменение параметра
      var p = PageBuilder.getParam(objParam.param); // находим объект пареметра
      if (!p) console.error("Нет параметра");
      p.addSubscribe(this);
    }
  }
  paramChanged(name, value) {
    this.execute();
  }
  fetchQuery(query) {
  //  console.log("fetchFIC", query);
    let test = {
      "metadata": [
          {"colname": "idconfig","coltype": "string","colindex": 0},
          {"colname": "2","coltype": "date","colindex": 1},
          {"colname": "3","coltype": "date","colindex": 2},
          {"colname": "4","coltype": "date","colindex": 3},
          {"colname": "5","coltype": "date","colindex": 4},
          {"colname": "6","coltype": "string","colindex": 5},
          {"colname": "7","coltype": "numeric","colindex": 6},
          {"colname": "8","coltype": "date","colindex": 7},
          {"colname": "9","coltype": "date","colindex": 8},
          {"colname": "10","coltype": "date","colindex": 9},
      ],
      "resultset": []
    };
    for (let i = 0; i < 20; i++) {
      test.resultset.push({
        idconfig: i%3==0?"calculation":i%2==0?"oef":"check_list",
        2: Date.now(),
        3: Date.now(),
        4: Date.now(),
        5: Date.now(),
        6: `Сейчас: ${Date.now()}`,
        7: 4 * i,
        8: Date.now(),
        9: Date.now(),
        10: Date.now(),
      });
    }

  //------------------------------------------
    // let URL = "";
    // if (location.href.indexOf("file") >= 0) {
    //   URL = "http://localhost:3000/config";
    // } else {
    //   URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest";
    // }
    // var resp = fetch(`${URL}/doquery`,{
    //     method: "POST",
    //     headers: { Accept:"text/plain","Content-Type": "text/plain" },
    //     body: query
    //   })
    // let respText = resp.text();
    // let json = JSON.parse(respText);
    // return json.resultset;
  //---------------------------------------------  
    return test;
  }

  execute() {

    console.log('Execute log this.params: ', this.params);

    for (let i = 0; i < this.params.length; i++) {
      this.params[i]["value"] = PageBuilder.getParamValue(this.params[i]["param"]);
    }
    let query = this.config.query;
    for (let i = 0; i < this.params.length; i++) {
      query = query.replaceAll(`{${this.params[i].param}}`, this.params[i].value);
    }
    // Отслыем запрос на сервер и оповещаем подписчиков
    let result = this.fetchQuery(query); // TODO: запрос на сервер - заменить на fetch

    console.log("EXECUTE result: ", result);
    console.log("datasource subscribes:", this.subscribes);

    this.subscribes.forEach((item) => {
      item.updatedDS(result);
    });

    // Логируем загрузку данных
    var rowCount = result && result.resultset ? result.resultset.length : 0;
    ActionLogger.log('dataLoad', 'Загрузка данных: ' + (this.config.id || 'unknown') + ' (' + rowCount + ' строк)', {
      datasourceId: this.config.id || 'unknown',
      rowCount: rowCount,
      query: query
    });
  }
  addSubscribe(obj) {
    if (!this.subscribes.includes(obj)) {
      this.subscribes.push(obj);
    }
  }
}
PageBuilder.addComponent(DataSources.TYPE, DataSources);
class PageParam {
    static TYPE = "param";
    paramValue;
    subscribers = []
    constructor (parentElement, config) {
        this.config = config;
        this.create();
    }
    create() {
        //Инициализация
        let type = this.config.init.valueType;
        //raw - "сырое значение", параметр д.б проинициализирован значением из поля value
        if(type == 'raw'){
            this.paramValue = this.config.init.value;
            return
        }
        //get - параметр д.б проинициализирован значением GET-параметра, имя которого указано в поле value
        if(type == 'get'){
            let redirectUrlParams = new URL(window.location.href);
            let urlParams = new URLSearchParams(redirectUrlParams.search);
            urlParams.get(this.getName());
            return
        }
        //date - параметр д.б проинициализирован текущей датой, если поле value отсутствует.
        if(type == 'date'){
            if(this.config.init.value) this.paramValue = this.config.init.value;
            else this.paramValue = new Date().toLocaleDateString();
            return
        }

        // TODO: Добавить или проверить инициализацию параметра с valureType = "number" (см. доки);
        if(type == 'number'){
            if(this.config.init.value) this.paramValue = this.config.init.value;
            else this.paramValue = 0;
            return;
        }
        throw new Error(`Некорректное значение поля valueType в конфигурации параметра: "${this.config.name}"`);
    };
    //возвращает имя компонента(свойство name из конфигурации)
    getName(){
        return this.config.name;
    };
    //возвращает текущее значение параметра
    getValue(){
        return this.paramValue;
    };
    //добавляет переданный экземпляр объекта в массив "подписчиков" на изменение значения компонента
    addSubscribe(obj){
        this.subscribers.push(obj);
    };
    //записывает переданное значение в свойство paramValue и вызывает
    //у всех подписчиков событие обновления параметра.
    setParamValue(value){
        this.paramValue = value;
        console.log("PAGEPARAM setParamValue check");
        this.subscribers.forEach(item => item.paramChanged(this.config.name,this.paramValue))
    }
}
PageBuilder.addComponent(PageParam.TYPE, PageParam);
/**
 * baseAction.js
 *
 * BaseAction — базовый класс для всех экшенов.
 * Упрощён: только хранение parentElement, config, target.
 * Фабричная логика (switch) вынесена в ActionRegistry.
 * PageBuilder.addComponent сохранён для обратной совместимости.
 */
class BaseAction {
  static TYPE = "baseAction";

  constructor(parentElement, config, target) {
    this.parentElement = parentElement;
    this.config = config;
    this.target = target;
  }
}
PageBuilder.addComponent(BaseAction.TYPE, BaseAction);
/**
 * actionRegistry.js
 *
 * ActionRegistry — фабрика/реестр экшенов.
 * Заменяет switch-диспетчеризацию, которая была в BaseAction.create().
 *
 * Принцип работы:
 * - Каждый подкласс BaseAction регистрирует себя через ActionRegistry.register()
 * - Создание экземпляров — через ActionRegistry.create() или createFromConfig()
 * - Новый экшен = новый файл + регистрация, без изменения существующего кода
 */
class ActionRegistry {
  static #actions = new Map();

  /**
   * Регистрирует класс экшена по строковому типу.
   * @param {string} type — уникальный идентификатор (например, 'resetAction')
   * @param {typeof BaseAction} classRef — класс экшена
   */
  static register(type, classRef) {
    if (this.#actions.has(type)) {
      throw new Error(`ActionRegistry: тип "${type}" уже зарегистрирован`);
    }
    this.#actions.set(type, classRef);
  }

  /**
   * Создаёт экземпляр экшена по типу.
   * @param {string} type
   * @param {HTMLElement} parentElement
   * @param {Object} config
   * @param {*} target
   * @returns {BaseAction|null}
   */
  static create(type, parentElement, config, target) {
    const ActionClass = this.#actions.get(type);
    if (!ActionClass) {
      console.warn(`ActionRegistry: неизвестный тип экшена "${type}"`);
      return null;
    }
    return new ActionClass(parentElement, config, target);
  }

  /**
   * Создаёт экшены из конфига вида { items: [{ action: '...', ... }] }.
   * Используется в cTableTabulator для создания экшенов из конфига таблицы.
   *
   * @param {HTMLElement} parentElement
   * @param {Object} actionsConfig — { items: [...] }
   * @param {*} target
   * @returns {BaseAction[]}
   */
  static createFromConfig(parentElement, actionsConfig, target) {
    if (!actionsConfig || !actionsConfig.items || !Array.isArray(actionsConfig.items)) {
      return [];
    }

    return actionsConfig.items
      .map(item => this.create(item.action, parentElement, item, target))
      .filter(Boolean);
  }
}
/**
 * tableAction.js
 *
 * TableAction — промежуточный класс для экшенов, работающих с Tabulator.
 * Устраняет дублирование _resolveTable(), getLeafColumns(), _flattenColumns()
 * в EditAction, AddAction, DeleteAction, FilterAction.
 */
class TableAction extends BaseAction {
  /**
   * @param {HTMLElement} parentElement
   * @param {Object} config
   * @param {*} target — Tabulator или DOM-элемент (кнопка тулбара)
   */
  constructor(parentElement, config, target) {
    super(parentElement, config, target);
    this.table = this._resolveTable(target);
  }

  /**
   * Определяет Tabulator из target.
   * Если target — сам Tabulator (есть метод getSelectedData), возвращаем его.
   * Если target — DOM-кнопка из тулбара, ищем Tabulator через DOM.
   * @param {*} target
   * @returns {Object|null}
   */
  _resolveTable(target) {
    if (target && typeof target.getSelectedData === 'function') {
      return target;
    }

    if (target && typeof target.addEventListener === 'function') {
      const container = target.closest('.table-tabulator-container');
      if (container) {
        const tableDiv = container.querySelector('.table-tabulator-content > div[id]');
        if (tableDiv && tableDiv.id) {
          const tables = Tabulator.findTable('#' + tableDiv.id);
          if (tables && tables.length > 0) {
            return tables[0];
          }
        }
      }
    }

    console.warn(`${this.constructor.name}: не удалось найти Tabulator`);
    return null;
  }

  /**
   * Возвращает листовые колонки таблицы (рекурсивно).
   * @returns {Array}
   */
  getLeafColumns() {
    if (!this.table) return [];
    return this._flattenColumns(this.table.getColumnDefinitions());
  }

  /**
   * Рекурсивно "уплощает" вложенные колонки до листовых.
   * @param {Array} columns
   * @returns {Array}
   */
  _flattenColumns(columns) {
    let result = [];
    for (let col of columns) {
      if (col.columns) {
        result = result.concat(this._flattenColumns(col.columns));
      } else if (col.field) {
        result.push(col);
      }
    }
    return result;
  }
}
/**
 * modalHelper.js
 *
 * ModalHelper — утилита для поиска и управления модальными окнами.
 * Устраняет дублирование findModal() в EditAction, AddAction, FilterAction.
 *
 * Модальное окно ищется по классу .vnf-modal-overlay.
 * Если не найдено — возвращается null.
 */
const ModalHelper = {
  /**
   * Находит модальное окно на странице и возвращает объект с методами управления.
   * @returns {Object|null} { setTitle, setContent, setFooter, open, close, element }
   */
  findModal() {
    const modalElement = document.querySelector('.vnf-modal-overlay');
    if (!modalElement) return null;

    return {
      element: modalElement,

      setTitle(title) {
        const el = modalElement.querySelector('.vnf-modal-title');
        if (el) el.textContent = title;
      },

      setContent(content) {
        const el = modalElement.querySelector('.vnf-modal-body');
        if (el) el.innerHTML = content;
      },

      setFooter(html) {
        const el = modalElement.querySelector('.vnf-modal-footer');
        if (el) el.innerHTML = html;
      },

      open() {
        modalElement.style.display = 'flex';
        if (modalElement._modalInstance) {
          modalElement._modalInstance.setCloseOnOverlay(false);
        }
      },

      close() {
        modalElement.style.display = 'none';
        if (modalElement._modalInstance) {
          modalElement._modalInstance.setCloseOnOverlay(true);
        }
      }
    };
  }
};
/**
 * htmlUtils.js
 *
 * HtmlUtils — набор утилит для работы с HTML и форматированием данных.
 * Устраняет дублирование escapeHtml(), formatDate(), determineFieldType()
 * в EditAction, AddAction, FilterAction.
 */
const HtmlUtils = {
  /**
   * Экранирует HTML-спецсимволы.
   * @param {*} str
   * @returns {string}
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Конвертирует DD.MM.YYYY → YYYY-MM-DD для input type="date".
   * @param {*} value
   * @returns {string}
   */
  formatDate(value) {
    if (!value) return '';
    const match = String(value).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    return String(value);
  },

  /**
   * Определяет тип поля для формы на основе колонки Tabulator и значения.
   * @param {Object} columnDef
   * @param {*} value
   * @returns {string} 'input' | 'number' | 'date' | 'textarea' | 'select'
   */
  determineFieldType(columnDef, value) {
    if (columnDef.editorType) return columnDef.editorType;
    if (value === null || value === undefined) return 'input';
    if (typeof value === 'number' || /^\d+\.?\d*$/.test(String(value))) return 'number';
    if (this._isDateValue(value)) return 'date';
    if (String(value).length > 100) return 'textarea';
    return 'input';
  },

  _isDateValue(value) {
    const str = String(value);
    return /^\d{4}-\d{2}-\d{2}$/.test(str) || /^\d{2}\.\d{2}\.\d{4}$/.test(str);
  }
};
/**
 * actionLogger.js
 *
 * ActionLogger — центральный логгер действий пользователя (Singleton).
 *
 * Назначение:
 * - Единая точка для записи всех действий пользователя
 * - Хранение истории логов (макс. 200 записей)
 * - Оповещение подписчиков (LogPanel и др.) о новых записях через паттерн Observer
 * - Сбор данных для будущей реализации Undo (поле data)
 *
 * Формат записи:
 *   { id, type, description, data, timestamp }
 *
 * Использование:
 *   ActionLogger.log('edit', 'Редактирование строки: table_1', { tableId, before, after });
 *   ActionLogger.log('add', 'Добавление строки: table_1', { tableId, newRow });
 *   ActionLogger.log('delete', 'Удаление строки: table_1', { tableId, deletedRow });
 *   ActionLogger.log('filter', 'Применение фильтра: поле = значение', { tableId, filters });
 *   ActionLogger.log('save', 'Сохранение данных в БД', { configName, data });
 *   ActionLogger.log('paramChange', 'Изменение параметра: name = value', { name, value, type });
 *   ActionLogger.log('dataLoad', 'Загрузка данных: ds_1 (42 строки)', { datasourceId, rowCount });
 *   ActionLogger.log('error', 'Ошибка загрузки конфигурации: test', { configName, errorMessage });
 */
const ActionLogger = {
  /** @private */
  _logs: [],
  /** @private Максимум записей в логе */
  _maxEntries: 200,
  /** @private Список подписчиков (callback'ов) */
  _subscribers: [],

  /**
   * Добавляет запись в лог и оповещает подписчиков.
   * Новая запись добавляется в начало массива (свежие сверху).
   *
   * @param {string} actionType — тип действия: 'edit' | 'add' | 'delete' | 'filter' | 'save' | 'saveUserConfig' | 'loadUserConfig' | 'reset' | 'paramChange' | 'dataLoad' | 'error' | 'undo'
   * @param {string} description — человекочитаемое описание действия
   * @param {object|null} data — полные данные для будущего Undo (опционально)
   * @returns {object} созданная запись лога
   */
  log(actionType, description, data) {
    const entry = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      type: actionType,
      description: description,
      data: data || null,
      timestamp: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    this._logs.unshift(entry);
    if (this._logs.length > this._maxEntries) {
      this._logs.pop();
    }

    this._notify(entry);
    return entry;
  },

  /**
   * Возвращает все записи лога (новые сверху).
   * @returns {Array}
   */
  getLogs() {
    return this._logs;
  },

  /**
   * Очищает лог и оповещает подписчиков.
   * Подписчикам передаётся null, чтобы они могли очистить свой UI.
   */
  clear() {
    this._logs = [];
    this._notify(null);
  },

  /**
   * Подписаться на новые записи лога.
   * @param {Function} callback — функция, которая будет вызвана при каждой новой записи.
   *        callback(entry) — entry — новая запись, или null при очистке лога.
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this._subscribers.push(callback);
    }
  },

  /**
   * @private Оповещает всех подписчиков о новой записи (или очистке).
   * @param {object|null} entry — запись лога или null при очистке
   */
  _notify(entry) {
    this._subscribers.forEach(function(callback) {
      try {
        callback(entry);
      } catch (e) {
        console.error('ActionLogger: ошибка в подписчике:', e);
      }
    });
  }
};
/**
 * cLogPanel.js
 *
 * LogPanel — компонент панели логирования действий пользователя.
 *
 * Регистрируется через PageBuilder.addComponent и добавляется в JSON-конфиг
 * страницы в секцию page как обычный компонент.
 *
 * Конфиг:
 * {
 *   "type": "logPanel",
 *   "id": "logPanel1",
 *   "title": "Лог действий",         // опционально, по умолчанию "Лог действий"
 *   "maxHeight": "300px",            // опционально, по умолчанию "250px"
 *   "showClearButton": true,         // опционально, по умолчанию true
 *   "position": "right"              // опционально: "right" (справа, по умолчанию) или "left" (слева)
 * }
 *
 * Принцип работы:
 * - Создаёт DOM-структуру панели (заголовок + список + кнопка очистки)
 * - Подписывается на ActionLogger через subscribe()
 * - При новой записи — автоматически добавляет элемент в DOM
 * - При очистке лога — очищает DOM
 * - При создании загружает уже существующие записи из ActionLogger.getLogs()
 */

class LogPanel {
  static TYPE = 'logPanel';

  /**
   * @param {HTMLElement} parentElement — DOM-элемент, в который вставляется панель
   * @param {Object} config — конфигурация компонента из JSON
   */
  constructor(parentElement, config) {
    this.parentElement = parentElement;
    this.config = config;
    this._element = null;     // корневой DOM-элемент панели
    this._listElement = null; // контейнер для записей лога
    this._isSubscribed = false;

    this.create();
  }

  /**
   * Создаёт DOM-структуру панели и подписывается на ActionLogger.
   */
  create() {
    const title = this.config.title || 'Лог действий';
    const maxHeight = this.config.maxHeight || '250px';
    const showClearButton = this.config.showClearButton !== false;
    const position = this.config.position || 'right';

    // Определяем CSS-класс позиционирования
    var positionClass = 'log-panel--right';
    if (position === 'left') {
      positionClass = 'log-panel--left';
    }

    // Иконка для заголовка
    const titleIcon = '<span class="log-panel-title-icon">&#128203;</span>';

    // Кнопка очистки
    const clearBtnHtml = showClearButton
      ? '<button class="log-panel-clear-btn" title="Очистить историю">&#128465; Очистить</button>'
      : '';

    // HTML-структура панели (без inline max-height — высота управляется через CSS)
    const html =
      '<div class="log-panel ' + positionClass + '" id="log-panel-' + this.config.id + '">' +
        '<div class="log-panel-header">' +
          '<div class="log-panel-title">' + titleIcon + title + '</div>' +
          clearBtnHtml +
        '</div>' +
        '<div class="log-panel-list">' +
          '<div class="log-panel-empty">' +
            '<div class="log-panel-empty-icon">&#128203;</div>' +
            '<div>Нет действий</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    this.parentElement.insertAdjacentHTML('beforeend', html);
    this._element = this.parentElement.lastElementChild;
    this._listElement = this._element.querySelector('.log-panel-list');

    // Устанавливаем max-height через CSS custom property, чтобы не перезаписывать CSS-класс
    this._element.style.setProperty('--log-panel-max-height', maxHeight);

    // Навешиваем обработчик на кнопку очистки
    if (showClearButton) {
      var clearBtn = this._element.querySelector('.log-panel-clear-btn');
      var self = this;
      clearBtn.addEventListener('click', function() {
        ActionLogger.clear();
      });
    }

    // Подписываемся на ActionLogger
    this.subscribeToLogger();

    // Загружаем уже существующие записи (если есть)
    this.loadExistingLogs();
  }

  /**
   * Подписывается на ActionLogger.
   * При новой записи — добавляет элемент в DOM.
   * При очистке (entry === null) — очищает DOM.
   */
  subscribeToLogger() {
    if (this._isSubscribed) return;
    this._isSubscribed = true;

    var self = this;
    ActionLogger.subscribe(function(entry) {
      if (entry === null) {
        // Очистка лога
        self.clearDOM();
      } else {
        // Новая запись
        self.addEntryToDOM(entry);
      }
    });
  }

  /**
   * Загружает уже существующие записи из ActionLogger при создании панели.
   */
  loadExistingLogs() {
    var existingLogs = ActionLogger.getLogs();
    if (existingLogs && existingLogs.length > 0) {
      // Убираем заглушку "Нет действий"
      this.removeEmptyPlaceholder();

      // Добавляем существующие записи (они уже в обратном порядке — новые сверху)
      for (var i = 0; i < existingLogs.length; i++) {
        this.insertEntryElement(existingLogs[i]);
      }
    }
  }

  /**
   * Добавляет запись лога в DOM.
   * @param {Object} entry — запись лога из ActionLogger
   */
  addEntryToDOM(entry) {
    // Убираем заглушку "Нет действий"
    this.removeEmptyPlaceholder();

    // Вставляем новую запись в начало списка
    this.insertEntryElement(entry);
  }

  /**
   * Создаёт DOM-элемент для записи лога и вставляет его в начало списка.
   * @param {Object} entry — запись лога
   */
  insertEntryElement(entry) {
    var icon = this.getIconForType(entry.type);
    var typeClass = 'log-panel-entry--' + (entry.type || 'unknown');

    var entryHtml =
      '<div class="log-panel-entry ' + typeClass + '">' +
        '<div class="log-panel-entry-icon">' + icon + '</div>' +
        '<div class="log-panel-entry-content">' +
          '<div class="log-panel-entry-description">' + HtmlUtils.escapeHtml(entry.description) + '</div>' +
          '<div class="log-panel-entry-timestamp">' + HtmlUtils.escapeHtml(entry.timestamp) + '</div>' +
        '</div>' +
      '</div>';

    this._listElement.insertAdjacentHTML('afterbegin', entryHtml);
  }

  /**
   * Удаляет заглушку "Нет действий", если она есть.
   */
  removeEmptyPlaceholder() {
    var emptyEl = this._listElement.querySelector('.log-panel-empty');
    if (emptyEl) {
      emptyEl.remove();
    }
  }

  /**
   * Очищает DOM-список записей и показывает заглушку.
   */
  clearDOM() {
    this._listElement.innerHTML =
      '<div class="log-panel-empty">' +
        '<div class="log-panel-empty-icon">&#128203;</div>' +
        '<div>Нет действий</div>' +
      '</div>';
  }

  /**
   * Возвращает иконку (эмодзи/символ) для типа действия.
   * @param {string} type — тип действия
   * @returns {string}
   */
  getIconForType(type) {
    var icons = {
      'edit': '\u270F\uFE0F',        // ✏️
      'add': '\u2795',               // ➕
      'delete': '\u274C',            // ❌
      'filter': '\uD83D\uDD0D',      // 🔍
      'save': '\uD83D\uDCBE',        // 💾
      'saveUserConfig': '\uD83D\uDCBE', // 💾
      'loadUserConfig': '\uD83D\uDCC2', // 📂
      'reset': '\uD83D\uDD04',       // 🔄
      'paramChange': '\u2699\uFE0F', // ⚙️
      'dataLoad': '\uD83D\uDCE9',    // 📩
      'error': '\u26A0\uFE0F',       // ⚠️
      'undo': '\u21A9\uFE0F'         // ↩️
    };
    return icons[type] || '\u2022';  // • (точка для неизвестного типа)
  }
}

PageBuilder.addComponent(LogPanel.TYPE, LogPanel);
class EditAction extends TableAction {
  static TYPE = "editModalAction";

  constructor(parentElement, config, target) {
    super(parentElement, config, target);
    this.init();
  }

  init() {
    const trigger = this.config.trigger || 'click';

    if (this.target && this.target.addEventListener) {
      this.target.addEventListener(trigger, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openEditModal();
      });
    } else {
      console.warn("EditAction: target не является DOM элементом");
    }
  }

  // ==================== ОСНОВНАЯ ЛОГИКА ====================

  openEditModal() {
    // 1. Получить выбранную строку
    const selectedData = this.table.getSelectedData();
    if (!selectedData || selectedData.length === 0) {
      alert('Выберите строку для редактирования');
      return;
    }
    const rowData = selectedData[0];

    // 2. Получить листовые колонки (рекурсивно) — из TableAction
    const columns = this.getLeafColumns();

    // 3. Построить HTML формы
    const formHtml = this.buildForm(rowData, columns);

    // 4. Найти модальное окно — через ModalHelper
    const modal = ModalHelper.findModal();
    if (!modal) {
      console.error("EditAction: модальное окно не найдено");
      return;
    }

    // 5. Заполнить и открыть модальное окно
    modal.setTitle('Редактирование строки');
    modal.setContent(formHtml);
    modal.setFooter(`
      <button type="submit" class="btn btn-success btn-sm" id="edit-save-btn" form="edit-form">Сохранить</button>
      <button type="button" class="btn btn-secondary btn-sm" id="edit-cancel-btn">Отмена</button>
    `);
    modal.open();

    // 6. Навесить обработчики
    this.setupFormHandler(rowData, columns, modal);
    this.setupCancelHandler(modal);
  }

  // ==================== ПОСТРОЕНИЕ ФОРМЫ ====================

  buildForm(rowData, columns) {
    let html = '<form class="edit-form" id="edit-form">';

    for (let col of columns) {
      const value = rowData[col.field];
      const fieldType = HtmlUtils.determineFieldType(col, value);
      html += this.createFieldHtml(col, value, fieldType);
    }

    html += '</form>';
    return html;
  }

  createFieldHtml(columnDef, value, fieldType) {
    const fieldName = columnDef.title || columnDef.field;
    const fieldId = `edit-field-${columnDef.field}`;
    const name = columnDef.field;
    const escapedValue = HtmlUtils.escapeHtml(String(value ?? ''));

    let inputHtml = '';

    switch (fieldType) {
      case 'textarea':
        inputHtml = `<textarea class="edit-form-textarea" id="${fieldId}" name="${name}">${escapedValue}</textarea>`;
        break;
      case 'number':
        inputHtml = `<input type="number" class="edit-form-input" id="${fieldId}" name="${name}" value="${escapedValue}">`;
        break;
      case 'date':
        inputHtml = `<input type="date" class="edit-form-input" id="${fieldId}" name="${name}" value="${HtmlUtils.formatDate(value)}">`;
        break;
      case 'select':
        inputHtml = this.createSelectHtml(columnDef, value, fieldId, name);
        break;
      default:
        inputHtml = `<input type="text" class="edit-form-input" id="${fieldId}" name="${name}" value="${escapedValue}">`;
    }

    return `
      <div class="edit-form-field">
        <label class="edit-form-label" for="${fieldId}">${fieldName}</label>
        ${inputHtml}
      </div>
    `;
  }

  createSelectHtml(columnDef, value, fieldId, name) {
    const options = columnDef.editorOptions || [];
    let html = `<select class="edit-form-select" id="${fieldId}" name="${name}">`;
    for (let opt of options) {
      const selected = String(opt.value) === String(value) ? 'selected' : '';
      html += `<option value="${opt.value}" ${selected}>${opt.label || opt.value}</option>`;
    }
    html += '</select>';
    return html;
  }

  // ==================== ОБРАБОТЧИКИ ====================

  setupFormHandler(rowData, columns, modal) {
    const form = document.getElementById('edit-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveChanges(rowData, columns, modal);
    });
  }

  setupCancelHandler(modal) {
    const cancelBtn = document.getElementById('edit-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => modal.close());
    }
  }

  // ==================== СОХРАНЕНИЕ ====================

  saveChanges(originalRowData, columns, modal) {
    const form = document.getElementById('edit-form');
    if (!form) return;

    const formData = new FormData(form);
    const newData = Object.fromEntries(formData.entries());

    const selectedRows = this.table.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      selectedRows[0].update(newData);
    } else {
      this.table.updateData([newData]);
    }

    console.log('EditAction: строка обновлена', {
      original: originalRowData,
      updated: newData
    });

    modal.close();

    // Логируем редактирование строки
    var tableId = this.table.element ? this.table.element.id : 'unknown';
    ActionLogger.log('edit', 'Редактирование строки: ' + tableId, {
      tableId: tableId,
      before: originalRowData,
      after: newData
    });
  }
}

PageBuilder.addComponent(EditAction.TYPE, EditAction);
ActionRegistry.register(EditAction.TYPE, EditAction);
/**
 * cAddAction.js
 *
 * AddAction (tabulatorAddAction) — добавление новой строки в таблицу Tabulator.
 * При нажатии на кнопку открывается модальное окно с пустой формой,
 * поля которой соответствуют колонкам таблицы. Выбор строки не требуется.
 *
 * Алгоритм работы:
 * 1. Получить листовые колонки таблицы (рекурсивно) — из TableAction
 * 2. Построить HTML формы с пустыми полями (тип поля определяется автоматически)
 * 3. Открыть модальное окно с формой — через ModalHelper
 * 4. При сабмите — добавить новую строку в таблицу
 */

class AddAction extends TableAction {
  static TYPE = 'tabulatorAddAction';

  constructor(parentElement, config, target) {
    super(parentElement, config, target);
    this.init();
  }

  init() {
    const trigger = this.config.trigger || 'click';

    if (this.target && this.target.addEventListener) {
      this.target.addEventListener(trigger, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openAddModal();
      });
    } else {
      console.warn('AddAction: target не является DOM элементом');
    }
  }

  // ==================== ОСНОВНАЯ ЛОГИКА ====================

  openAddModal() {
    // 1. Получить листовые колонки — из TableAction
    const columns = this.getLeafColumns();

    // 2. Построить HTML формы с пустыми значениями
    const formHtml = this.buildEmptyForm(columns);

    // 3. Найти модальное окно — через ModalHelper
    const modal = ModalHelper.findModal();
    if (!modal) {
      console.error('AddAction: модальное окно не найдено');
      return;
    }

    // 4. Заполнить и открыть модальное окно
    modal.setTitle('Добавление строки');
    modal.setContent(formHtml);
    modal.setFooter(`
      <button type="submit" class="btn btn-success btn-sm" id="add-save-btn" form="add-form">Добавить</button>
      <button type="button" class="btn btn-secondary btn-sm" id="add-cancel-btn">Отмена</button>
    `);
    modal.open();

    // 5. Навесить обработчики
    this.setupFormHandler(columns, modal);
    this.setupCancelHandler(modal);
  }

  // ==================== ПОСТРОЕНИЕ ПУСТОЙ ФОРМЫ ====================

  /**
   * Строит форму с пустыми полями на основе колонок таблицы.
   * Для определения типа поля использует первую строку данных (если есть).
   */
  buildEmptyForm(columns) {
    // Пробуем получить типы полей из первой строки данных
    let sampleRow = null;
    const tableData = this.table.getData();
    if (tableData && tableData.length > 0) {
      sampleRow = tableData[0];
    }

    let html = '<form class="edit-form" id="add-form">';

    for (let col of columns) {
      const sampleValue = sampleRow ? sampleRow[col.field] : '';
      const fieldType = HtmlUtils.determineFieldType(col, sampleValue);
      html += this.createFieldHtml(col, fieldType);
    }

    html += '</form>';
    return html;
  }

  /**
   * Создаёт HTML для одного поля формы с пустым значением.
   */
  createFieldHtml(columnDef, fieldType) {
    const fieldName = columnDef.title || columnDef.field;
    const fieldId = `add-field-${columnDef.field}`;
    const name = columnDef.field;

    let inputHtml = '';

    switch (fieldType) {
      case 'textarea':
        inputHtml = `<textarea class="edit-form-textarea" id="${fieldId}" name="${name}"></textarea>`;
        break;
      case 'number':
        inputHtml = `<input type="number" class="edit-form-input" id="${fieldId}" name="${name}" value="">`;
        break;
      case 'date':
        inputHtml = `<input type="date" class="edit-form-input" id="${fieldId}" name="${name}" value="">`;
        break;
      case 'select':
        inputHtml = this.createSelectHtml(columnDef, fieldId, name);
        break;
      default:
        inputHtml = `<input type="text" class="edit-form-input" id="${fieldId}" name="${name}" value="">`;
    }

    return `
      <div class="edit-form-field">
        <label class="edit-form-label" for="${fieldId}">${fieldName}</label>
        ${inputHtml}
      </div>
    `;
  }

  createSelectHtml(columnDef, fieldId, name) {
    const options = columnDef.editorOptions || [];
    let html = `<select class="edit-form-select" id="${fieldId}" name="${name}">`;
    for (let opt of options) {
      html += `<option value="${opt.value}">${opt.label || opt.value}</option>`;
    }
    html += '</select>';
    return html;
  }

  // ==================== ОБРАБОТЧИКИ ====================

  setupFormHandler(columns, modal) {
    const form = document.getElementById('add-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addRow(columns, modal);
    });
  }

  setupCancelHandler(modal) {
    const cancelBtn = document.getElementById('add-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => modal.close());
    }
  }

  // ==================== ДОБАВЛЕНИЕ СТРОКИ ====================

  addRow(columns, modal) {
    const form = document.getElementById('add-form');
    if (!form) return;

    const formData = new FormData(form);
    const newRowData = Object.fromEntries(formData.entries());

    this.table.addData([newRowData], true);

    console.log('AddAction: строка добавлена', newRowData);

    modal.close();

    // Логируем добавление строки
    var tableId = this.table.element ? this.table.element.id : 'unknown';
    ActionLogger.log('add', 'Добавление строки: ' + tableId, {
      tableId: tableId,
      newRow: newRowData
    });
  }
}

PageBuilder.addComponent(AddAction.TYPE, AddAction);
ActionRegistry.register(AddAction.TYPE, AddAction);
/**
 * cDeleteAction.js
 *
 * DeleteAction (tabulatorDeleteAction) — удаление выбранной строки из таблицы Tabulator.
 * Требует предварительного выбора строки в таблице.
 *
 * Алгоритм работы:
 * 1. Получить выбранную строку из таблицы
 * 2. Если строка не выбрана — показать предупреждение
 * 3. Запросить подтверждение удаления
 * 4. Удалить строку из таблицы
 */

class DeleteAction extends TableAction {
  static TYPE = 'tabulatorDeleteAction';

  constructor(parentElement, config, target) {
    super(parentElement, config, target);
    this.init();
  }

  init() {
    const trigger = this.config.trigger || 'click';

    if (this.target && this.target.addEventListener) {
      this.target.addEventListener(trigger, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.deleteSelectedRow();
      });
    } else {
      console.warn('DeleteAction: target не является DOM элементом');
    }
  }

  // ==================== ОСНОВНАЯ ЛОГИКА ====================

  deleteSelectedRow() {
    // 1. Получить выбранную строку
    const selectedRows = this.table.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
      alert('Выберите строку для удаления');
      return;
    }

    const selectedData = this.table.getSelectedData();
    const rowData = selectedData[0];

    // 2. Подтверждение удаления
    if (!confirm('Вы уверены, что хотите удалить выбранную строку?')) {
      return;
    }

    // 3. Удаляем строку
    selectedRows[0].delete();

    console.log('DeleteAction: строка удалена', rowData);

    // Логируем удаление строки
    var tableId = this.table.element ? this.table.element.id : 'unknown';
    ActionLogger.log('delete', 'Удаление строки: ' + tableId, {
      tableId: tableId,
      deletedRow: rowData
    });
  }
}

PageBuilder.addComponent(DeleteAction.TYPE, DeleteAction);
ActionRegistry.register(DeleteAction.TYPE, DeleteAction);
/**
 * cFilterAction.js
 *
 * FilterAction (tabulatorFilterAction) — фильтрация данных таблицы Tabulator
 * через модальное окно с тремя частями:
 *   1. Выбор поля (выпадающий список всех колонок таблицы)
 *   2. Настройка фильтра (оператор + значение + кнопка "Применить")
 *   3. Список активных фильтров (с возможностью удаления)
 *
 * Алгоритм работы:
 * 1. При нажатии на кнопку "Фильтрация" открывается модальное окно
 * 2. Пользователь выбирает поле, оператор, вводит значение и нажимает "Применить"
 * 3. Фильтр добавляется в список активных фильтров (но не применяется к таблице)
 * 4. При нажатии "Сохранить" все фильтры применяются к Tabulator
 * 5. При нажатии "Отмена" модальное окно закрывается без применения
 */

class FilterAction extends TableAction {
  static TYPE = 'tabulatorFilterAction';

  constructor(parentElement, config, target) {
    super(parentElement, config, target);
    this.activeFilters = []; // текущие (ещё не сохранённые) фильтры
    this.savedFilters = [];  // последние применённые фильтры
    this.init();
  }

  init() {
    const trigger = this.config.trigger || 'click';

    if (this.target && this.target.addEventListener) {
      this.target.addEventListener(trigger, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openFilterModal();
      });
    } else {
      console.warn('FilterAction: target не является DOM элементом');
    }
  }

  // ==================== ОСНОВНАЯ ЛОГИКА ====================

  openFilterModal() {
    // 1. Получить листовые колонки — из TableAction
    const columns = this.getLeafColumns();
    if (!columns || columns.length === 0) {
      console.error('FilterAction: нет колонок для фильтрации');
      return;
    }

    // 2. Восстановить activeFilters из savedFilters при повторном открытии
    this.activeFilters = this.savedFilters.map(f => ({ ...f }));

    // 3. Построить HTML модального окна
    const modalHtml = this.buildFilterModalHtml(columns);

    // 4. Найти модальное окно — через ModalHelper
    const modal = ModalHelper.findModal();
    if (!modal) {
      console.error('FilterAction: модальное окно не найдено');
      return;
    }

    // 5. Заполнить и открыть модальное окно
    modal.setTitle('Фильтрация данных');
    modal.setContent(modalHtml);
    modal.setFooter(`
      <button type="button" class="btn btn-secondary btn-sm" id="filter-cancel-btn">Отмена</button>
      <button type="button" class="btn btn-primary btn-sm" id="filter-save-btn">Сохранить</button>
    `);
    modal.open();

    // 6. Навесить обработчики
    this.setupEventListeners(modal, columns);
  }

  // ==================== ПОСТРОЕНИЕ HTML ====================

  buildFilterModalHtml(columns) {
    const fieldSelectorHtml = this.buildFieldSelector(columns);
    const configuratorHtml = this.buildFilterConfigurator();
    const activeListHtml = this.buildActiveFiltersList();

    return `
      <div class="filter-modal-body">
        <!-- ЧАСТЬ 1: Выбор поля -->
        <div class="filter-section">
          <label class="filter-section-label">Выберите поле для фильтрации</label>
          ${fieldSelectorHtml}
        </div>

        <!-- ЧАСТЬ 2: Настройка фильтра -->
        <div class="filter-section" id="filter-config-section">
          ${configuratorHtml}
        </div>

        <!-- ЧАСТЬ 3: Список активных фильтров -->
        <div class="filter-section">
          <label class="filter-section-label">Применённые фильтры</label>
          <div class="filter-active-list" id="filter-active-list">
            ${activeListHtml}
          </div>
        </div>
      </div>
    `;
  }

  buildFieldSelector(columns) {
    let html = `<select class="filter-field-select" id="filter-field-select">
      <option value="">— выберите поле —</option>`;
    for (let col of columns) {
      const title = col.title || col.field;
      html += `<option value="${col.field}">${HtmlUtils.escapeHtml(title)}</option>`;
    }
    html += `</select>`;
    return html;
  }

  buildFilterConfigurator() {
    return `
      <div class="filter-config-info" id="filter-config-info">
        <em>Выберите поле из списка выше</em>
      </div>
      <div class="filter-config-row">
        <select class="filter-operator-select" id="filter-operator-select">
          <option value="=">= (равно)</option>
          <option value="!=">!= (не равно)</option>
          <option value="<">< (меньше)</option>
          <option value="<="><= (меньше или равно)</option>
          <option value=">">> (больше)</option>
          <option value=">=">>= (больше или равно)</option>
          <option value="like">Содержит</option>
          <option value="starts">Начинается с</option>
          <option value="ends">Заканчивается на</option>
        </select>
        <input type="text" class="filter-value-input" id="filter-value-input"
               placeholder="Введите значение" autocomplete="off">
        <button type="button" class="btn btn-outline-primary btn-sm filter-apply-btn" id="filter-apply-btn">
          Применить
        </button>
      </div>
    `;
  }

  buildActiveFiltersList() {
    if (!this.activeFilters || this.activeFilters.length === 0) {
      return `<div class="filter-empty">Фильтры не применены</div>`;
    }

    let html = '';
    for (let i = 0; i < this.activeFilters.length; i++) {
      const f = this.activeFilters[i];
      const fieldTitle = this.getFieldTitle(f.field);
      const operatorLabel = this.getOperatorLabel(f.type);
      html += `
        <div class="filter-active-item" data-filter-index="${i}">
          <span class="filter-active-text">
            <strong>${HtmlUtils.escapeHtml(fieldTitle)}</strong>
            ${HtmlUtils.escapeHtml(operatorLabel)}
            <span class="filter-active-value">"${HtmlUtils.escapeHtml(String(f.value))}"</span>
          </span>
          <button type="button" class="filter-remove-btn" data-filter-index="${i}" title="Удалить фильтр">&times;</button>
        </div>
      `;
    }
    return html;
  }

  // ==================== ОБРАБОТЧИКИ ====================

  setupEventListeners(modal, columns) {
    // Смена поля
    const fieldSelect = document.getElementById('filter-field-select');
    if (fieldSelect) {
      fieldSelect.addEventListener('change', () => {
        this.onFieldChange(fieldSelect.value, columns);
      });
    }

    // Кнопка "Применить"
    const applyBtn = document.getElementById('filter-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.onApplyFilter(columns);
      });
    }

    // Enter в поле ввода значения
    const valueInput = document.getElementById('filter-value-input');
    if (valueInput) {
      valueInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.onApplyFilter(columns);
        }
      });
    }

    // Делегирование событий на кнопки удаления фильтров (динамические)
    const activeList = document.getElementById('filter-active-list');
    if (activeList) {
      activeList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.filter-remove-btn');
        if (removeBtn) {
          const index = parseInt(removeBtn.dataset.filterIndex, 10);
          if (!isNaN(index)) {
            this.onRemoveFilter(index);
          }
        }
      });
    }

    // Кнопка "Сохранить"
    const saveBtn = document.getElementById('filter-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.onSave(modal);
      });
    }

    // Кнопка "Отмена"
    const cancelBtn = document.getElementById('filter-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.onCancel(modal);
      });
    }
  }

  onFieldChange(field, columns) {
    const infoEl = document.getElementById('filter-config-info');
    const operatorSelect = document.getElementById('filter-operator-select');
    const valueInput = document.getElementById('filter-value-input');

    if (!field) {
      if (infoEl) infoEl.innerHTML = '<em>Выберите поле из списка выше</em>';
      return;
    }

    // Найти описание поля
    const col = columns.find(c => c.field === field);
    if (col && infoEl) {
      const title = col.title || col.field;
      infoEl.innerHTML = `<strong>Поле:</strong> ${HtmlUtils.escapeHtml(title)} <span class="filter-config-field-name">(${HtmlUtils.escapeHtml(field)})</span>`;
    }

    // Сбросить оператор и значение
    if (operatorSelect) operatorSelect.selectedIndex = 0;
    if (valueInput) valueInput.value = '';
    if (valueInput) valueInput.focus();
  }

  onApplyFilter(columns) {
    const fieldSelect = document.getElementById('filter-field-select');
    const operatorSelect = document.getElementById('filter-operator-select');
    const valueInput = document.getElementById('filter-value-input');

    const field = fieldSelect ? fieldSelect.value : '';
    const type = operatorSelect ? operatorSelect.value : '';
    const value = valueInput ? valueInput.value.trim() : '';

    // Валидация
    if (!field) {
      alert('Выберите поле для фильтрации');
      return;
    }
    if (value === '') {
      alert('Введите значение для фильтрации');
      return;
    }

    // Проверка на дубликат — если такое же поле и оператор, заменяем
    const existingIndex = this.activeFilters.findIndex(f => f.field === field && f.type === type);
    if (existingIndex >= 0) {
      this.activeFilters[existingIndex].value = value;
    } else {
      this.activeFilters.push({ field, type, value });
    }

    // Обновить список активных фильтров
    this.updateActiveFiltersList();

    // Сбросить поля ввода для следующего фильтра
    if (operatorSelect) operatorSelect.selectedIndex = 0;
    if (valueInput) valueInput.value = '';
    if (fieldSelect) fieldSelect.value = '';
    const infoEl = document.getElementById('filter-config-info');
    if (infoEl) infoEl.innerHTML = '<em>Выберите поле из списка выше</em>';
    if (fieldSelect) fieldSelect.focus();
  }

  onRemoveFilter(index) {
    if (index >= 0 && index < this.activeFilters.length) {
      this.activeFilters.splice(index, 1);
      this.updateActiveFiltersList();
    }
  }

  onSave(modal) {
    // Сохраняем фильтры
    this.savedFilters = this.activeFilters.map(f => ({ ...f }));

    // Применяем к таблице
    if (this.table) {
      if (this.savedFilters.length === 0) {
        this.table.clearFilter();
        console.log('FilterAction: фильтры очищены');
      } else {
        this.table.setFilter(this.savedFilters);
        console.log('FilterAction: применены фильтры', this.savedFilters);
      }
    }

    modal.close();

    // Логируем фильтрацию
    var tableId = this.table && this.table.element ? this.table.element.id : 'unknown';
    if (this.savedFilters.length === 0) {
      ActionLogger.log('filter', 'Очистка фильтров: ' + tableId, {
        tableId: tableId,
        filters: []
      });
    } else {
      var filterDesc = this.savedFilters.map(function(f) {
        return f.field + ' ' + f.type + ' "' + f.value + '"';
      }).join(', ');
      ActionLogger.log('filter', 'Применение фильтра: ' + filterDesc, {
        tableId: tableId,
        filters: this.savedFilters
      });
    }
  }

  onCancel(modal) {
    // Восстанавливаем activeFilters из savedFilters
    this.activeFilters = this.savedFilters.map(f => ({ ...f }));
    modal.close();
  }

  // ==================== ОБНОВЛЕНИЕ СПИСКА ====================

  updateActiveFiltersList() {
    const container = document.getElementById('filter-active-list');
    if (!container) return;
    container.innerHTML = this.buildActiveFiltersList();
  }

  // ==================== УТИЛИТЫ ====================

  getFieldTitle(field) {
    if (!this.table) return field;
    const columns = this.getLeafColumns();
    const col = columns.find(c => c.field === field);
    return col ? (col.title || col.field) : field;
  }

  getOperatorLabel(type) {
    const labels = {
      '=': '=',
      '!=': '!=',
      '<': '<',
      '<=': '<=',
      '>': '>',
      '>=': '>=',
      'like': 'содержит',
      'starts': 'начинается с',
      'ends': 'заканчивается на'
    };
    return labels[type] || type;
  }
}

PageBuilder.addComponent(FilterAction.TYPE, FilterAction);
ActionRegistry.register(FilterAction.TYPE, FilterAction);
class ContextMenuAction extends BaseAction {
    static TYPE = "contextMenuAction";
    
    constructor(parentElement, config, target) {
        super(parentElement, config, target);
        
        // Загружаем CSS для контекстного меню
        this.loadStyles();
        this.create();
    }

    loadStyles() {
        if (!document.getElementById('context-menu-styles')) {
            const style = document.createElement('style');
            style.id = 'context-menu-styles';
            style.textContent = `
                .custom-context-menu {
                    position: fixed;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    z-index: 1000;
                    min-width: 180px;
                    padding: 4px 0;
                }
                
                .context-menu-item {
                    padding: 8px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.2s;
                }
                
                .context-menu-item:hover {
                    background-color: #f0f0f0;
                }
                
                .context-menu-item.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .context-menu-separator {
                    height: 1px;
                    background: #ddd;
                    margin: 4px 0;
                }
                
                .context-menu-icon {
                    width: 16px;
                    text-align: center;
                }
            `;
            document.head.appendChild(style);
        }
    }

    create() {
        console.log("ContextMenuAction started with config:", this.config);

        const menuConfig = this.getMenuConfig();
        this.setupTriggers(menuConfig);
    }

    getMenuConfig() {
        //берем конфиг из this.config или используем дефолтный
        const defaultConfig = {
            items: [
                {
                    label: 'Строка 1',
                    icon: 'pencil',
                    action: 'testAction1',
                },
                {
                    label: 'Строка 2',
                    icon: 'arrow-up',
                    action: 'testAction2'
                }
            ]
        };
        
        //будет ли конфиг в меню? Обсудить
        return this.config.menu || defaultConfig;
    }

    setupTriggers(menuConfig) {
        const trigger = this.config.trigger || 'rightClick';
        
        switch(trigger) {
            case 'rightClick':
                this.setupRightClickTrigger(menuConfig);
                break;
            case 'click':
                console.log("setup triggers click")
                break;
            default:
                console.warn(`Неизвестный триггер: ${trigger}`);
        }
    }

    setupRightClickTrigger(menuConfig) {
        if (this.parentElement) {
            this.parentElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showMenu(e, null, menuConfig);
            });
        }
    }

    showMenu(e, row, menuConfig) {
        const menu = this.createMenu(menuConfig.items, row);

        this.positionMenu(menu, e);
        document.body.appendChild(menu);
        
        this.setupMenuClose(menu);
    }

    createMenu(items, contextData) {
        const menu = document.createElement('div');
        menu.className = 'custom-context-menu';
        
        items.forEach(itemConfig => {
          const item = this.createMenuItem(itemConfig, contextData);
          menu.appendChild(item);
        });
        
        return menu;
    }

    createMenuItem(config, contextData) {
        const item = document.createElement('div');
        item.className = `context-menu-item ${config.className || ''}`;

        item.innerHTML = `
            <span>${config.label}</span>
            ${config.shortcut ? `<span style="margin-left: auto; opacity: 0.6;">${config.shortcut}</span>` : ''}
        `;
        
        if (!config.disabled) {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.executeAction(config.action, contextData, config);
            });
        }
        
        return item;
    }

    positionMenu(menu, event) {
        console.log("positionMenu menu:", menu)
        console.log("positionMenu event:", event)

        const x = event.pageX;
        const y = event.pageY;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;
        
        //корректируем позицию, чтобы меню не выходило за границы окна
        let left = x;
        let top = y;
        
        if (x + menuWidth > windowWidth) {
            left = windowWidth - menuWidth - 10;
        }
        
        if (y + menuHeight > windowHeight) {
            top = windowHeight - menuHeight - 10;
        }
        
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
    }

    setupMenuClose(menu) {
      console.log("setupMenuClose: ", menu)
        const closeMenu = () => {
            if (menu && menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        };
        
        document.addEventListener('click', closeMenu);
        
        menu.addEventListener('remove', () => {
            document.removeEventListener('click', closeMenu);
        });
    }

    executeAction(action, contextData, config) {
      console.log(`Выполняется действие: ${action}`, contextData);
    }
}

PageBuilder.addComponent(ContextMenuAction.TYPE, ContextMenuAction);
ActionRegistry.register(ContextMenuAction.TYPE, ContextMenuAction);
class RedirectAction extends BaseAction {
    static TYPE = "redirectAction";
    
    constructor(parentElement, config, target) {
        super(parentElement, config, target);
        this.create();
    }

    create() {
        //получаем конфигурацию redirect из this.config
        const redirectConfig = this.config;
        
        if (!redirectConfig.trigger) {
            console.error("RedirectAction: Не указан trigger в конфигурации");
            return;
        }
 
        this.setupTrigger(redirectConfig);
    }

    setupTrigger(config) {
        const trigger = config.trigger;
        
        switch(trigger) {
            case 'rowDblClick':
                this.setupRowDblClickTrigger(config);
                break;
            case 'rowClick':
                console.log("trigger click for redirect: ")
                break;
            case 'buttonClick':
                console.log("trigger button click for redirect: ")
                break;
            default:
                console.warn(`RedirectAction: Неизвестный триггер: ${trigger}`);
        }
    }

    setupRowDblClickTrigger(config) {
        if (!this.target || typeof this.target.on !== 'function') {
            console.error("RedirectAction: target не является таблицей Tabulator");
            return;
        }
        
        this.target.on('rowDblClick', (e, row) => {
            this.handleRedirect(e, row, config);
        });
    }

    handleRedirect(e, row, config) {
        e?.stopPropagation();
        
        const params = this.collectParams(row, config);

        this.executeRedirect(config, params, row);
    }

    collectParams(row, config) {
        const params = [];
        
        if (row && config.params?.tableParams) {
            config.params.tableParams.forEach(paramConfig => {
                const rowData = row.getData();
                params.push({
                    name: paramConfig.pName,
                    value: rowData[paramConfig.field]
                });
            });
        }
        
        if (config.params?.pageParams) {
            config.params.pageParams.forEach(paramName => {
                params.push({
                    name: paramName,
                    value: PageBuilder.getParamValue(paramName)
                });
            });
        }
        
        return params;
    }

    executeRedirect(config, params = [], row) {
        if (config.url) {
            this._redirectToURL(config, params);
        } else if (config.config) {
            this._redirectToConfig(config, params);
        } else {
            //TODO получение конфига из строки
            const rowConfig = this.getConfigFromRow(row);
            if (rowConfig){
                config.config = rowConfig;
                this._redirectToConfig(config, params)
            } else {
                console.error("RedirectAction: не указан url или конфиг для redirect");
            }

        }
    }

    getConfigFromRow(row) {
        //TODO: метод определяющий конфиг по строке таблицы
        return row.getData()["idconfig"];
    }

    _redirectToConfig(config, params) {
        if (!config.newtab) {
            PageBuilder.loadWithParams(config.config, params);
        } else {
            let redirectUrl = new URL(window.location.href);
            let searchParams = new URLSearchParams(redirectUrl.search);
            
            searchParams.set("config", config.config);
            
            params.forEach(param => {
                searchParams.set(param.name, param.value);
            });
            
            redirectUrl.search = searchParams.toString();
            window.open(redirectUrl, "_blank").focus();
        }
    }

    _redirectToURL(config, params) {
        console.log("RedirectAction: Редирект по URL", config.url);
        //TODO: Реализовать логику редиректа по URL с параметрами
    }
}

PageBuilder.addComponent(RedirectAction.TYPE, RedirectAction);
ActionRegistry.register(RedirectAction.TYPE, RedirectAction);
class Modal extends BaseElement {
    static TYPE = 'modal';
    
    constructor(parentElement, config) {
        super(parentElement, config);
        this._overlayHandler = null; // ссылка на обработчик клика по overlay
        this.setupModal();
    }

    setupModal() {
        const modalId = this.config.id || 'modal_' + Date.now();
        
        const modalHtml = `
            <div class="vnf-modal-overlay" id="${modalId}" style="display: none;">
                <div class="vnf-modal">
                    <div class="vnf-modal-header">
                        <h5 class="vnf-modal-title">${this.config.title || ''}</h5>
                        <button type="button" class="vnf-modal-close">&times;</button>
                    </div>
                    <div class="vnf-modal-body" id="${modalId}_content">
                        ${this.config.content || ''}
                    </div>
                    <div class="vnf-modal-footer" id="${modalId}_footer">
                        <!-- Сюда экшены будут добавлять кнопки -->
                    </div>
                </div>
            </div>
        `;
        
        this.parentElement.insertAdjacentHTML('beforeend', modalHtml);
        this.modalElement = this.parentElement.lastElementChild;
        
        // Сохраняем ссылку на экземпляр Modal в DOM-элементе,
        // чтобы экшены (EditAction, AddAction, FilterAction) могли управлять overlay
        this.modalElement._modalInstance = this;
        
        //закрытие по кнопке X
        this.modalElement.querySelector('.vnf-modal-close').addEventListener('click', () => {
            this.close();
        });
        
        //закрытие по клику на фон — сохраняем ссылку на обработчик
        this._overlayHandler = (e) => {
            if (e.target === this.modalElement) {
                this.close();
            }
        };
        this.modalElement.addEventListener('click', this._overlayHandler);
    }

    /**
     * Включает/отключает закрытие модального окна по клику на фон (overlay).
     * @param {boolean} enable - true = закрывать по клику на фон, false = не закрывать
     */
    setCloseOnOverlay(enable) {
        if (!this.modalElement || !this._overlayHandler) return;
        
        if (enable) {
            this.modalElement.addEventListener('click', this._overlayHandler);
        } else {
            this.modalElement.removeEventListener('click', this._overlayHandler);
        }
    }

    open() {
        this.modalElement.style.display = 'flex';
    }

    close() {
        this.modalElement.style.display = 'none';
    }

    setContent(content) {
        const body = this.modalElement.querySelector('.vnf-modal-body');
        if (body) body.innerHTML = content;
    }

    setTitle(title) {
        const titleElement = this.modalElement.querySelector('.vnf-modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    /**
     * Устанавливает HTML-контент в footer модального окна.
     * @param {string} footerHtml - HTML строка с кнопками
     */
    setFooter(footerHtml) {
        const footer = this.modalElement.querySelector('.vnf-modal-footer');
        if (footer) footer.innerHTML = footerHtml;
    }

    /**
     * Очищает footer модального окна.
     */
    clearFooter() {
        const footer = this.modalElement.querySelector('.vnf-modal-footer');
        if (footer) footer.innerHTML = '';
    }
}

PageBuilder.addComponent(Modal.TYPE, Modal);
class ModalAction extends BaseAction {
    static TYPE = 'modalAction';
    
    constructor(parentElement, config, target) {
        console.log("ModalAction config: ",config)
        super(parentElement, config, target);
        this.create();
    }

    create() {
        const eventName = this.config.trigger || 'click';
        
        //проверяем, является ли target DOM элементом (кнопкой)
        if (this.target && this.target.addEventListener) {
            //для кнопок используем обычный click
            if (eventName === 'click' || eventName === 'rowClick') {
                this.target.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openModal(e);
                });
            }
        }
        //проверяем, является ли target объектом Tabulator
        else if (this.target && typeof this.target.on === 'function') {
            // Для Tabulator используем rowClick
            if (eventName === 'rowClick' || eventName === 'click') {
                this.target.on('rowClick', (e, row) => {
                    this.openModal(e, row);
                });
            }
        }
        //если target указан как строка "parentElement"
        else if (this.config.target === 'parentElement' && this.parentElement) {
            this.parentElement.addEventListener(eventName, (e) => {
                this.openModal(e);
            });
        }
        else {
            console.warn("ModalAction: Cannot attach event listener to target", this.target);
        }
    }

    openModal(event, row = null) {
        let content = '';
        const config = this.config;
        console.log("OPEN MODAL CHECK config", config);
        console.log("OPEN MODAL CHECK row", row);
        
        //определяем контент в зависимости от флага
        if (config.contentType === 'tableRow' && row) {
            console.log("OPEN MODAL CHECK CONTENTTYPE TABLE ROW")

            //если клик по строке таблицы - выводим данные строки
            const rowData = row.getData ? row.getData() : row;

            content = this.formatTableRowData(rowData, config);
        } else if (config.contentType === 'text') {
            console.log("OPEN MODAL CHECK CONTENTTYPE TEXT")
            if (config.tableID){ 
                let table = Tabulator.findTable(`#${config.tableID}`)[0]; 
                console.log("OPEN MODAL CHECK findTable", table);
                console.log("OPEN MODAL Column definitions", table.getColumnDefinitions());
                console.log("OPEN MODAL CHECK getSelected Data", table.getSelectedData());
            }
            //выводим текст
            content = `<p>${config.content || 'Нет содержимого'}</p>`;

        } else if (config.content) {
            console.log("OPEN MODAL CHECK CONTENTTYPE CONTENT")

            //любое другое содержимое
            content = config.content;
        }
        
        //создаем или находим модальное окно
        let modalElement = null;
        
        //сначала ищем по modalId из конфига
        if (config.modalId) {
            modalElement = document.getElementById(config.modalId);
        }
        
        //если не нашли, ищем по классу
        if (!modalElement) {
            modalElement = document.querySelector('.vnf-modal-overlay');
        }
        
        //если все еще нет, создаем новое
        if (!modalElement) {
            modalElement = this.createModal();
        }
        
        //получаем экземпляр модального окна
        const modalInstance = this.getModalInstance(modalElement.id);
        
        if (modalInstance) {
            //устанавливаем заголовок
            if (config.title) {
                modalInstance.setTitle(config.title);
            } else if (config.contentType === 'tableRow') {
                modalInstance.setTitle("Детали записи");
            } else {
                modalInstance.setTitle("Информация");
            }
            
            //устанавливаем контент
            modalInstance.setContent(content);
            
            //открываем
            modalInstance.open();
        } else {
            console.error("Modal instance not found!");
        }
    }

    formatTableRowData(rowData, config) {
        let html = '<div class="table-row-details">';
        
        if (config.displayAllColumns) {
            //выводим все колонки
            Object.keys(rowData).forEach(key => {
                html += `<div class="row-detail"><strong>${key}:</strong> ${rowData[key]}</div>`;
            });
        } else if (config.columns) {
            //выводим только указанные колонки
            config.columns.forEach(col => {
                if (rowData[col] !== undefined) {
                    html += `<div class="row-detail"><strong>${col}:</strong> ${rowData[col]}</div>`;
                }
            });
        } else {
            //по умолчанию выводим все
            Object.keys(rowData).forEach(key => {
                html += `<div class="row-detail"><strong>${key}:</strong> ${rowData[key]}</div>`;
            });
        }
        
        html += '</div>';
        return html;
    }

    createModal() {
        const modalHtml = `
            <div class="vnf-modal-overlay" id="defaultModal" style="display: none;">
                <div class="vnf-modal">
                    <div class="vnf-modal-header">
                        <h5 class="vnf-modal-title"></h5>
                        <button type="button" class="vnf-modal-close">&times;</button>
                    </div>
                    <div class="vnf-modal-body"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        return document.getElementById('defaultModal');
    }

    getModalInstance(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return null;
        
        //возвращаем простой объект с методами управления
        return {
            setTitle: (title) => {
                const titleElement = modalElement.querySelector('.vnf-modal-title');
                if (titleElement) titleElement.textContent = title;
            },
            setContent: (content) => {
                const bodyElement = modalElement.querySelector('.vnf-modal-body');
                if (bodyElement) bodyElement.innerHTML = content;
            },
            open: () => {
                modalElement.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            },
            close: () => {
                modalElement.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };
    }
}

PageBuilder.addComponent(ModalAction.TYPE, ModalAction);
ActionRegistry.register(ModalAction.TYPE, ModalAction);
class DateRange extends BaseElement {
  static TYPE = "dateRange";

  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }

  create() {
    const today = new Date().toISOString().split('T')[0];
    const html = `
      <div class="date-range-container input-group input-group-sm">
        <label class="input-group-text">${this.config.labelFrom || 'С'}</label>
        <input type="date" class="form-control form-control-sm" 
               data-param="${this.config.paramNameFrom}" value="${today}">
        <label class="input-group-text">${this.config.labelTo || 'ПО'}</label>
        <input type="date" class="form-control form-control-sm" 
               data-param="${this.config.paramNameTo}" value="${today}">
      </div>`;
    this.parentElement.insertAdjacentHTML("beforeend", html);
    BaseElement.applyCss(this.parentElement.lastElementChild, this.config);
  }
}
PageBuilder.addComponent(DateRange.TYPE, DateRange);
class ResetAction extends BaseAction {
    static TYPE = 'resetAction';
    
    constructor(parentElement, config, target) {
        super(parentElement, config, target);
        this.init();
    }
    
    init() {
        const trigger = this.config.trigger || 'click';
        this.target.addEventListener(trigger, (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.execute();
        });
    }
    
    execute() {
        // Получаем имя текущего конфига из URL
        let configName = new URLSearchParams(window.location.search).get('config') || 'index';

        // Логируем сброс страницы
        ActionLogger.log('reset', 'Сброс страницы: ' + configName, {
            configName: configName
        });

        // Перезагружаем страницу с этим конфигом (сброс до сохраненного состояния)
        PageBuilder.loadPageConfig(configName);
    }
}
PageBuilder.addComponent(ResetAction.TYPE, ResetAction);
ActionRegistry.register(ResetAction.TYPE, ResetAction);
class SaveAction extends BaseAction {
    static TYPE = 'saveAction';
    
    constructor(parentElement, config, target) {
        super(parentElement, config, target);
        this.init();
    }
    
    init() {
        const trigger = this.config.trigger || 'click';
        this.target.addEventListener(trigger, (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.execute();
        });
    }
    
    execute() {
        // Собираем данные из всех таблиц Tabulator на странице
        let allTableData = {};
        let tableContainers = document.querySelectorAll('.table-tabulator-content > div[id]');
        
        tableContainers.forEach(container => {
            if (container.id){
                let tables = Tabulator.findTable('#' + container.id);
                if(tables && table.length > 0){
                    allTableData[container.id] = tables[0].getData();
                }
            }
        })
        
        console.log('SaveAction: данные таблиц для сохранения:', allTableData);
        
        // TODO: POST на сервер /saveData (когда будет готов Java API)
        // let configName = new URLSearchParams(window.location.search).get('config') || 'index';
        // fetch('/saveData', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ configName: configName, data: allTableData })
        // });
        
        alert('Данные сохранены');

        // Логируем сохранение данных
        let configName = new URLSearchParams(window.location.search).get('config') || 'index';
        ActionLogger.log('save', 'Сохранение данных в БД', {
            configName: configName,
            data: allTableData
        });
    }
}
PageBuilder.addComponent(SaveAction.TYPE, SaveAction);
ActionRegistry.register(SaveAction.TYPE, SaveAction);
class UndoAction extends BaseAction {
    static TYPE = 'undoAction';
    
    constructor(parentElement, config, target) {
        super(parentElement, config, target);
        this.init();
    }
    
    init() {
        const trigger = this.config.trigger || 'click';
        this.target.addEventListener(trigger, (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.execute();
        });
    }
    
    execute() {
        console.log('UndoAction: отмена последнего действия');
        // TODO: реализовать стек истории действий.
        // В будущем здесь будет логика отката последнего изменения
        // (редактирование/добавление/удаление строки в таблице).
        alert('Последнее действие отменено');
    }
}
PageBuilder.addComponent(UndoAction.TYPE, UndoAction);
ActionRegistry.register(UndoAction.TYPE, UndoAction);
class SaveUserConfigAction extends BaseAction {
    static TYPE = 'saveUserConfigAction';
    
    constructor(parentElement, config, target) {
        super(parentElement, config, target);
        this.init();
    }
    
    init() {
        const trigger = this.config.trigger || 'click';
        this.target.addEventListener(trigger, (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.execute();
        });
    }
    
    execute() {
        let configName = new URLSearchParams(window.location.search).get('config') || 'index';
        
        // 1. Собираем значения всех pageParams через data-атрибуты в DOM
        let params = {};
        let paramElements = document.querySelectorAll('[data-param]');
        paramElements.forEach(el => {
            params[el.dataset.param] = el.value;
        });
        
        // 2. Собираем фильтры и данные таблиц
        let tables = {};
        let tableContainers = document.querySelectorAll('.table-tabulator-content > div[id]');
        tableContainers.forEach(container => {
            if (container.id) {
                let tables_arr = Tabulator.findTable('#' + container.id);
                if (tables_arr && tables_arr.length > 0) {
                    let table = tables_arr[0];
                    tables[container.id] = {
                        data: table.getData(),
                        filters: table.getFilters()
                    };
                }
            }
        });
        
        let userConfig = { params, tables, savedAt: new Date().toISOString() };
        
        // Сохраняем в localStorage браузера (временное решение)
        // В будущем: POST на сервер /saveUserConfig
        window.localStorage.setItem(`userConfig_${configName}`, JSON.stringify(userConfig));
        
        console.log('SaveUserConfigAction: конфигурация сохранена:', userConfig);
        alert('Конфигурация пользователя сохранена');

        // Логируем сохранение конфигурации пользователя
        ActionLogger.log('saveUserConfig', 'Сохранение конфигурации пользователя', {
            configName: configName,
            userConfig: userConfig
        });
    }
}
PageBuilder.addComponent(SaveUserConfigAction.TYPE, SaveUserConfigAction);
ActionRegistry.register(SaveUserConfigAction.TYPE, SaveUserConfigAction);
class LoadUserConfigAction extends BaseAction {
    static TYPE = 'loadUserConfigAction';
    
    constructor(parentElement, config, target) {
        super(parentElement, config, target);
        this.init();
    }
    
    init() {
        const trigger = this.config.trigger || 'click';
        this.target.addEventListener(trigger, (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.execute();
        });
    }
    
    execute() {
        let configName = new URLSearchParams(window.location.search).get('config') || 'index';
        
        // Загружаем из localStorage браузера (временное решение)
        // В будущем: GET /loadUserConfig?name=...
        let saved = window.localStorage.getItem(`userConfig_${configName}`);
        
        if (!saved) {
            alert('Сохраненная конфигурация не найдена');
            return;
        }
        
        let userConfig = JSON.parse(saved);
        
        // 1. Восстанавливаем параметры через DOM
        if (userConfig.params) {
            Object.keys(userConfig.params).forEach(name => {
                let domEl = document.querySelector(`[data-param="${name}"]`);
                if (domEl) {
                    domEl.value = userConfig.params[name];
                    // Триггерим change, чтобы PageBuilder.updateParam обновил значение
                    domEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
        
        // 2. Восстанавливаем фильтры и данные таблиц
        if (userConfig.tables) {
            Object.keys(userConfig.tables).forEach(tableId => {
                let tables_arr = Tabulator.findTable('#' + tableId);
                if (tables_arr && tables_arr.length > 0) {
                    let table = tables_arr[0];
                    let savedTable = userConfig.tables[tableId];
                    if (savedTable.filters && savedTable.filters.length > 0) {
                        table.setFilter(savedTable.filters);
                    }
                    if (savedTable.data) {
                        table.setData(savedTable.data);
                    }
                }
            });
        }
        
        console.log('LoadUserConfigAction: конфигурация загружена:', userConfig);
        alert('Конфигурация пользователя загружена');

        // Логируем загрузку конфигурации пользователя
        ActionLogger.log('loadUserConfig', 'Загрузка конфигурации пользователя', {
            configName: configName
        });
    }
}
PageBuilder.addComponent(LoadUserConfigAction.TYPE, LoadUserConfigAction);
ActionRegistry.register(LoadUserConfigAction.TYPE, LoadUserConfigAction);

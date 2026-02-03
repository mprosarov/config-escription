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
    console.log("popstate event:", event)
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
    console.log("change - ",e)
    updateParam(e.target, e.target.dataset["param"], e.target.getAttribute("type"));
  });

  //получаем датасорс
  function getDS(name) {
    let find = DS.find((ds) => ds.config.id === name);

    console.log("ds sourse find: ", find);

    return find;
  }
  //Получаем объект параметра
  function getParam(name) {
    let find = pageParams.find((param) => param.getName() === name);

    console.log("getParam find: ", find);

    if (!find) throw new Error("Параметр не удалось получить.Нет такого параметра");
    return find;
  }
  //Получаем значение параметра
  function getParamValue(name) {
    let find = pageParams.find((param) => param.getName() === name);

    console.log("getParamValue find: ", find);

    if (!find) throw new Error("Значение не удалось получить.Нет такого параметра");
    return find.getValue();
  }
  //обновляем значения параметров при переключении чекбоксов и селектов
  function updateParam(el, name, type) {

    console.log("el, name, type: ", el, name, type);
    console.log(name, " ", type);

    var p = getParam(name);
    var value;
    switch (type) {
      case "checkbox":
        el.checked ? (value = 1) : (value = 0);
        break;
      case "select":
        value = el.value;
        break;
    }
    p.setParamValue(value);
    console.log('pageParams -',pageParams);
  }
  //Добавление компонента в общий список
  function addComponent(type, component) {

    console.log('addComponent params: ', type, component)

    if (components[type]) {
      throw new Error(`Компонент с таким типом уже существует. type=${type}`);
    }
    components[type] = component;
  }
  function loadWithParams(configName, params) {

    console.log("loadWithParams params: ", configName, params)

    // получаем все текущие GET параметры страницы
    let getParams = new URLSearchParams();

    console.log("new URLSearchParams: ", getParams);

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

    console.log("configName loadPageConfig: ", configName);
    console.log("params loadPageConfig: ", params);

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
      console.log('config: ', config)
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
      console.log('catch: ', error)
      loader.innerHTML = `<div class="loader-error">${error.message}</div>`;
      createdComponents = [];
    }
  }
  function create(parentElement, config) {
    console.log("parentElement create: ", parentElement);
    console.log("config create: ", config);

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
    
    console.log("createPage config", config);

    if (config["pageParams"]) {
      config.pageParams.forEach((item) => {
        var param = new PageParam(`null`, item);

        console.log("param exemplar", param);

        pageParams.push(param);
      });

      console.log("createPage pageParams: ", pageParams);

      //  console.log(pageParams)
    }
    if (config["dataSources"]) {
      config["dataSources"].forEach((item) => {
        var datasourse = PageBuilder.create(null, item);
        DS.push(datasourse);
      });
      console.log("DS:", DS);
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
    if (config["modal"]) {
      console.log("!!!if modal config: ", config["modal"])

      config["modal"].forEach((item) => {
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
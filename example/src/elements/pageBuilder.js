const PageBuilder = (function(){
//   getParam(name) - который должен возвращать экземпляр компонента pageParam по переданному имени
// getParamValue(name) - который должен возвращать занчение параметра, по имени параметра


let URL = "";
    //const URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest"
if(location.href.indexOf('file')>=0){
  URL = 'http://localhost:3000/config';
} else {
  URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest";
}

    let navbar = null;
    let domPage = null;
    //Коллекция компонентов
    let components = {};
    var pageParams = [];
    var DS = []
    //ЭКШЕНЫ
    function performAnAction(name,obj,tableID){
      //name - вид действия
      //id - идентификатор таблицы, если требуется для экшена
      //obj - объект действия
                    console.warn(name)
              console.warn(obj)
              console.warn(tableID)
      switch (name){
        case 'redirect':
            break
      }

    }
    //реагируем на изменение переключалок
    window.addEventListener('change',(e)=>{
      updateParam(e.target,e.target.dataset['param'],e.target.getAttribute('type'))
    })

    //получаем датасорс
    function  getDS(name){
      let find = DS.find(ds => ds.config.id === name);
      return find
    }
    //Получаем объект параметра
    function getParam(name){
      let find = pageParams.find(param => param.getName() === name)
      if(!find) throw new Error('Параметр не удалось получить.Нет такого параметра');
      return find;
    }
    //Получаем значение параметра
    function getParamValue(name){
      let find = pageParams.find(param => param.getName() === name)
      if(!find) throw new Error('Значение не удалось получить.Нет такого параметра');
      return find.getValue();
    }
    //обновляем значения параметров при переключении чекбоксов и селектов
    function updateParam(el,name,type){
       console.log(name, ' ', type)
      var p = getParam(name);
      var value;
      switch (type){
        case 'checkbox':
          el.checked ? value = 1 : value = 0;
          break
        case 'select':
          value = el.value
          break
      }
      p.setParamValue(value)
      console.log(pageParams)
    }

    //Добавление компонента в общий список
    function addComponent(type,component) {
        if (components[type]) {
          throw new Error(`Компонент с таким типом уже существует. type=${type}`);
        }
        components[type] = component;
    }
    function loadWithParams(configName,params){
        let getParams = new URLSearchParams();
        //getParams.set('name', configName);
        params.forEach((param) => {
          getParams.set(param.name, param.value);
        });
        window.location.search = `?${getParams.toString()}`;
    }
    // Загрузить json конфигурацию страницы с сервера по имени файла
    async function loadPageConfig(configName,params=[]){
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
        if(config["pageParams"]){
          config.pageParams.forEach(item => {
            var param = new PageParam(`null`,item)
            pageParams.push(param);
          });
        //  console.log(pageParams)
        }
        if (config["dataSources"]){
          config["dataSources"].forEach(item=>{
              var datasourse = PageBuilder.create(null,item);
              DS.push(datasourse)
          });
          console.log(DS)
        }
        if (config["navbar"]) PageBuilder.createMainNavBar(config.navbar);
        document.body.insertAdjacentHTML("beforeend", '<div class="app-page"></div>');
        domPage = document.body.lastElementChild;
        if(config["page"]){
            config.page.forEach(item => {PageBuilder.create(domPage,item);});
        }
        if (config["sidebars"]) {
            config["sidebars"].forEach(item=>{PageBuilder.create(document.body,item)})
       }
       // Все компоненты отрисованы, выполняем запросы данных
       DS.forEach(item=>{item.execute()});
    }
    //Очистить страницу
    function clear(){
        // проходим по всем элементам на странице и удаляем их
        let nodes = [...document.body.children].filter(node => node.nodeName !== "SCRIPT")
        nodes.forEach(node => node.parentElement.removeChild(node));
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
    };
})();
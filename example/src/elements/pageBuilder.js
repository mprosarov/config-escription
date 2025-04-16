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
      console.log(params)
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
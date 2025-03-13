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
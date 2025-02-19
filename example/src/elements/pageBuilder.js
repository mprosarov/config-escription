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
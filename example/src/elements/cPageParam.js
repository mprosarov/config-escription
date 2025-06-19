class PageParam {
    static TYPE = "param";
    paramValue; 
    params = [];
    constructor (parentElement, config) {
        //this.parentElement = parentElement;
        this.config = config;
        this.create();
    }
    create() {
        console.log('PageParam')
    }
    getName(){
        return this.config.name;
    };
    getValue(){
        return this.config.init.value;
    };
    addSubscribe(obj){

    };
    setParamValue(value){
        paramValue = value;
    }
// getName() - который возвращает имя компонента(свойство name из конфигурации)
// getValue() - который должен возвращать текущее значение параметра
// addSubscribe(obj) - который должен добавлять переданный экземпляр объекта в массив "подписчиков" на изменение значения компонента
// setParamValue(value) - который должен записывать переданное значение в свойство paramValue и вызвать у всех подписчиков событие
// обновления параметра.
}
PageBuilder.addComponent(PageParam.TYPE, PageParam);
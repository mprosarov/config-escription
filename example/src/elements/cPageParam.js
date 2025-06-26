class PageParam {
    static TYPE = "param";
    paramValue; 
    subscribers = []
    constructor (parentElement, config) {
        this.config = config;
        this.create();
    }
    create() {
        this.paramValue = this.config.init.value
    }
    //возвращает имя компонента(свойство name из конфигурации)
    getName(){
        return this.config.name;
    };
    //возвращает текущее значение параметра    
    getValue(){
        return this.config.init.value;
    };
    //добавляет переданный экземпляр объекта в массив "подписчиков" на изменение значения компонента    
    addSubscribe(obj){
        this.subscribers.push(obj);
      //  console.log(this)
    };
    //записывает переданное значение в свойство paramValue и вызывает
    //у всех подписчиков событие обновления параметра.    
    setParamValue(value){
        console.log('setParamValue - ',value)
        this.paramValue = value;
        this.subscribers.forEach(item => {})
     //   console.log(this)
    }
}
PageBuilder.addComponent(PageParam.TYPE, PageParam);




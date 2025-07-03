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
        this.subscribers.forEach(item => item.paramChanged(this.config.name,this.paramValue))
    }
}
PageBuilder.addComponent(PageParam.TYPE, PageParam);




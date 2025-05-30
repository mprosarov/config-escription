/*
 1. Создать класс который наследуется от класса BaseElement
 2. Создать статическое свойство компонента TYPE, которое соответствует типу(поле typr) компонента в конфигурации.
 3. Переопределить конструктор и передать в конструктор родительского класса параметры элемента.
 4. Переопределить метод создания компонента(create), в котором будет создан элемент и добавлен в родительский элемент.
*/

class DataSources {
    static TYPE = "dataSource";
    params = [];
    constructor (parentElement, config) {
        this.parentElement = parentElement;
        this.config = config;
        this.create();
        this.execute();
    }
    create() {
        let arrQueryParams = Array.from(new Set(this.config.query.match(/\{.+?\}/g).map(function(x){
            return x.slice(1,-1)
            }))
        )
        for(let i=0; i<arrQueryParams.length; i++){
            let objParam = {
                param: arrQueryParams[i],
                value:'1'
            };
            this.params.push(objParam)
        }
    }
    execute() {
        let query = this.config.query;
        for(let i=0; i<this.params.length; i++){
            query = query.replaceAll(`{${this.params[i].param}}`,this.params[i].value)
        }
        console.log(query)
    }
}
PageBuilder.addComponent(DataSources.TYPE, DataSources);
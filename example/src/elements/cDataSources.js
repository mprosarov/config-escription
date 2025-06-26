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
                value:''
            };
         
            this.params.push(objParam);
            // Подписываемся на изменение параметра
            var p = PageBuilder.getParam(objParam.param); // находим объект пареметра
            if(!p) console.error('Нет параметра');
            p.addSubscribe(this)
        }
    }
    execute() {
        for(let i=0; i<this.params.length; i++){
            this.params[i]['value'] = PageBuilder.getParamValue(this.params[i]['param'])
        }
        let query = this.config.query;
        for(let i=0; i<this.params.length; i++){
            query = query.replaceAll(`{${this.params[i].param}}`,this.params[i].value)
        }
     //   console.log(query)
    }
}
PageBuilder.addComponent(DataSources.TYPE, DataSources);
class TableTabulator extends BaseElement {
    static TYPE = 'table-tabulator';
    static URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest"
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }
    recursiveSearchColumns(data, target) {
      let values = {
        headerHozAlign: "center",
        hozAlign: "center",
        headerWordWrap: true,
      };
      if (!data[target] || data[target].length < 1) return;
      for (let i = 0; i < data[target].length; i++) {
        let child = data[target][i];
        child = Object.assign(child, values);
        this.recursiveSearchColumns(child, target);
      }
    }
    create(){
      var dataTable = async function loadDataTable(config,params){
        //--голый запрос для таблицы (без подставленных параметров) и сами параметры лежат в конфиге таблицы
        //--допустим,что есть и общие параметры, и личные для чего либо
        //--создаем 2 массива объектов параметров(PARAMS - общие, params - частные)
        //--предполагаемая структура параметра: 
        // param = {
        //   id: '', 
        //   type: 'date',
        //   name: '::pDate',
        //   value: '12/02/2024'
        // }
        var PARAMS = [];//задаем тоже где-то в общем конфиге
        let query = config.query;
        //--объединяем все параметры в общую кучу,бежим по их именам,ищем их в запросе,заменяем на значение 
        //--отправляем запрос выполняться на сервак(если я правильно понимаю) 
        //--получаем обратно результат запроса
        let allParams = [...config.params,...PARAMS];
        for(let i=0; i<allParams.length; i++){
          query = query.replace(allParams[i].name,allParams[i].value)
        }
        var response = await fetch(`${URL}/doquery`,{
          method: "POST",
          body: query
        });
        let result = await response.json();
        result = JSON.parse(result)
        
        //--должно прийти 
        // {
        //   message:'Успех',
        //   metadata: [],
        //   resultset: []
        // }
        return result.resultset
      }
      config.tdata.data = dataTable;
      let contentTable = `<div><h6>${this.config["name"]}</h6>
                              <div id="${this.config["id"]}"></div>
                          </div>`;
      this.parentElement.insertAdjacentHTML("beforeend", contentTable);

      this.recursiveSearchColumns(this.config["tdata"], "columns");
      if (this.config["indexCols"]) {
        this.config["tdata"]["data"].unshift(this.config["indexCols"]);
        this.config["tdata"]["frozenRows"] = 1;
      }
      new Tabulator(`#${this.config["id"]}`, this.config["tdata"]);
      }
}
PageBuilder.addComponent(TableTabulator.TYPE, TableTabulator);
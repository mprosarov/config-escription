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
    async create(){
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
      let query = this.config.query;
      //--объединяем все параметры в общую кучу,бежим по их именам,ищем их в запросе,заменяем на значение 
      //--отправляем запрос выполняться на сервак 
      //--получаем обратно результат запроса
      let allParams = [...this.config.params,...PARAMS];
      if(allParams.length)
        for(let i=0; i<allParams.length; i++){
          query = query.replace(allParams[i].name,allParams[i].value)
        }
      console.log('QUERY - ',query)
      console.log('PARAMS - ',allParams)
      let response = await fetch(`${TableTabulator.URL}/doquery`,{
        method: "POST",
        headers: { Accept:"text/plain","Content-Type": "text/plain" },
        body: query
      })
      let responseText = await response.text();
      let json = JSON.parse(responseText);
      config.tdata.data = json.resultset;
      console.log(config.tdata)
     
      
      //--должно прийти 
      // {
      //   message:'Успех',
      //   metadata: [],
      //   resultset: []
      // }
      console.log(config)
      
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
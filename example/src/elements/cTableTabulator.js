class TableTabulator extends BaseElement {
    static TYPE = 'table-tabulator';
    static URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest"
    static PARAMS = [];//задаем тоже где-то в общем конфиге
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

      if(this.config.query && this.config.query !== "select 1"){
        let allParams = [...this.config.params,...TableTabulator.PARAMS];
        //------------------------------------
        let query = this.config.query;
        if(allParams.length)
          for(let i=0; i<allParams.length; i++){
            query = query.replace(allParams[i].name,allParams[i].value)
          }
        console.log('QUERY - ',query)
        console.log('PARAMS - ',allParams)
          var response = await fetch(`${TableTabulator.URL}/doquery`,{
            method: "POST",
            headers: { Accept:"text/plain","Content-Type": "text/plain" },
            body: query
          })
        let responseText = await response.text();
        let json = JSON.parse(responseText);
        this.config.tdata.data = json.resultset;
        console.log(this.config.tdata)
      }    
      //--должно прийти 
      // {
      //   message:'Успех',
      //   metadata: [],
      //   resultset: []
      // }
      
      let contentTable = `<div><h6>${this.config['name']?this.config['name']:''}</h6>
                              <div id="${this.config["id"]}"></div>
                          </div>`;
      this.parentElement.insertAdjacentHTML("beforeend", contentTable);

      this.recursiveSearchColumns(this.config["tdata"], "columns");
      if (this.config["indexCols"]) {
        this.config["tdata"]["data"].unshift(this.config["indexCols"]);
        this.config["tdata"]["frozenRows"] = 1;
      }
      new Tabulator(`#${this.config["id"]}`, this.config["tdata"]);
      var table = Tabulator.findTable(`#${this.config["id"]}`)[0];
      
      var action = this.config["action"];
      
      if(!action){//пока непонятно везде будет или нет
        return
      }
      for(let i=0; i<action.length; i++){
        switch(action[i].name){
          //переадресация
          case "redirect":
            table.on(action[i].event, function(e, row){
              //e — объект события щелчка
              //row — компонент строки
              var params = TableTabulator.PARAMS; //передаваемые параметры
              if(action[i]["colparams"]){
                var cols = action[i]["colparams"];
                for(let j=0; j<cols.length; j++){
                  params.push({
                    id: cols[j],
                    name: cols[j],
                    value: row.getData()[cols[j]]
                  })
                  //params[cols[j]] = row.getData()[cols[j]]
                }
                console.log(params)
              }
              //если в объекте action указан url,то проходим по ссылке(пока новая вкладка)
              //если он пустой и его нет, то валится ошибка в консоль
              if (action[i]["url"]) {
                window.open(action[i]["url"], "_blank").focus();
              } else if (action[i]["url"] == "" && !action[i]['config']) {
                throw new Error(`не указан ни один параметр для перехода (url,config)`);
              }
              
              //если в объекте action указан config,то переадресуемся по нему
              //если нет, то по полю idconfig таблицы 
              let config;
              if(action[i]["config"]){
                config = action[i]["config"]
              } 
              else{
                config = row.getData()["idconfig"]
              } 
              if (!action[i]["newtab"]) 
                PageBuilder.loadPageConfig(config,params);
              else {
                let redirectUrl = new URL(window.location.href);
                let searchParams = new URLSearchParams(redirectUrl.search);
                searchParams.set("config", config);
                for(let j=0; j<params.length; j++){
                  //пока неизвестно name или id
                  searchParams.set(params[j]['name'], params[j]['value']);
                }
                redirectUrl.search = searchParams.toString();
                window.open(redirectUrl, "_blank").focus();
              } 
            });
            break
        }
      }
    }//end create
}
PageBuilder.addComponent(TableTabulator.TYPE, TableTabulator);
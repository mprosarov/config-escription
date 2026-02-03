class TableTabulator extends BaseElement {
    static TYPE = 'table-tabulator';
    static URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest"
    static PARAMS = [];//задаем тоже где-то в общем конфиге
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }

    recursiveSearchColumns(data, target) {

      //console.log("recursiveSearchColumns data: ", data);
      //console.log("recursiveSearchColumns target: ", target);
      //debugger
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
      const ds = PageBuilder.getDS(this.config.datasourse);
      const config = this.config;
      const parentElement = this.parentElement;

      console.log('ds tabulator: ', ds);
      console.log("tabulator this.config: ", this.config);

      ds.addSubscribe(this)
      this.config["tdata"].data = [];
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
      this.tableObj = new Tabulator(`#${this.config["id"]}`, this.config["tdata"]);

      console.log("Tabulator: ", Tabulator);
      console.log("this.tableobj: ", this.tableObj)

      //  console.log(this.tableObj.setData,'asa');
      //  var table = Tabulator.findTable(`#${this.config["id"]}`)[0];
      let table = this.tableObj;
      //console.log(this.tableObj.on("tableBuilt", function(){console.log("THE TABLE IS READY"); debugger}))
      this.tableObj.on("tableBuilt", function(){
        if (config.actions){
          //PageBuilder.create(parentElement, this.config.actions)
          new BaseAction(parentElement, config.actions, table);
        }
      })
      /*if(!this.config["action"]){//пока непонятно везде будет или нет
        return
      }
      for(let i=0; i<this.config["action"].length; i++){
        const currentAction = {...this.config["action"][i]};
        this.tableObj.on(currentAction.event, (e, row) => {
          this.runAction(currentAction, e, row)
        });
      }*/
    }//end create
    /*runAction(obj,e,row){
      //e — объект события щелчка
      //row — компонент строки

      let tableParams = [];
      // Собираем параметры из компонента
      if(obj.params?.tableParams){
        obj.params.tableParams.forEach(p=>{
          tableParams.push({
            name:p.pName,
            value:row.getData()[p.field]
          });
        })
      }

      console.log("tableParams in runaction: ", tableParams);

      if (obj.name == "redirect") {
        if (!obj["config"] && !obj["url"]) {

          console.log("Inside check runaction row.getData: ", row.getData()["idconfig"]);
          console.log("Inside check runaction obj['config']: ", obj["config"])
          console.log("Inside check runaction obj['url']: ", obj["url"])
          
          if (!row.getData()["idconfig"]) throw new Error("Не удалось определить имя или url для перехода");
          obj["config"] = row.getData()["idconfig"];
        }
        super.actionRedirect(obj, tableParams);
      }
    }*/
    updatedDS(data){

      console.log('this.config.indexCols', this.config.indexCols);

      if (this.config["indexCols"]) {
        data.unshift(this.config["indexCols"]);
      }

      console.log("tabulator new data from ds: ", data)

      if (!this.tableObj.initialized){
          this.tableObj.on("tableBuilt", function () {
            this.setData(data);
            this.off("tableBuilt");
          });
          return;
      }
      this.tableObj.setData(data);
    }
}
PageBuilder.addComponent(TableTabulator.TYPE, TableTabulator);
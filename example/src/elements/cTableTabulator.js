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
    create(){
      const ds = PageBuilder.getDS(this.config.datasourse);
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
    //  console.log(this.tableObj.setData,'asa');
    //  var table = Tabulator.findTable(`#${this.config["id"]}`)[0];

      if(!this.config["action"]){//пока непонятно везде будет или нет
        return
      }
      for(let i=0; i<this.config["action"].length; i++){
        PageBuilder.performAnAction(this.config["action"][i]["name"],this.config["action"][i], this.config["id"])
      }
    }//end create

    updatedDS(data){
      //console.log('updatedDS',data);
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
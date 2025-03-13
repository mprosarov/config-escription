class TableTabulator extends BaseElement {
    static TYPE = 'table-tabulator';
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
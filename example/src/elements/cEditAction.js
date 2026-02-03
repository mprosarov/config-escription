class EditAction extends BaseAction{
  static TYPE = "tabulatorEditAction";
  constructor(parentElement, config, target) {
    super(parentElement, config, target);
    this.create();
  }

  create() {
 

    /*console.log("EditAction parentElement: ", this.parentElement)
    console.log("EditAction config: ", this.config)
    console.log("EditAction target: ", this.target)

    console.log("Table prototype methods:", Object.getPrototypeOf(this.target));
    console.log("Has columnManager?", this.target.columnManager);
    console.log("Table element innerHTML:", document.querySelector(`#${this.config.id}`)?.innerHTML);

    console.log("target.getColumnDefinitions(): ", this.target.getColumnDefinitions())
    console.log("target.getData(): ", this.target.getData());
    console.log("")
    */
    let columnsDefs = this.target.getColumnDefinitions();
    let columnsId = [];

    /*for (let colId of this.config.target.columns){

      console.log("colId: ", colId.toString());

      columnsId.push(this.target.getColumn(colId.toString()).getDefinition())

    }*/
    console.log("columns id config:", this.config.target.columns)
    this.updateDefs(columnsDefs, this.config.target.columns);
    this.target.setColumns(columnsDefs)
    //this.recursiveColumnUpdate(columnsComponents, columnsId, this.target);

    console.log("columnId: ",columnsId);

    //let htmlTable = table.getHtml();
    //console.log("target.getHtml: ", htmlTable);
  }

  updateDefs(definitions, columnsId){

      console.log("updateDefs start defs:", definitions);
      console.log("updateDef colIds: ", columnsId);

      for (let def of definitions) {
            console.log("def.field:", def.field)
            console.log("isInclude: ", columnsId.includes(def.field));

            if (def.columns) {
                //если это группа колонок, рекурсивно обходим
                this.updateDefs(def.columns, columnsId);
            } else if (def.field && columnsId.includes(def.field)) {
                //нашли нужную колонку - обновляем
                def.editor = "input";
                def.editorParams = {
                    elementAttributes: {
                        maxlength: "10"
                    }
                };
                console.log("updated column definition 4:", def);
            }
      }
  }

  /*recursiveColumnUpdate(config, columnsId, table){
    console.log("table in recUpd: ", table)
    console.log("recursiveColumnGathering config: ", config);
    console.log("table.getColumns: ", table.getColumn("4"));
    console.log("table.getColumns 4s field: ", table.getColumn("4").getField());

    //table.getColumn("4").updateDefinition({editor: "input"})
    table.updateColumnDefinition("4", {editor: "input"});

    for (let i = 0; i < config.length; i++){
      if (config[i].field){
        columnsId.push(config[i].field)
        if (config[i].field == 4){
          columnsId.push(config[i].field)
          table.updateColumnDefinition(4, {editor: "input"});
        }
      }
      else 
        this.recursiveColumnUpdate(config[i].columns, columnsId, table)
    }
  }*/
}
PageBuilder.addComponent(EditAction.TYPE, EditAction);

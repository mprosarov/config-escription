const CreateTable = (function (){

    function create(parent, config) {
        contentTable = `<h6>${config["name"]}</h6>
                            <div id="${config["id"]}"></div>`;
        parent.insertAdjacentHTML("beforeend", contentTable);

        recursiveSearchColumns(config["tdata"], "columns");
        if (config["indexCols"]) {
            config["tdata"]["data"].unshift(config["indexCols"]);
            config["tdata"]["frozenRows"] = 1;
        }
        var table = new Tabulator(`#${config["id"]}`, config["tdata"]);
    }
    function recursiveSearchColumns(data, target) {
      let values = {
        headerHozAlign: "center",
        hozAlign: "center",
        headerWordWrap: true,
      };
      if (!data[target] || data[target].length < 1) return;
      for (let i = 0; i < data[target].length; i++) {
        let child = data[target][i];
        child = Object.assign(child, values);
        recursiveSearchColumns(child, target);
      }
    }
    return {
      create,
    };
})();
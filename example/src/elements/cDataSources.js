class DataSources {
  static TYPE = "dataSource";
  params = [];
  subscribes = [];
  constructor(parentElement, config) {
    this.parentElement = parentElement;
    this.config = config;
    this.create();
  }
  create() {
    let arrQueryParams = Array.from(
      new Set(
        this.config.query.match(/\{.+?\}/g).map(function (x) {
          return x.slice(1, -1);
        })
      )
    );

    for (let i = 0; i < arrQueryParams.length; i++) {
      let objParam = {
        param: arrQueryParams[i],
        value: "",
      };

      this.params.push(objParam);
      // Подписываемся на изменение параметра
      var p = PageBuilder.getParam(objParam.param); // находим объект пареметра
      if (!p) console.error("Нет параметра");
      p.addSubscribe(this);
    }
  }
  paramChanged(name, value) {
    this.execute();
  }
  fetchQuery(query) {
  //  console.log("fetchFIC", query);
    let test = [];
    for (let i = 0; i < 10; i++) {
      test.push({
        idconfig: i%2==0?"oef":"check_list",
        2: Date.now(),
        3: Date.now(),
        4: Date.now(),
        5: Date.now(),
        6: Date.now(),
        7: Date.now(),
        8: Date.now(),
        9: Date.now(),
        10: Date.now(),
      });
    }

  //------------------------------------------
    // let URL = "";
    // if (location.href.indexOf("file") >= 0) {
    //   URL = "http://localhost:3000/config";
    // } else {
    //   URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest";
    // }
    // var resp = fetch(`${URL}/doquery`,{
    //     method: "POST",
    //     headers: { Accept:"text/plain","Content-Type": "text/plain" },
    //     body: query
    //   })
    // let respText = resp.text();
    // let json = JSON.parse(respText);
    // return json.resultset;
  //---------------------------------------------  
    return test;
    
  }
  execute() {
    for (let i = 0; i < this.params.length; i++) {
      this.params[i]["value"] = PageBuilder.getParamValue(this.params[i]["param"]);
    }
    let query = this.config.query;
    for (let i = 0; i < this.params.length; i++) {
      query = query.replaceAll(`{${this.params[i].param}}`, this.params[i].value);
    }
    // Отслыем запрос на сервер и оповещаем подписчиков
    let result = this.fetchQuery(query); // TODO: запрос на сервер - заменить на fetch
    this.subscribes.forEach((item) => {
      item.updatedDS(result);
    });
    //   console.log(query)
  }
  addSubscribe(obj) {
    if (!this.subscribes.includes(obj)) {
      this.subscribes.push(obj);
    }
  }
}
PageBuilder.addComponent(DataSources.TYPE, DataSources);
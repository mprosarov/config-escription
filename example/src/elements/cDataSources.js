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
    let matches = this.config.query.match(/\{.+?\}/g);
    let arrQueryParams = [];
    if (matches) {
      arrQueryParams = Array.from(
        new Set(
          matches.map(function (x) {
            return x.slice(1, -1);
          })
        )
      );
    }

    console.log("datasources set to array: ", arrQueryParams);

    for (let i = 0; i < arrQueryParams.length; i++) {
      let objParam = {
        param: arrQueryParams[i],
        value: "",
      };

      this.params.push( );
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
  //------------------------------------------
    let URL = "";
    if (location.href.indexOf("file") >= 0) {
          let test = {
      "metadata": [
          {"colname": "idconfig","coltype": "string","colindex": 0},
          {"colname": "2","coltype": "date","colindex": 1},
          {"colname": "3","coltype": "date","colindex": 2},
          {"colname": "4","coltype": "date","colindex": 3},
          {"colname": "5","coltype": "date","colindex": 4},
          {"colname": "6","coltype": "string","colindex": 5},
          {"colname": "7","coltype": "numeric","colindex": 6},
          {"colname": "8","coltype": "date","colindex": 7},
          {"colname": "9","coltype": "date","colindex": 8},
          {"colname": "10","coltype": "date","colindex": 9},
      ],
      "resultset": []
    };
    for (let i = 0; i < 20; i++) {
      test.resultset.push({
        idconfig: i%3==0?"calculation":i%2==0?"oef":"check_list",
        2: Date.now(),
        3: Date.now(),
        4: Date.now(),
        5: Date.now(),
        6: `Сейчас: ${Date.now()}`,
        7: 4 * i,
        8: Date.now(),
        9: Date.now(),
        10: Date.now(),
      });
    }
    return test;
    } else {
      URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest";
    }
    var resp = fetch(`${URL}/doquery`,{
        method: "POST",
        headers: { Accept:"text/plain","Content-Type": "text/plain" },
        body: query
      })
    let respText = resp.text();
    let json = JSON.parse(respText);
    return json.resultset;
  //---------------------------------------------  
    
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

    // Логируем загрузку данных
    var rowCount = result && result.resultset ? result.resultset.length : 0;
    ActionLogger.log('dataLoad', 'Загрузка данных: ' + (this.config.id || 'unknown') + ' (' + rowCount + ' строк)', {
      datasourceId: this.config.id || 'unknown',
      rowCount: rowCount,
      query: query
    });
  }
  addSubscribe(obj) {
    if (!this.subscribes.includes(obj)) {
      this.subscribes.push(obj);
    }
  }
}
PageBuilder.addComponent(DataSources.TYPE, DataSources);
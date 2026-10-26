class SaveUserConfigAction extends BaseAction {
  static TYPE = "saveUserConfigAction";

  constructor(parentElement, config, target) {
    super(parentElement, config, target);
    this.init();
  }

  init() {
    const trigger = this.config.trigger || "click";
    this.target.addEventListener(trigger, (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.execute();
    });
  }

  findTablesRecursive(type, config) {
    const walk = (node) => {
      if (node === null || node === undefined) return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (typeof node === "object") {
        if (node.type === type) {
          let table = Tabulator.findTable("#" + node.id)[0];
          node.tdata.columns = table.getColumnLayout();
        }
        for (const key in node) {
          walk(node[key]);
        }
      }
    };
    walk(config);
    return config;
  }

  execute() {
    let configName =
      new URLSearchParams(window.location.search).get("config") || "index";
    let config = PageBuilder.getPageConfig();
    for (const p of config.pageParams) {
      let val = PageBuilder.getParamValue(p.id);
      val ? (p.init.value = val) : null;
    }
    config = this.findTablesRecursive("table-tabulator", config);

    // TODO: table.getFilters()

    // // Сохраняем в localStorage браузера (временное решение)
    // // В будущем: POST на сервер /saveUserConfig
    // window.localStorage.setItem(
    //   `userConfig_${configName}`,
    //   JSON.stringify(userConfig),
    // );

    // console.log("SaveUserConfigAction: конфигурация сохранена:", userConfig);
    alert("Конфигурация пользователя сохранена");

    // Логируем сохранение конфигурации пользователя
    ActionLogger.log("saveUserConfig", "Сохранение конфигурации пользователя", {
      configName: configName,
      userConfig: config,
    });
  }
}
PageBuilder.addComponent(SaveUserConfigAction.TYPE, SaveUserConfigAction);
ActionRegistry.register(SaveUserConfigAction.TYPE, SaveUserConfigAction);

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
    let tables = [];
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
          tables.push({
            id: node.id,
            headers: table.getColumnLayout(),
            filters: table.getFilters(),
          });
        }
        for (const key in node) {
          walk(node[key]);
        }
      }
    };
    walk(config);
    return tables;
  }

  async execute() {
    const configName =
      new URLSearchParams(window.location.search).get("config") || "index";

    const config = PageBuilder.getPageConfig();
    const params = {};
    for (const p of config.pageParams) {
      params[p.id] = PageBuilder.getParamValue(p.id);
    }
    console.warn("params", params);
    const tables = this.findTablesRecursive("table-tabulator", config);
    const userConfig = { params, tables, savedAt: new Date().toISOString() };

    try {
      const baseUrl = PageBuilder.getAPIUrl();
      const url = `${baseUrl}/saveuserinterfaceconfig?scode=${encodeURIComponent(configName)}&susername=${encodeURIComponent(PageBuilder.getUserName())}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { Accept: "text/plain", "Content-Type": "text/plain" },
        body: JSON.stringify(userConfig),
        // credentials: "include",       //  может понадобиться
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }
      const respText = await resp.text();
      ActionLogger.log(
        "saveUserConfig",
        "Сохранение конфигурации пользователя",
        { configName, userConfig },
      );
    } catch (e) {
      console.error("Ошибка сохранения:", e);
      ActionLogger.log("error", "Ошибка сохранения конфигурации", {
        configName,
        errorMessage: e.message,
      });
      alert("Не удалось сохранить конфигурацию: " + e.message); // или другой UI-механизм
      return;
    }
  }
}
PageBuilder.addComponent(SaveUserConfigAction.TYPE, SaveUserConfigAction);
ActionRegistry.register(SaveUserConfigAction.TYPE, SaveUserConfigAction);

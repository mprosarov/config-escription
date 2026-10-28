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
    const tables = this.findTablesRecursive("table-tabulator", config);
    const userConfig = { params, tables, savedAt: new Date().toISOString() };

    const API_URL = `${window.location.href}/rest/krb`;
    // заглушка, которую нужно заменить на авторизацию реального пользака
    const getUserName = () => {
      return window.currentUser || "anonymous";
    };
    try {
      const url =
        `${API_URL}/saveuserinterfaceconfig` +
        `?scode=${encodeURIComponent(configName)}` +
        `&susername=${encodeURIComponent(getUserName())}`;

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
      console.log("SaveUserConfigAction: сервер сохранил:", respText);

      // Не знаю, понадобится ли
      window.localStorage.setItem(
        `userConfig_${configName}`,
        JSON.stringify(userConfig),
      );
    } catch (e) {
      console.error("Ошибка сохранения:", e);
      ActionLogger.log("error", "Ошибка сохранения конфигурации", {
        configName,
        errorMessage: e.message,
      });
      alert("Не удалось сохранить конфигурацию: " + e.message); // или другой UI-механизм
      console.warn(userConfig);
      return;
    }

    ActionLogger.log("saveUserConfig", "Сохранение конфигурации пользователя", {
      configName,
      userConfig,
    });
  }
}
PageBuilder.addComponent(SaveUserConfigAction.TYPE, SaveUserConfigAction);
ActionRegistry.register(SaveUserConfigAction.TYPE, SaveUserConfigAction);

class LoadUserConfigAction extends BaseAction {
  static TYPE = "loadUserConfigAction";

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

  async execute() {
    let configName =
      new URLSearchParams(window.location.search).get("config") || "index";
    PageBuilder.loadPageConfig(configName);
  }
}
PageBuilder.addComponent(LoadUserConfigAction.TYPE, LoadUserConfigAction);
ActionRegistry.register(LoadUserConfigAction.TYPE, LoadUserConfigAction);

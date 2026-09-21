class ResetAction extends BaseAction {
    static TYPE = 'resetAction';
    
    constructor(parentElement, config, target) {
        super(parentElement, config, target);
        this.init();
    }
    
    init() {
        const trigger = this.config.trigger || 'click';
        this.target.addEventListener(trigger, (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.execute();
        });
    }
    
    execute() {
        // Получаем имя текущего конфига из URL
        let configName = new URLSearchParams(window.location.search).get('config') || 'index';

        // Логируем сброс страницы
        ActionLogger.log('reset', 'Сброс страницы: ' + configName, {
            configName: configName
        });

        // Перезагружаем страницу с этим конфигом (сброс до сохраненного состояния)
        PageBuilder.loadPageConfig(configName);
    }
}
PageBuilder.addComponent(ResetAction.TYPE, ResetAction);
ActionRegistry.register(ResetAction.TYPE, ResetAction);
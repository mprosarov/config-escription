class LoadUserConfigAction extends BaseAction {
    static TYPE = 'loadUserConfigAction';
    
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
        let configName = new URLSearchParams(window.location.search).get('config') || 'index';
        
        // Загружаем из localStorage браузера (временное решение)
        // В будущем: GET /loadUserConfig?name=...
        let saved = window.localStorage.getItem(`userConfig_${configName}`);
        
        if (!saved) {
            alert('Сохраненная конфигурация не найдена');
            return;
        }
        
        let userConfig = JSON.parse(saved);
        
        // 1. Восстанавливаем параметры через DOM
        if (userConfig.params) {
            Object.keys(userConfig.params).forEach(name => {
                let domEl = document.querySelector(`[data-param="${name}"]`);
                if (domEl) {
                    domEl.value = userConfig.params[name];
                    // Триггерим change, чтобы PageBuilder.updateParam обновил значение
                    domEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
        
        // 2. Восстанавливаем фильтры и данные таблиц
        if (userConfig.tables) {
            Object.keys(userConfig.tables).forEach(tableId => {
                let tables_arr = Tabulator.findTable('#' + tableId);
                if (tables_arr && tables_arr.length > 0) {
                    let table = tables_arr[0];
                    let savedTable = userConfig.tables[tableId];
                    if (savedTable.filters && savedTable.filters.length > 0) {
                        table.setFilter(savedTable.filters);
                    }
                    if (savedTable.data) {
                        table.setData(savedTable.data);
                    }
                }
            });
        }
        
        console.log('LoadUserConfigAction: конфигурация загружена:', userConfig);
        alert('Конфигурация пользователя загружена');

        // Логируем загрузку конфигурации пользователя
        ActionLogger.log('loadUserConfig', 'Загрузка конфигурации пользователя', {
            configName: configName
        });
    }
}
PageBuilder.addComponent(LoadUserConfigAction.TYPE, LoadUserConfigAction);
ActionRegistry.register(LoadUserConfigAction.TYPE, LoadUserConfigAction);
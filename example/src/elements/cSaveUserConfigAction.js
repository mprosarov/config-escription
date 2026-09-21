class SaveUserConfigAction extends BaseAction {
    static TYPE = 'saveUserConfigAction';
    
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
        
        // 1. Собираем значения всех pageParams через data-атрибуты в DOM
        let params = {};
        let paramElements = document.querySelectorAll('[data-param]');
        paramElements.forEach(el => {
            params[el.dataset.param] = el.value;
        });
        
        // 2. Собираем фильтры и данные таблиц
        let tables = {};
        let tableContainers = document.querySelectorAll('.table-tabulator-content > div[id]');
        tableContainers.forEach(container => {
            if (container.id) {
                let tables_arr = Tabulator.findTable('#' + container.id);
                if (tables_arr && tables_arr.length > 0) {
                    let table = tables_arr[0];
                    tables[container.id] = {
                        data: table.getData(),
                        filters: table.getFilters()
                    };
                }
            }
        });
        
        let userConfig = { params, tables, savedAt: new Date().toISOString() };
        
        // Сохраняем в localStorage браузера (временное решение)
        // В будущем: POST на сервер /saveUserConfig
        window.localStorage.setItem(`userConfig_${configName}`, JSON.stringify(userConfig));
        
        console.log('SaveUserConfigAction: конфигурация сохранена:', userConfig);
        alert('Конфигурация пользователя сохранена');

        // Логируем сохранение конфигурации пользователя
        ActionLogger.log('saveUserConfig', 'Сохранение конфигурации пользователя', {
            configName: configName,
            userConfig: userConfig
        });
    }
}
PageBuilder.addComponent(SaveUserConfigAction.TYPE, SaveUserConfigAction);
ActionRegistry.register(SaveUserConfigAction.TYPE, SaveUserConfigAction);
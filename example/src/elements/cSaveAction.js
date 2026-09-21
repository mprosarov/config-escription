class SaveAction extends BaseAction {
    static TYPE = 'saveAction';
    
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
        // Собираем данные из всех таблиц Tabulator на странице
        let allTableData = {};
        let tableContainers = document.querySelectorAll('.table-tabulator-content > div[id]');
        
        tableContainers.forEach(container => {
            if (container.id){
                let tables = Tabulator.findTable('#' + container.id);
                if(tables && table.length > 0){
                    allTableData[container.id] = tables[0].getData();
                }
            }
        })
        
        console.log('SaveAction: данные таблиц для сохранения:', allTableData);
        
        // TODO: POST на сервер /saveData (когда будет готов Java API)
        // let configName = new URLSearchParams(window.location.search).get('config') || 'index';
        // fetch('/saveData', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ configName: configName, data: allTableData })
        // });
        
        alert('Данные сохранены');

        // Логируем сохранение данных
        let configName = new URLSearchParams(window.location.search).get('config') || 'index';
        ActionLogger.log('save', 'Сохранение данных в БД', {
            configName: configName,
            data: allTableData
        });
    }
}
PageBuilder.addComponent(SaveAction.TYPE, SaveAction);
ActionRegistry.register(SaveAction.TYPE, SaveAction);
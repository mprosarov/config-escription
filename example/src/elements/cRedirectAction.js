class RedirectAction extends BaseAction {
    static TYPE = "redirectAction";
    
    constructor(parentElement, config, target) {
        super(parentElement, config, target);
        this.create();
    }

    create() {
        console.log("RedirectAction config:", this.config);
        console.log("RedirectAction target:", this.target);
        
        // Получаем конфигурацию redirect из this.config
        const redirectConfig = this.config;
        
        if (!redirectConfig.trigger) {
            console.error("RedirectAction: Не указан trigger в конфигурации");
            return;
        }
 
        this.setupTrigger(redirectConfig);
    }

    setupTrigger(config) {
        const trigger = config.trigger;
        
        switch(trigger) {
            case 'rowDblClick':
                this.setupRowDblClickTrigger(config);
                break;
            case 'rowClick':
                console.log("trigger click for redirect: ")
                break;
            case 'buttonClick':
                console.log("trigger button click for redirect: ")
                break;
            default:
                console.warn(`RedirectAction: Неизвестный триггер: ${trigger}`);
        }
    }

    setupRowDblClickTrigger(config) {
        if (!this.target || typeof this.target.on !== 'function') {
            console.error("RedirectAction: target не является таблицей Tabulator");
            return;
        }
        
        this.target.on('rowDblClick', (e, row) => {
            this.handleRedirect(e, row, config);
        });
    }

    handleRedirect(e, row, config) {
        e?.stopPropagation();
        
        const params = this.collectParams(row, config);

        console.log('tabulator row', row);

        this.executeRedirect(config, params, row);
    }

    collectParams(row, config) {
        const params = [];
        
        if (row && config.params?.tableParams) {
            config.params.tableParams.forEach(paramConfig => {
                const rowData = row.getData();
                params.push({
                    name: paramConfig.pName,
                    value: rowData[paramConfig.field]
                });
            });
        }
        
        if (config.params?.pageParams) {
            config.params.pageParams.forEach(paramName => {
                params.push({
                    name: paramName,
                    value: PageBuilder.getParamValue(paramName)
                });
            });
        }
        
        console.log("RedirectAction собранные параметры:", params);
        return params;
    }

    executeRedirect(config, params = [], row) {
        if (config.url) {
            this._redirectToURL(config, params);
        } else if (config.config) {
            this._redirectToConfig(config, params);
        } else {
            //TODO получение конфига из строки
            const rowConfig = this.getConfigFromRow(row);
            console.log("rowConfig: ", rowConfig);
            if (rowConfig){
                config.config = rowConfig;
                this._redirectToConfig(config, params)
            } else {
                console.error("RedirectAction: не указан url или конфиг для redirect");
            }

        }
    }

    getConfigFromRow(row) {
        console.log("getConfigFromRow row:", row.getData()["idconfig"]);
        //TODO: метод определяющий конфиг по строке таблицы
        return row.getData()["idconfig"];
    }

    _redirectToConfig(config, params) {
        if (!config.newtab) {
            PageBuilder.loadWithParams(config.config, params);
        } else {
            let redirectUrl = new URL(window.location.href);
            let searchParams = new URLSearchParams(redirectUrl.search);
            
            searchParams.set("config", config.config);
            
            params.forEach(param => {
                searchParams.set(param.name, param.value);
            });
            
            redirectUrl.search = searchParams.toString();
            window.open(redirectUrl, "_blank").focus();
        }
    }

    _redirectToURL(config, params) {
        console.log("RedirectAction: Редирект по URL", config.url);
        //TODO: Реализовать логику редиректа по URL с параметрами
    }
}

PageBuilder.addComponent(RedirectAction.TYPE, RedirectAction);
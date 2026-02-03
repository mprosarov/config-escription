class ContextMenuAction extends BaseAction {
    static TYPE = "contextMenuAction";
    
    constructor(parentElement, config, target) {
        super(parentElement, config, target);
        
        // Загружаем CSS для контекстного меню
        this.loadStyles();
        this.create();
    }

    loadStyles() {
        if (!document.getElementById('context-menu-styles')) {
            const style = document.createElement('style');
            style.id = 'context-menu-styles';
            style.textContent = `
                .custom-context-menu {
                    position: fixed;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    z-index: 1000;
                    min-width: 180px;
                    padding: 4px 0;
                }
                
                .context-menu-item {
                    padding: 8px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.2s;
                }
                
                .context-menu-item:hover {
                    background-color: #f0f0f0;
                }
                
                .context-menu-item.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .context-menu-separator {
                    height: 1px;
                    background: #ddd;
                    margin: 4px 0;
                }
                
                .context-menu-icon {
                    width: 16px;
                    text-align: center;
                }
            `;
            document.head.appendChild(style);
        }
    }

    create() {
        console.log("ContextMenuAction started with config:", this.config);

        const menuConfig = this.getMenuConfig();
        this.setupTriggers(menuConfig);
    }

    getMenuConfig() {
        //берем конфиг из this.config или используем дефолтный
        const defaultConfig = {
            items: [
                {
                    label: 'Строка 1',
                    icon: 'pencil',
                    action: 'testAction1',
                },
                {
                    label: 'Строка 2',
                    icon: 'arrow-up',
                    action: 'testAction2'
                }
            ]
        };
        
        //будет ли конфиг в меню? Обсудить
        return this.config.menu || defaultConfig;
    }

    setupTriggers(menuConfig) {
        const trigger = this.config.trigger || 'rightClick';
        
        switch(trigger) {
            case 'rightClick':
                this.setupRightClickTrigger(menuConfig);
                break;
            case 'click':
                console.log("setup triggers click")
                break;
            default:
                console.warn(`Неизвестный триггер: ${trigger}`);
        }
    }

    setupRightClickTrigger(menuConfig) {
        if (this.parentElement) {
            this.parentElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showMenu(e, null, menuConfig);
            });
        }
    }

    showMenu(e, row, menuConfig) {
        const menu = this.createMenu(menuConfig.items, row);

        this.positionMenu(menu, e);
        document.body.appendChild(menu);
        
        this.setupMenuClose(menu);
    }

    createMenu(items, contextData) {
        const menu = document.createElement('div');
        menu.className = 'custom-context-menu';
        
        items.forEach(itemConfig => {
          const item = this.createMenuItem(itemConfig, contextData);
          menu.appendChild(item);
        });
        
        return menu;
    }

    createMenuItem(config, contextData) {
        const item = document.createElement('div');
        item.className = `context-menu-item ${config.className || ''}`;

        item.innerHTML = `
            <span>${config.label}</span>
            ${config.shortcut ? `<span style="margin-left: auto; opacity: 0.6;">${config.shortcut}</span>` : ''}
        `;
        
        if (!config.disabled) {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.executeAction(config.action, contextData, config);
            });
        }
        
        return item;
    }

    positionMenu(menu, event) {
        console.log("positionMenu menu:", menu)
        console.log("positionMenu event:", event)

        const x = event.pageX;
        const y = event.pageY;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;
        
        //корректируем позицию, чтобы меню не выходило за границы окна
        let left = x;
        let top = y;
        
        if (x + menuWidth > windowWidth) {
            left = windowWidth - menuWidth - 10;
        }
        
        if (y + menuHeight > windowHeight) {
            top = windowHeight - menuHeight - 10;
        }
        
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
    }

    setupMenuClose(menu) {
      console.log("setupMenuClose: ", menu)
        const closeMenu = () => {
            if (menu && menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        };
        
        document.addEventListener('click', closeMenu);
        
        menu.addEventListener('remove', () => {
            document.removeEventListener('click', closeMenu);
        });
    }

    executeAction(action, contextData, config) {
      console.log(`Выполняется действие: ${action}`, contextData);
    }
}
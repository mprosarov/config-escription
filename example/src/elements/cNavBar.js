class NavBar {
    static TYPE = 'navbar';
    menuBlock = null;
    buttonsBlock = null;
    titleBlock = null;
    constructor (parentElement, config) {
        this.parentElement = parentElement;
        this.config = config;
        this.create();
    }
    create() {
        // Если указана позиция left, заголовок будет слева иначе всегда справа
        let positionTitle = (this.config['titlePosition'] == 'left' ? '-reverse' : '');
        let positionMenu = (this.config['menuPosition'] == 'bottom' ? '-reverse' : '');
        let navbarHTML = `<nav class="navbar navbar-expand-sm navbar-light bg-light navbar-light shadow">
                            <div class="container-fluid flex-row${positionTitle}">
                                <div class="collapse navbar-collapse">
                                    <div style="display:flex;align-items: start;flex-direction:column${positionMenu}">
                                        <div data-menu class="navbar-nav mr-auto mb-2 mb-sm-0"></div>
                                        <div data-buttons class="navbar-nav mr-auto mb-2 mb-sm-0"></div>
                                    </div>
                                </div>
                                <div data-title class="navbar-brand"></div>
                            </div>
                        </nav>`;
        this.parentElement.insertAdjacentHTML('beforeend', navbarHTML);
        this.menuBlock = this.parentElement.lastElementChild.querySelector("[data-menu]");
        this.buttonsBlock = this.parentElement.lastElementChild.querySelector("[data-buttons]");
        this.titleBlock = this.parentElement.lastElementChild.querySelector("[data-title]");
        if(this.config.items && this.config.items.length) {
            this.config.items.forEach(item => {
                switch (item.type) {
                    case Menu.TYPE:
                        PageBuilder.create(this.menuBlock, item);
                        break;
                    case Button.TYPE:
                        PageBuilder.create(this.buttonsBlock, item);
                        break;
                    default:
                        console.warn(`Неизвестный тип компонента: ${item.type}`);
                        break;
                }
            });
        }
   }
}
PageBuilder.addComponent(NavBar.TYPE, NavBar);
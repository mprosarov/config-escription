class ModalAction extends BaseAction {
    static TYPE = 'modalAction';
    
    constructor(parentElement, config, target) {
        console.log("ModalAction config: ",config)
        super(parentElement, config, target);
        this.create();
    }

    create() {
        const eventName = this.config.trigger || 'click';
        
        //проверяем, является ли target DOM элементом (кнопкой)
        if (this.target && this.target.addEventListener) {
            //для кнопок используем обычный click
            if (eventName === 'click' || eventName === 'rowClick') {
                this.target.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openModal(e);
                });
            }
        }
        //проверяем, является ли target объектом Tabulator
        else if (this.target && typeof this.target.on === 'function') {
            // Для Tabulator используем rowClick
            if (eventName === 'rowClick' || eventName === 'click') {
                this.target.on('rowClick', (e, row) => {
                    this.openModal(e, row);
                });
            }
        }
        //если target указан как строка "parentElement"
        else if (this.config.target === 'parentElement' && this.parentElement) {
            this.parentElement.addEventListener(eventName, (e) => {
                this.openModal(e);
            });
        }
        else {
            console.warn("ModalAction: Cannot attach event listener to target", this.target);
        }
    }

    openModal(event, row = null) {
        let content = '';
        const config = this.config;
        console.log("OPEN MODAL CHECK config", config);
        console.log("OPEN MODAL CHECK row", row);
        
        //определяем контент в зависимости от флага
        if (config.contentType === 'tableRow' && row) {
            console.log("OPEN MODAL CHECK CONTENTTYPE TABLE ROW")

            //если клик по строке таблицы - выводим данные строки
            const rowData = row.getData ? row.getData() : row;

            content = this.formatTableRowData(rowData, config);
        } else if (config.contentType === 'text') {
            console.log("OPEN MODAL CHECK CONTENTTYPE TEXT")
            if (config.tableID){ 
                let table = Tabulator.findTable(`#${config.tableID}`)[0]; 
                console.log("OPEN MODAL CHECK findTable", table);
                console.log("OPEN MODAL Column definitions", table.getColumnDefinitions());
                console.log("OPEN MODAL CHECK getSelected Data", table.getSelectedData());
            }
            //выводим текст
            content = `<p>${config.content || 'Нет содержимого'}</p>`;

        } else if (config.content) {
            console.log("OPEN MODAL CHECK CONTENTTYPE CONTENT")

            //любое другое содержимое
            content = config.content;
        }
        
        //создаем или находим модальное окно
        let modalElement = null;
        
        //сначала ищем по modalId из конфига
        if (config.modalId) {
            modalElement = document.getElementById(config.modalId);
        }
        
        //если не нашли, ищем по классу
        if (!modalElement) {
            modalElement = document.querySelector('.vnf-modal-overlay');
        }
        
        //если все еще нет, создаем новое
        if (!modalElement) {
            modalElement = this.createModal();
        }
        
        //получаем экземпляр модального окна
        const modalInstance = this.getModalInstance(modalElement.id);
        
        if (modalInstance) {
            //устанавливаем заголовок
            if (config.title) {
                modalInstance.setTitle(config.title);
            } else if (config.contentType === 'tableRow') {
                modalInstance.setTitle("Детали записи");
            } else {
                modalInstance.setTitle("Информация");
            }
            
            //устанавливаем контент
            modalInstance.setContent(content);
            
            //открываем
            modalInstance.open();
        } else {
            console.error("Modal instance not found!");
        }
    }

    formatTableRowData(rowData, config) {
        let html = '<div class="table-row-details">';
        
        if (config.displayAllColumns) {
            //выводим все колонки
            Object.keys(rowData).forEach(key => {
                html += `<div class="row-detail"><strong>${key}:</strong> ${rowData[key]}</div>`;
            });
        } else if (config.columns) {
            //выводим только указанные колонки
            config.columns.forEach(col => {
                if (rowData[col] !== undefined) {
                    html += `<div class="row-detail"><strong>${col}:</strong> ${rowData[col]}</div>`;
                }
            });
        } else {
            //по умолчанию выводим все
            Object.keys(rowData).forEach(key => {
                html += `<div class="row-detail"><strong>${key}:</strong> ${rowData[key]}</div>`;
            });
        }
        
        html += '</div>';
        return html;
    }

    createModal() {
        const modalHtml = `
            <div class="vnf-modal-overlay" id="defaultModal" style="display: none;">
                <div class="vnf-modal">
                    <div class="vnf-modal-header">
                        <h5 class="vnf-modal-title"></h5>
                        <button type="button" class="vnf-modal-close">&times;</button>
                    </div>
                    <div class="vnf-modal-body"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        return document.getElementById('defaultModal');
    }

    getModalInstance(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return null;
        
        //возвращаем простой объект с методами управления
        return {
            setTitle: (title) => {
                const titleElement = modalElement.querySelector('.vnf-modal-title');
                if (titleElement) titleElement.textContent = title;
            },
            setContent: (content) => {
                const bodyElement = modalElement.querySelector('.vnf-modal-body');
                if (bodyElement) bodyElement.innerHTML = content;
            },
            open: () => {
                modalElement.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            },
            close: () => {
                modalElement.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };
    }
}

PageBuilder.addComponent(ModalAction.TYPE, ModalAction);
ActionRegistry.register(ModalAction.TYPE, ModalAction);
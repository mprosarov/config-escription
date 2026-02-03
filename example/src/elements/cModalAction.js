class ModalAction extends BaseAction {
    static TYPE = 'modalAction';
    
    constructor(parentElement, config, target) {
        console.log("ModalAction parentElement: ", parentElement)
        console.log("ModalAction config: ",config)
        console.log("ModalAction target: ",target)

        super(parentElement, config, target);
        this.create();
    }

    create() {
        /*const eventName = this.config.trigger || 'click';
        const targetElement = this.target || this.parentElement;
        
        // Назначаем обработчик события
        if (targetElement.addEventListener) {
            targetElement.addEventListener(eventName, (e) => {
                this.openModal(e);
            });
        } else if (this.target && typeof this.target.on === 'function') {
            // Если target - объект Tabulator
            this.target.on(eventName, (e, row) => {
                this.openModal(e, row);
            });
        }*/
       const eventName = this.config.trigger || 'click';
        
        console.log("ModalAction.create() - eventName:", eventName);
        console.log("ModalAction.create() - this.target:", this.target);
        console.log("ModalAction.create() - target type:", typeof this.target);
        
        //проверяем, является ли target кнопкой
        if (this.target && this.target.addEventListener) {
            console.log("ModalAction: target is DOM element, adding event listener for", eventName);
            
            //для кнопок используем обычный click
            if (eventName === 'click' || eventName === 'rowClick') {
                this.target.addEventListener('click', (e) => {
                    console.log("Button click event:", e);
                    e.preventDefault();
                    e.stopPropagation();
                    this.openModal(e);
                });
            }
        } 
        //проверяем, является ли target объектом Tabulator
        else if (this.target && typeof this.target.on === 'function') {
            console.log("ModalAction target is Tabulator:", eventName);
            
            // Для Tabulator используем rowClick
            if (eventName === 'rowClick' || eventName === 'click') {
                this.target.on('rowClick', (e, row) => {
                    console.log("Tabulator rowClick event:", row);
                    this.openModal(e, row);
                });
            }
        }
        //если target указан как строка "parentElement"
        else if (this.config.target === 'parentElement' && this.parentElement) {
            console.log("ModalAction using parentElement as target: ");
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
        
        //определяем контент в зависимости от флага
        if (config.contentType === 'tableRow' && row) {
            //если клик по строке таблицы, то выводим данные строки
            const rowData = row.getData ? row.getData() : row;
            console.log("Table row data:", rowData);
            content = this.formatTableRowData(rowData, config);
        } else if (config.contentType === 'text') {
            //выводим текст
            content = `<p>${config.content || 'Нет содержимого'}</p>`;
            console.log("Text content:", content);
        } else if (config.content) {
            //другое содержимое
            content = config.content;
        }
        
        //создаем или находим модальное окно
        let modalElement = null;
        
        //сначала ищем по modalId из конфига
        if (config.modalId) {
            modalElement = document.getElementById(config.modalId);
            console.log("if modalid modalElement: ", modalElement);
        }
        
        //если не нашли, ищем по классу
        if (!modalElement) {
            modalElement = document.querySelector('.vnf-modal-overlay');
            console.log("if class modalElement: ", modalElement);
        }
        
        //если все еще нет, создаем новое
        if (!modalElement) {
            modalElement = this.createModal();
        }
        
        //получаем объект с методами для работы с модальным окном
        const modalInstance = this.getModalInstance(modalElement.id);
        
        if (modalInstance) {
            
            //устанавливаем заголовок
            if (config.title) {
                modalInstance.setTitle(config.title);
            } else if (config.contentType === 'tableRow') {
                modalInstance.setTitle("Детали записи");
            } else {
                modalInstance.setTitle("Название модального окна");
            }
            
            //устанавливаем контент
            modalInstance.setContent(content);

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
        console.log("getModalInstance modalElement: ", modalElement);
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
                console.log("open modalElement before: ", modalElement)
                modalElement.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                console.log("open modalElement after: ", modalElement)
            },
            close: () => {
                modalElement.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };
    }
}

PageBuilder.addComponent(ModalAction.TYPE, ModalAction);
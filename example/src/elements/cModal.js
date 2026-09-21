class Modal extends BaseElement {
    static TYPE = 'modal';
    
    constructor(parentElement, config) {
        super(parentElement, config);
        this._overlayHandler = null; // ссылка на обработчик клика по overlay
        this.setupModal();
    }

    setupModal() {
        const modalId = this.config.id || 'modal_' + Date.now();
        
        const modalHtml = `
            <div class="vnf-modal-overlay" id="${modalId}" style="display: none;">
                <div class="vnf-modal">
                    <div class="vnf-modal-header">
                        <h5 class="vnf-modal-title">${this.config.title || ''}</h5>
                        <button type="button" class="vnf-modal-close">&times;</button>
                    </div>
                    <div class="vnf-modal-body" id="${modalId}_content">
                        ${this.config.content || ''}
                    </div>
                    <div class="vnf-modal-footer" id="${modalId}_footer">
                        <!-- Сюда экшены будут добавлять кнопки -->
                    </div>
                </div>
            </div>
        `;
        
        this.parentElement.insertAdjacentHTML('beforeend', modalHtml);
        this.modalElement = this.parentElement.lastElementChild;
        
        // Сохраняем ссылку на экземпляр Modal в DOM-элементе,
        // чтобы экшены (EditAction, AddAction, FilterAction) могли управлять overlay
        this.modalElement._modalInstance = this;
        
        //закрытие по кнопке X
        this.modalElement.querySelector('.vnf-modal-close').addEventListener('click', () => {
            this.close();
        });
        
        //закрытие по клику на фон — сохраняем ссылку на обработчик
        this._overlayHandler = (e) => {
            if (e.target === this.modalElement) {
                this.close();
            }
        };
        this.modalElement.addEventListener('click', this._overlayHandler);
    }

    /**
     * Включает/отключает закрытие модального окна по клику на фон (overlay).
     * @param {boolean} enable - true = закрывать по клику на фон, false = не закрывать
     */
    setCloseOnOverlay(enable) {
        if (!this.modalElement || !this._overlayHandler) return;
        
        if (enable) {
            this.modalElement.addEventListener('click', this._overlayHandler);
        } else {
            this.modalElement.removeEventListener('click', this._overlayHandler);
        }
    }

    open() {
        this.modalElement.style.display = 'flex';
    }

    close() {
        this.modalElement.style.display = 'none';
    }

    setContent(content) {
        const body = this.modalElement.querySelector('.vnf-modal-body');
        if (body) body.innerHTML = content;
    }

    setTitle(title) {
        const titleElement = this.modalElement.querySelector('.vnf-modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    /**
     * Устанавливает HTML-контент в footer модального окна.
     * @param {string} footerHtml - HTML строка с кнопками
     */
    setFooter(footerHtml) {
        const footer = this.modalElement.querySelector('.vnf-modal-footer');
        if (footer) footer.innerHTML = footerHtml;
    }

    /**
     * Очищает footer модального окна.
     */
    clearFooter() {
        const footer = this.modalElement.querySelector('.vnf-modal-footer');
        if (footer) footer.innerHTML = '';
    }
}

PageBuilder.addComponent(Modal.TYPE, Modal);

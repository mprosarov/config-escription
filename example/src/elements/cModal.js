class Modal extends BaseElement {
    static TYPE = 'modal';
    
    constructor(parentElement, config) {
        console.log("modal parentElement: ", parentElement);
        console.log("modal parentElement config: ", config);

        super(parentElement, config);
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
                </div>
            </div>
        `;
        
        this.parentElement.insertAdjacentHTML('beforeend', modalHtml);
        this.modalElement = this.parentElement.lastElementChild;
        
        //закрытие по кнопке
        this.modalElement.querySelector('.vnf-modal-close').addEventListener('click', () => {
            this.close();
        });
        
        //закрытие по клику на фон
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.close();
            }
        });
    }

    open() {
        this.modalElement.style.display = 'flex';
    }

    close() {
        this.modalElement.style.display = 'none';
    }

    setContent(content) {
        this.modalElement.querySelector('.vnf-modal-body').innerHTML = content;
    }

    setTitle(title) {
        const titleElement = this.modalElement.querySelector('.vnf-modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
}

PageBuilder.addComponent(Modal.TYPE, Modal);

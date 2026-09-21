class UndoAction extends BaseAction {
    static TYPE = 'undoAction';
    
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
        console.log('UndoAction: отмена последнего действия');
        // TODO: реализовать стек истории действий.
        // В будущем здесь будет логика отката последнего изменения
        // (редактирование/добавление/удаление строки в таблице).
        alert('Последнее действие отменено');
    }
}
PageBuilder.addComponent(UndoAction.TYPE, UndoAction);
ActionRegistry.register(UndoAction.TYPE, UndoAction);
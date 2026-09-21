/**
 * cDeleteAction.js
 *
 * DeleteAction (tabulatorDeleteAction) — удаление выбранной строки из таблицы Tabulator.
 * Требует предварительного выбора строки в таблице.
 *
 * Алгоритм работы:
 * 1. Получить выбранную строку из таблицы
 * 2. Если строка не выбрана — показать предупреждение
 * 3. Запросить подтверждение удаления
 * 4. Удалить строку из таблицы
 */

class DeleteAction extends TableAction {
  static TYPE = 'tabulatorDeleteAction';

  constructor(parentElement, config, target) {
    super(parentElement, config, target);
    this.init();
  }

  init() {
    const trigger = this.config.trigger || 'click';

    if (this.target && this.target.addEventListener) {
      this.target.addEventListener(trigger, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.deleteSelectedRow();
      });
    } else {
      console.warn('DeleteAction: target не является DOM элементом');
    }
  }

  // ==================== ОСНОВНАЯ ЛОГИКА ====================

  deleteSelectedRow() {
    // 1. Получить выбранную строку
    const selectedRows = this.table.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
      alert('Выберите строку для удаления');
      return;
    }

    const selectedData = this.table.getSelectedData();
    const rowData = selectedData[0];

    // 2. Подтверждение удаления
    if (!confirm('Вы уверены, что хотите удалить выбранную строку?')) {
      return;
    }

    // 3. Удаляем строку
    selectedRows[0].delete();

    console.log('DeleteAction: строка удалена', rowData);

    // Логируем удаление строки
    var tableId = this.table.element ? this.table.element.id : 'unknown';
    ActionLogger.log('delete', 'Удаление строки: ' + tableId, {
      tableId: tableId,
      deletedRow: rowData
    });
  }
}

PageBuilder.addComponent(DeleteAction.TYPE, DeleteAction);
ActionRegistry.register(DeleteAction.TYPE, DeleteAction);
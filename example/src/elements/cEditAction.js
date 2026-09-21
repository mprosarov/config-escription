class EditAction extends TableAction {
  static TYPE = "editModalAction";

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
        this.openEditModal();
      });
    } else {
      console.warn("EditAction: target не является DOM элементом");
    }
  }

  // ==================== ОСНОВНАЯ ЛОГИКА ====================

  openEditModal() {
    // 1. Получить выбранную строку
    const selectedData = this.table.getSelectedData();
    if (!selectedData || selectedData.length === 0) {
      alert('Выберите строку для редактирования');
      return;
    }
    const rowData = selectedData[0];

    // 2. Получить листовые колонки (рекурсивно) — из TableAction
    const columns = this.getLeafColumns();

    // 3. Построить HTML формы
    const formHtml = this.buildForm(rowData, columns);

    // 4. Найти модальное окно — через ModalHelper
    const modal = ModalHelper.findModal();
    if (!modal) {
      console.error("EditAction: модальное окно не найдено");
      return;
    }

    // 5. Заполнить и открыть модальное окно
    modal.setTitle('Редактирование строки');
    modal.setContent(formHtml);
    modal.setFooter(`
      <button type="submit" class="btn btn-success btn-sm" id="edit-save-btn" form="edit-form">Сохранить</button>
      <button type="button" class="btn btn-secondary btn-sm" id="edit-cancel-btn">Отмена</button>
    `);
    modal.open();

    // 6. Навесить обработчики
    this.setupFormHandler(rowData, columns, modal);
    this.setupCancelHandler(modal);
  }

  // ==================== ПОСТРОЕНИЕ ФОРМЫ ====================

  buildForm(rowData, columns) {
    let html = '<form class="edit-form" id="edit-form">';

    for (let col of columns) {
      const value = rowData[col.field];
      const fieldType = HtmlUtils.determineFieldType(col, value);
      html += this.createFieldHtml(col, value, fieldType);
    }

    html += '</form>';
    return html;
  }

  createFieldHtml(columnDef, value, fieldType) {
    const fieldName = columnDef.title || columnDef.field;
    const fieldId = `edit-field-${columnDef.field}`;
    const name = columnDef.field;
    const escapedValue = HtmlUtils.escapeHtml(String(value ?? ''));

    let inputHtml = '';

    switch (fieldType) {
      case 'textarea':
        inputHtml = `<textarea class="edit-form-textarea" id="${fieldId}" name="${name}">${escapedValue}</textarea>`;
        break;
      case 'number':
        inputHtml = `<input type="number" class="edit-form-input" id="${fieldId}" name="${name}" value="${escapedValue}">`;
        break;
      case 'date':
        inputHtml = `<input type="date" class="edit-form-input" id="${fieldId}" name="${name}" value="${HtmlUtils.formatDate(value)}">`;
        break;
      case 'select':
        inputHtml = this.createSelectHtml(columnDef, value, fieldId, name);
        break;
      default:
        inputHtml = `<input type="text" class="edit-form-input" id="${fieldId}" name="${name}" value="${escapedValue}">`;
    }

    return `
      <div class="edit-form-field">
        <label class="edit-form-label" for="${fieldId}">${fieldName}</label>
        ${inputHtml}
      </div>
    `;
  }

  createSelectHtml(columnDef, value, fieldId, name) {
    const options = columnDef.editorOptions || [];
    let html = `<select class="edit-form-select" id="${fieldId}" name="${name}">`;
    for (let opt of options) {
      const selected = String(opt.value) === String(value) ? 'selected' : '';
      html += `<option value="${opt.value}" ${selected}>${opt.label || opt.value}</option>`;
    }
    html += '</select>';
    return html;
  }

  // ==================== ОБРАБОТЧИКИ ====================

  setupFormHandler(rowData, columns, modal) {
    const form = document.getElementById('edit-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveChanges(rowData, columns, modal);
    });
  }

  setupCancelHandler(modal) {
    const cancelBtn = document.getElementById('edit-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => modal.close());
    }
  }

  // ==================== СОХРАНЕНИЕ ====================

  saveChanges(originalRowData, columns, modal) {
    const form = document.getElementById('edit-form');
    if (!form) return;

    const formData = new FormData(form);
    const newData = Object.fromEntries(formData.entries());

    const selectedRows = this.table.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      selectedRows[0].update(newData);
    } else {
      this.table.updateData([newData]);
    }

    console.log('EditAction: строка обновлена', {
      original: originalRowData,
      updated: newData
    });

    modal.close();

    // Логируем редактирование строки
    var tableId = this.table.element ? this.table.element.id : 'unknown';
    ActionLogger.log('edit', 'Редактирование строки: ' + tableId, {
      tableId: tableId,
      before: originalRowData,
      after: newData
    });
  }
}

PageBuilder.addComponent(EditAction.TYPE, EditAction);
ActionRegistry.register(EditAction.TYPE, EditAction);

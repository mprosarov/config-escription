/**
 * cAddAction.js
 *
 * AddAction (tabulatorAddAction) — добавление новой строки в таблицу Tabulator.
 * При нажатии на кнопку открывается модальное окно с пустой формой,
 * поля которой соответствуют колонкам таблицы. Выбор строки не требуется.
 *
 * Алгоритм работы:
 * 1. Получить листовые колонки таблицы (рекурсивно) — из TableAction
 * 2. Построить HTML формы с пустыми полями (тип поля определяется автоматически)
 * 3. Открыть модальное окно с формой — через ModalHelper
 * 4. При сабмите — добавить новую строку в таблицу
 */

class AddAction extends TableAction {
  static TYPE = 'tabulatorAddAction';

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
        this.openAddModal();
      });
    } else {
      console.warn('AddAction: target не является DOM элементом');
    }
  }

  // ==================== ОСНОВНАЯ ЛОГИКА ====================

  openAddModal() {
    // 1. Получить листовые колонки — из TableAction
    const columns = this.getLeafColumns();

    // 2. Построить HTML формы с пустыми значениями
    const formHtml = this.buildEmptyForm(columns);

    // 3. Найти модальное окно — через ModalHelper
    const modal = ModalHelper.findModal();
    if (!modal) {
      console.error('AddAction: модальное окно не найдено');
      return;
    }

    // 4. Заполнить и открыть модальное окно
    modal.setTitle('Добавление строки');
    modal.setContent(formHtml);
    modal.setFooter(`
      <button type="submit" class="btn btn-success btn-sm" id="add-save-btn" form="add-form">Добавить</button>
      <button type="button" class="btn btn-secondary btn-sm" id="add-cancel-btn">Отмена</button>
    `);
    modal.open();

    // 5. Навесить обработчики
    this.setupFormHandler(columns, modal);
    this.setupCancelHandler(modal);
  }

  // ==================== ПОСТРОЕНИЕ ПУСТОЙ ФОРМЫ ====================

  /**
   * Строит форму с пустыми полями на основе колонок таблицы.
   * Для определения типа поля использует первую строку данных (если есть).
   */
  buildEmptyForm(columns) {
    // Пробуем получить типы полей из первой строки данных
    let sampleRow = null;
    const tableData = this.table.getData();
    if (tableData && tableData.length > 0) {
      sampleRow = tableData[0];
    }

    let html = '<form class="edit-form" id="add-form">';

    for (let col of columns) {
      const sampleValue = sampleRow ? sampleRow[col.field] : '';
      const fieldType = HtmlUtils.determineFieldType(col, sampleValue);
      html += this.createFieldHtml(col, fieldType);
    }

    html += '</form>';
    return html;
  }

  /**
   * Создаёт HTML для одного поля формы с пустым значением.
   */
  createFieldHtml(columnDef, fieldType) {
    const fieldName = columnDef.title || columnDef.field;
    const fieldId = `add-field-${columnDef.field}`;
    const name = columnDef.field;

    let inputHtml = '';

    switch (fieldType) {
      case 'textarea':
        inputHtml = `<textarea class="edit-form-textarea" id="${fieldId}" name="${name}"></textarea>`;
        break;
      case 'number':
        inputHtml = `<input type="number" class="edit-form-input" id="${fieldId}" name="${name}" value="">`;
        break;
      case 'date':
        inputHtml = `<input type="date" class="edit-form-input" id="${fieldId}" name="${name}" value="">`;
        break;
      case 'select':
        inputHtml = this.createSelectHtml(columnDef, fieldId, name);
        break;
      default:
        inputHtml = `<input type="text" class="edit-form-input" id="${fieldId}" name="${name}" value="">`;
    }

    return `
      <div class="edit-form-field">
        <label class="edit-form-label" for="${fieldId}">${fieldName}</label>
        ${inputHtml}
      </div>
    `;
  }

  createSelectHtml(columnDef, fieldId, name) {
    const options = columnDef.editorOptions || [];
    let html = `<select class="edit-form-select" id="${fieldId}" name="${name}">`;
    for (let opt of options) {
      html += `<option value="${opt.value}">${opt.label || opt.value}</option>`;
    }
    html += '</select>';
    return html;
  }

  // ==================== ОБРАБОТЧИКИ ====================

  setupFormHandler(columns, modal) {
    const form = document.getElementById('add-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addRow(columns, modal);
    });
  }

  setupCancelHandler(modal) {
    const cancelBtn = document.getElementById('add-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => modal.close());
    }
  }

  // ==================== ДОБАВЛЕНИЕ СТРОКИ ====================

  addRow(columns, modal) {
    const form = document.getElementById('add-form');
    if (!form) return;

    const formData = new FormData(form);
    const newRowData = Object.fromEntries(formData.entries());

    this.table.addData([newRowData], true);

    console.log('AddAction: строка добавлена', newRowData);

    modal.close();

    // Логируем добавление строки
    var tableId = this.table.element ? this.table.element.id : 'unknown';
    ActionLogger.log('add', 'Добавление строки: ' + tableId, {
      tableId: tableId,
      newRow: newRowData
    });
  }
}

PageBuilder.addComponent(AddAction.TYPE, AddAction);
ActionRegistry.register(AddAction.TYPE, AddAction);
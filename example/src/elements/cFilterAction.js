/**
 * cFilterAction.js
 *
 * FilterAction (tabulatorFilterAction) — фильтрация данных таблицы Tabulator
 * через модальное окно с тремя частями:
 *   1. Выбор поля (выпадающий список всех колонок таблицы)
 *   2. Настройка фильтра (оператор + значение + кнопка "Применить")
 *   3. Список активных фильтров (с возможностью удаления)
 *
 * Алгоритм работы:
 * 1. При нажатии на кнопку "Фильтрация" открывается модальное окно
 * 2. Пользователь выбирает поле, оператор, вводит значение и нажимает "Применить"
 * 3. Фильтр добавляется в список активных фильтров (но не применяется к таблице)
 * 4. При нажатии "Сохранить" все фильтры применяются к Tabulator
 * 5. При нажатии "Отмена" модальное окно закрывается без применения
 */

class FilterAction extends TableAction {
  static TYPE = 'tabulatorFilterAction';

  constructor(parentElement, config, target) {
    super(parentElement, config, target);
    this.activeFilters = []; // текущие (ещё не сохранённые) фильтры
    this.savedFilters = [];  // последние применённые фильтры
    this.init();
  }

  init() {
    const trigger = this.config.trigger || 'click';

    if (this.target && this.target.addEventListener) {
      this.target.addEventListener(trigger, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openFilterModal();
      });
    } else {
      console.warn('FilterAction: target не является DOM элементом');
    }
  }

  // ==================== ОСНОВНАЯ ЛОГИКА ====================

  openFilterModal() {
    // 1. Получить листовые колонки — из TableAction
    const columns = this.getLeafColumns();
    if (!columns || columns.length === 0) {
      console.error('FilterAction: нет колонок для фильтрации');
      return;
    }

    // 2. Восстановить activeFilters из savedFilters при повторном открытии
    this.activeFilters = this.savedFilters.map(f => ({ ...f }));

    // 3. Построить HTML модального окна
    const modalHtml = this.buildFilterModalHtml(columns);

    // 4. Найти модальное окно — через ModalHelper
    const modal = ModalHelper.findModal();
    if (!modal) {
      console.error('FilterAction: модальное окно не найдено');
      return;
    }

    // 5. Заполнить и открыть модальное окно
    modal.setTitle('Фильтрация данных');
    modal.setContent(modalHtml);
    modal.setFooter(`
      <button type="button" class="btn btn-secondary btn-sm" id="filter-cancel-btn">Отмена</button>
      <button type="button" class="btn btn-primary btn-sm" id="filter-save-btn">Сохранить</button>
    `);
    modal.open();

    // 6. Навесить обработчики
    this.setupEventListeners(modal, columns);
  }

  // ==================== ПОСТРОЕНИЕ HTML ====================

  buildFilterModalHtml(columns) {
    const fieldSelectorHtml = this.buildFieldSelector(columns);
    const configuratorHtml = this.buildFilterConfigurator();
    const activeListHtml = this.buildActiveFiltersList();

    return `
      <div class="filter-modal-body">
        <!-- ЧАСТЬ 1: Выбор поля -->
        <div class="filter-section">
          <label class="filter-section-label">Выберите поле для фильтрации</label>
          ${fieldSelectorHtml}
        </div>

        <!-- ЧАСТЬ 2: Настройка фильтра -->
        <div class="filter-section" id="filter-config-section">
          ${configuratorHtml}
        </div>

        <!-- ЧАСТЬ 3: Список активных фильтров -->
        <div class="filter-section">
          <label class="filter-section-label">Применённые фильтры</label>
          <div class="filter-active-list" id="filter-active-list">
            ${activeListHtml}
          </div>
        </div>
      </div>
    `;
  }

  buildFieldSelector(columns) {
    let html = `<select class="filter-field-select" id="filter-field-select">
      <option value="">— выберите поле —</option>`;
    for (let col of columns) {
      const title = col.title || col.field;
      html += `<option value="${col.field}">${HtmlUtils.escapeHtml(title)}</option>`;
    }
    html += `</select>`;
    return html;
  }

  buildFilterConfigurator() {
    return `
      <div class="filter-config-info" id="filter-config-info">
        <em>Выберите поле из списка выше</em>
      </div>
      <div class="filter-config-row">
        <select class="filter-operator-select" id="filter-operator-select">
          <option value="=">= (равно)</option>
          <option value="!=">!= (не равно)</option>
          <option value="<">< (меньше)</option>
          <option value="<="><= (меньше или равно)</option>
          <option value=">">> (больше)</option>
          <option value=">=">>= (больше или равно)</option>
          <option value="like">Содержит</option>
          <option value="starts">Начинается с</option>
          <option value="ends">Заканчивается на</option>
        </select>
        <input type="text" class="filter-value-input" id="filter-value-input"
               placeholder="Введите значение" autocomplete="off">
        <button type="button" class="btn btn-outline-primary btn-sm filter-apply-btn" id="filter-apply-btn">
          Применить
        </button>
      </div>
    `;
  }

  buildActiveFiltersList() {
    if (!this.activeFilters || this.activeFilters.length === 0) {
      return `<div class="filter-empty">Фильтры не применены</div>`;
    }

    let html = '';
    for (let i = 0; i < this.activeFilters.length; i++) {
      const f = this.activeFilters[i];
      const fieldTitle = this.getFieldTitle(f.field);
      const operatorLabel = this.getOperatorLabel(f.type);
      html += `
        <div class="filter-active-item" data-filter-index="${i}">
          <span class="filter-active-text">
            <strong>${HtmlUtils.escapeHtml(fieldTitle)}</strong>
            ${HtmlUtils.escapeHtml(operatorLabel)}
            <span class="filter-active-value">"${HtmlUtils.escapeHtml(String(f.value))}"</span>
          </span>
          <button type="button" class="filter-remove-btn" data-filter-index="${i}" title="Удалить фильтр">&times;</button>
        </div>
      `;
    }
    return html;
  }

  // ==================== ОБРАБОТЧИКИ ====================

  setupEventListeners(modal, columns) {
    // Смена поля
    const fieldSelect = document.getElementById('filter-field-select');
    if (fieldSelect) {
      fieldSelect.addEventListener('change', () => {
        this.onFieldChange(fieldSelect.value, columns);
      });
    }

    // Кнопка "Применить"
    const applyBtn = document.getElementById('filter-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.onApplyFilter(columns);
      });
    }

    // Enter в поле ввода значения
    const valueInput = document.getElementById('filter-value-input');
    if (valueInput) {
      valueInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.onApplyFilter(columns);
        }
      });
    }

    // Делегирование событий на кнопки удаления фильтров (динамические)
    const activeList = document.getElementById('filter-active-list');
    if (activeList) {
      activeList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.filter-remove-btn');
        if (removeBtn) {
          const index = parseInt(removeBtn.dataset.filterIndex, 10);
          if (!isNaN(index)) {
            this.onRemoveFilter(index);
          }
        }
      });
    }

    // Кнопка "Сохранить"
    const saveBtn = document.getElementById('filter-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.onSave(modal);
      });
    }

    // Кнопка "Отмена"
    const cancelBtn = document.getElementById('filter-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.onCancel(modal);
      });
    }
  }

  onFieldChange(field, columns) {
    const infoEl = document.getElementById('filter-config-info');
    const operatorSelect = document.getElementById('filter-operator-select');
    const valueInput = document.getElementById('filter-value-input');

    if (!field) {
      if (infoEl) infoEl.innerHTML = '<em>Выберите поле из списка выше</em>';
      return;
    }

    // Найти описание поля
    const col = columns.find(c => c.field === field);
    if (col && infoEl) {
      const title = col.title || col.field;
      infoEl.innerHTML = `<strong>Поле:</strong> ${HtmlUtils.escapeHtml(title)} <span class="filter-config-field-name">(${HtmlUtils.escapeHtml(field)})</span>`;
    }

    // Сбросить оператор и значение
    if (operatorSelect) operatorSelect.selectedIndex = 0;
    if (valueInput) valueInput.value = '';
    if (valueInput) valueInput.focus();
  }

  onApplyFilter(columns) {
    const fieldSelect = document.getElementById('filter-field-select');
    const operatorSelect = document.getElementById('filter-operator-select');
    const valueInput = document.getElementById('filter-value-input');

    const field = fieldSelect ? fieldSelect.value : '';
    const type = operatorSelect ? operatorSelect.value : '';
    const value = valueInput ? valueInput.value.trim() : '';

    // Валидация
    if (!field) {
      alert('Выберите поле для фильтрации');
      return;
    }
    if (value === '') {
      alert('Введите значение для фильтрации');
      return;
    }

    // Проверка на дубликат — если такое же поле и оператор, заменяем
    const existingIndex = this.activeFilters.findIndex(f => f.field === field && f.type === type);
    if (existingIndex >= 0) {
      this.activeFilters[existingIndex].value = value;
    } else {
      this.activeFilters.push({ field, type, value });
    }

    // Обновить список активных фильтров
    this.updateActiveFiltersList();

    // Сбросить поля ввода для следующего фильтра
    if (operatorSelect) operatorSelect.selectedIndex = 0;
    if (valueInput) valueInput.value = '';
    if (fieldSelect) fieldSelect.value = '';
    const infoEl = document.getElementById('filter-config-info');
    if (infoEl) infoEl.innerHTML = '<em>Выберите поле из списка выше</em>';
    if (fieldSelect) fieldSelect.focus();
  }

  onRemoveFilter(index) {
    if (index >= 0 && index < this.activeFilters.length) {
      this.activeFilters.splice(index, 1);
      this.updateActiveFiltersList();
    }
  }

  onSave(modal) {
    // Сохраняем фильтры
    this.savedFilters = this.activeFilters.map(f => ({ ...f }));

    // Применяем к таблице
    if (this.table) {
      if (this.savedFilters.length === 0) {
        this.table.clearFilter();
        console.log('FilterAction: фильтры очищены');
      } else {
        this.table.setFilter(this.savedFilters);
        console.log('FilterAction: применены фильтры', this.savedFilters);
      }
    }

    modal.close();

    // Логируем фильтрацию
    var tableId = this.table && this.table.element ? this.table.element.id : 'unknown';
    if (this.savedFilters.length === 0) {
      ActionLogger.log('filter', 'Очистка фильтров: ' + tableId, {
        tableId: tableId,
        filters: []
      });
    } else {
      var filterDesc = this.savedFilters.map(function(f) {
        return f.field + ' ' + f.type + ' "' + f.value + '"';
      }).join(', ');
      ActionLogger.log('filter', 'Применение фильтра: ' + filterDesc, {
        tableId: tableId,
        filters: this.savedFilters
      });
    }
  }

  onCancel(modal) {
    // Восстанавливаем activeFilters из savedFilters
    this.activeFilters = this.savedFilters.map(f => ({ ...f }));
    modal.close();
  }

  // ==================== ОБНОВЛЕНИЕ СПИСКА ====================

  updateActiveFiltersList() {
    const container = document.getElementById('filter-active-list');
    if (!container) return;
    container.innerHTML = this.buildActiveFiltersList();
  }

  // ==================== УТИЛИТЫ ====================

  getFieldTitle(field) {
    if (!this.table) return field;
    const columns = this.getLeafColumns();
    const col = columns.find(c => c.field === field);
    return col ? (col.title || col.field) : field;
  }

  getOperatorLabel(type) {
    const labels = {
      '=': '=',
      '!=': '!=',
      '<': '<',
      '<=': '<=',
      '>': '>',
      '>=': '>=',
      'like': 'содержит',
      'starts': 'начинается с',
      'ends': 'заканчивается на'
    };
    return labels[type] || type;
  }
}

PageBuilder.addComponent(FilterAction.TYPE, FilterAction);
ActionRegistry.register(FilterAction.TYPE, FilterAction);
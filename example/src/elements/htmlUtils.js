/**
 * htmlUtils.js
 *
 * HtmlUtils — набор утилит для работы с HTML и форматированием данных.
 * Устраняет дублирование escapeHtml(), formatDate(), determineFieldType()
 * в EditAction, AddAction, FilterAction.
 */
const HtmlUtils = {
  /**
   * Экранирует HTML-спецсимволы.
   * @param {*} str
   * @returns {string}
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Конвертирует DD.MM.YYYY → YYYY-MM-DD для input type="date".
   * @param {*} value
   * @returns {string}
   */
  formatDate(value) {
    if (!value) return '';
    const match = String(value).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    return String(value);
  },

  /**
   * Определяет тип поля для формы на основе колонки Tabulator и значения.
   * @param {Object} columnDef
   * @param {*} value
   * @returns {string} 'input' | 'number' | 'date' | 'textarea' | 'select'
   */
  determineFieldType(columnDef, value) {
    if (columnDef.editorType) return columnDef.editorType;
    if (value === null || value === undefined) return 'input';
    if (typeof value === 'number' || /^\d+\.?\d*$/.test(String(value))) return 'number';
    if (this._isDateValue(value)) return 'date';
    if (String(value).length > 100) return 'textarea';
    return 'input';
  },

  _isDateValue(value) {
    const str = String(value);
    return /^\d{4}-\d{2}-\d{2}$/.test(str) || /^\d{2}\.\d{2}\.\d{4}$/.test(str);
  }
};
/**
 * tableAction.js
 *
 * TableAction — промежуточный класс для экшенов, работающих с Tabulator.
 * Устраняет дублирование _resolveTable(), getLeafColumns(), _flattenColumns()
 * в EditAction, AddAction, DeleteAction, FilterAction.
 */
class TableAction extends BaseAction {
  /**
   * @param {HTMLElement} parentElement
   * @param {Object} config
   * @param {*} target — Tabulator или DOM-элемент (кнопка тулбара)
   */
  constructor(parentElement, config, target) {
    super(parentElement, config, target);
    this.table = this._resolveTable(target);
  }

  /**
   * Определяет Tabulator из target.
   * Если target — сам Tabulator (есть метод getSelectedData), возвращаем его.
   * Если target — DOM-кнопка из тулбара, ищем Tabulator через DOM.
   * @param {*} target
   * @returns {Object|null}
   */
  _resolveTable(target) {
    if (target && typeof target.getSelectedData === 'function') {
      return target;
    }

    if (target && typeof target.addEventListener === 'function') {
      const container = target.closest('.table-tabulator-container');
      if (container) {
        const tableDiv = container.querySelector('.table-tabulator-content > div[id]');
        if (tableDiv && tableDiv.id) {
          const tables = Tabulator.findTable('#' + tableDiv.id);
          if (tables && tables.length > 0) {
            return tables[0];
          }
        }
      }
    }

    console.warn(`${this.constructor.name}: не удалось найти Tabulator`);
    return null;
  }

  /**
   * Возвращает листовые колонки таблицы (рекурсивно).
   * @returns {Array}
   */
  getLeafColumns() {
    if (!this.table) return [];
    return this._flattenColumns(this.table.getColumnDefinitions());
  }

  /**
   * Рекурсивно "уплощает" вложенные колонки до листовых.
   * @param {Array} columns
   * @returns {Array}
   */
  _flattenColumns(columns) {
    let result = [];
    for (let col of columns) {
      if (col.columns) {
        result = result.concat(this._flattenColumns(col.columns));
      } else if (col.field) {
        result.push(col);
      }
    }
    return result;
  }
}
/**
 * actionLogger.js
 *
 * ActionLogger — центральный логгер действий пользователя (Singleton).
 *
 * Назначение:
 * - Единая точка для записи всех действий пользователя
 * - Хранение истории логов (макс. 200 записей)
 * - Оповещение подписчиков (LogPanel и др.) о новых записях через паттерн Observer
 * - Сбор данных для будущей реализации Undo (поле data)
 *
 * Формат записи:
 *   { id, type, description, data, timestamp }
 *
 * Использование:
 *   ActionLogger.log('edit', 'Редактирование строки: table_1', { tableId, before, after });
 *   ActionLogger.log('add', 'Добавление строки: table_1', { tableId, newRow });
 *   ActionLogger.log('delete', 'Удаление строки: table_1', { tableId, deletedRow });
 *   ActionLogger.log('filter', 'Применение фильтра: поле = значение', { tableId, filters });
 *   ActionLogger.log('save', 'Сохранение данных в БД', { configName, data });
 *   ActionLogger.log('paramChange', 'Изменение параметра: name = value', { name, value, type });
 *   ActionLogger.log('dataLoad', 'Загрузка данных: ds_1 (42 строки)', { datasourceId, rowCount });
 *   ActionLogger.log('error', 'Ошибка загрузки конфигурации: test', { configName, errorMessage });
 */
const ActionLogger = {
  /** @private */
  _logs: [],
  /** @private Максимум записей в логе */
  _maxEntries: 200,
  /** @private Список подписчиков (callback'ов) */
  _subscribers: [],

  /**
   * Добавляет запись в лог и оповещает подписчиков.
   * Новая запись добавляется в начало массива (свежие сверху).
   *
   * @param {string} actionType — тип действия: 'edit' | 'add' | 'delete' | 'filter' | 'save' | 'saveUserConfig' | 'loadUserConfig' | 'reset' | 'paramChange' | 'dataLoad' | 'error' | 'undo'
   * @param {string} description — человекочитаемое описание действия
   * @param {object|null} data — полные данные для будущего Undo (опционально)
   * @returns {object} созданная запись лога
   */
  log(actionType, description, data) {
    const entry = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      type: actionType,
      description: description,
      data: data || null,
      timestamp: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    this._logs.unshift(entry);
    if (this._logs.length > this._maxEntries) {
      this._logs.pop();
    }

    this._notify(entry);
    return entry;
  },

  /**
   * Возвращает все записи лога (новые сверху).
   * @returns {Array}
   */
  getLogs() {
    return this._logs;
  },

  /**
   * Очищает лог и оповещает подписчиков.
   * Подписчикам передаётся null, чтобы они могли очистить свой UI.
   */
  clear() {
    this._logs = [];
    this._notify(null);
  },

  /**
   * Подписаться на новые записи лога.
   * @param {Function} callback — функция, которая будет вызвана при каждой новой записи.
   *        callback(entry) — entry — новая запись, или null при очистке лога.
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this._subscribers.push(callback);
    }
  },

  /**
   * @private Оповещает всех подписчиков о новой записи (или очистке).
   * @param {object|null} entry — запись лога или null при очистке
   */
  _notify(entry) {
    this._subscribers.forEach(function(callback) {
      try {
        callback(entry);
      } catch (e) {
        console.error('ActionLogger: ошибка в подписчике:', e);
      }
    });
  }
};
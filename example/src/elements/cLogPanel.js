/**
 * cLogPanel.js
 *
 * LogPanel — компонент панели логирования действий пользователя.
 *
 * Регистрируется через PageBuilder.addComponent и добавляется в JSON-конфиг
 * страницы в секцию page как обычный компонент.
 *
 * Конфиг:
 * {
 *   "type": "logPanel",
 *   "id": "logPanel1",
 *   "title": "Лог действий",         // опционально, по умолчанию "Лог действий"
 *   "maxHeight": "300px",            // опционально, по умолчанию "250px"
 *   "showClearButton": true,         // опционально, по умолчанию true
 *   "position": "right"              // опционально: "right" (справа, по умолчанию) или "left" (слева)
 * }
 *
 * Принцип работы:
 * - Создаёт DOM-структуру панели (заголовок + список + кнопка очистки)
 * - Подписывается на ActionLogger через subscribe()
 * - При новой записи — автоматически добавляет элемент в DOM
 * - При очистке лога — очищает DOM
 * - При создании загружает уже существующие записи из ActionLogger.getLogs()
 */

class LogPanel {
  static TYPE = 'logPanel';

  /**
   * @param {HTMLElement} parentElement — DOM-элемент, в который вставляется панель
   * @param {Object} config — конфигурация компонента из JSON
   */
  constructor(parentElement, config) {
    this.parentElement = parentElement;
    this.config = config;
    this._element = null;     // корневой DOM-элемент панели
    this._listElement = null; // контейнер для записей лога
    this._isSubscribed = false;

    this.create();
  }

  /**
   * Создаёт DOM-структуру панели и подписывается на ActionLogger.
   */
  create() {
    const title = this.config.title || 'Лог действий';
    const maxHeight = this.config.maxHeight || '250px';
    const showClearButton = this.config.showClearButton !== false;
    const position = this.config.position || 'right';

    // Определяем CSS-класс позиционирования
    var positionClass = 'log-panel--right';
    if (position === 'left') {
      positionClass = 'log-panel--left';
    }

    // Иконка для заголовка
    const titleIcon = '<span class="log-panel-title-icon">&#128203;</span>';

    // Кнопка очистки
    const clearBtnHtml = showClearButton
      ? '<button class="log-panel-clear-btn" title="Очистить историю">&#128465; Очистить</button>'
      : '';

    // HTML-структура панели (без inline max-height — высота управляется через CSS)
    const html =
      '<div class="log-panel ' + positionClass + '" id="log-panel-' + this.config.id + '">' +
        '<div class="log-panel-header">' +
          '<div class="log-panel-title">' + titleIcon + title + '</div>' +
          clearBtnHtml +
        '</div>' +
        '<div class="log-panel-list">' +
          '<div class="log-panel-empty">' +
            '<div class="log-panel-empty-icon">&#128203;</div>' +
            '<div>Нет действий</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    this.parentElement.insertAdjacentHTML('beforeend', html);
    this._element = this.parentElement.lastElementChild;
    this._listElement = this._element.querySelector('.log-panel-list');

    // Устанавливаем max-height через CSS custom property, чтобы не перезаписывать CSS-класс
    this._element.style.setProperty('--log-panel-max-height', maxHeight);

    // Навешиваем обработчик на кнопку очистки
    if (showClearButton) {
      var clearBtn = this._element.querySelector('.log-panel-clear-btn');
      var self = this;
      clearBtn.addEventListener('click', function() {
        ActionLogger.clear();
      });
    }

    // Подписываемся на ActionLogger
    this.subscribeToLogger();

    // Загружаем уже существующие записи (если есть)
    this.loadExistingLogs();
  }

  /**
   * Подписывается на ActionLogger.
   * При новой записи — добавляет элемент в DOM.
   * При очистке (entry === null) — очищает DOM.
   */
  subscribeToLogger() {
    if (this._isSubscribed) return;
    this._isSubscribed = true;

    var self = this;
    ActionLogger.subscribe(function(entry) {
      if (entry === null) {
        // Очистка лога
        self.clearDOM();
      } else {
        // Новая запись
        self.addEntryToDOM(entry);
      }
    });
  }

  /**
   * Загружает уже существующие записи из ActionLogger при создании панели.
   */
  loadExistingLogs() {
    var existingLogs = ActionLogger.getLogs();
    if (existingLogs && existingLogs.length > 0) {
      // Убираем заглушку "Нет действий"
      this.removeEmptyPlaceholder();

      // Добавляем существующие записи (они уже в обратном порядке — новые сверху)
      for (var i = 0; i < existingLogs.length; i++) {
        this.insertEntryElement(existingLogs[i]);
      }
    }
  }

  /**
   * Добавляет запись лога в DOM.
   * @param {Object} entry — запись лога из ActionLogger
   */
  addEntryToDOM(entry) {
    // Убираем заглушку "Нет действий"
    this.removeEmptyPlaceholder();

    // Вставляем новую запись в начало списка
    this.insertEntryElement(entry);
  }

  /**
   * Создаёт DOM-элемент для записи лога и вставляет его в начало списка.
   * @param {Object} entry — запись лога
   */
  insertEntryElement(entry) {
    var icon = this.getIconForType(entry.type);
    var typeClass = 'log-panel-entry--' + (entry.type || 'unknown');

    var entryHtml =
      '<div class="log-panel-entry ' + typeClass + '">' +
        '<div class="log-panel-entry-icon">' + icon + '</div>' +
        '<div class="log-panel-entry-content">' +
          '<div class="log-panel-entry-description">' + HtmlUtils.escapeHtml(entry.description) + '</div>' +
          '<div class="log-panel-entry-timestamp">' + HtmlUtils.escapeHtml(entry.timestamp) + '</div>' +
        '</div>' +
      '</div>';

    this._listElement.insertAdjacentHTML('afterbegin', entryHtml);
  }

  /**
   * Удаляет заглушку "Нет действий", если она есть.
   */
  removeEmptyPlaceholder() {
    var emptyEl = this._listElement.querySelector('.log-panel-empty');
    if (emptyEl) {
      emptyEl.remove();
    }
  }

  /**
   * Очищает DOM-список записей и показывает заглушку.
   */
  clearDOM() {
    this._listElement.innerHTML =
      '<div class="log-panel-empty">' +
        '<div class="log-panel-empty-icon">&#128203;</div>' +
        '<div>Нет действий</div>' +
      '</div>';
  }

  /**
   * Возвращает иконку (эмодзи/символ) для типа действия.
   * @param {string} type — тип действия
   * @returns {string}
   */
  getIconForType(type) {
    var icons = {
      'edit': '\u270F\uFE0F',        // ✏️
      'add': '\u2795',               // ➕
      'delete': '\u274C',            // ❌
      'filter': '\uD83D\uDD0D',      // 🔍
      'save': '\uD83D\uDCBE',        // 💾
      'saveUserConfig': '\uD83D\uDCBE', // 💾
      'loadUserConfig': '\uD83D\uDCC2', // 📂
      'reset': '\uD83D\uDD04',       // 🔄
      'paramChange': '\u2699\uFE0F', // ⚙️
      'dataLoad': '\uD83D\uDCE9',    // 📩
      'error': '\u26A0\uFE0F',       // ⚠️
      'undo': '\u21A9\uFE0F'         // ↩️
    };
    return icons[type] || '\u2022';  // • (точка для неизвестного типа)
  }
}

PageBuilder.addComponent(LogPanel.TYPE, LogPanel);
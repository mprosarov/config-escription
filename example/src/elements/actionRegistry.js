/**
 * actionRegistry.js
 *
 * ActionRegistry — фабрика/реестр экшенов.
 * Заменяет switch-диспетчеризацию, которая была в BaseAction.create().
 *
 * Принцип работы:
 * - Каждый подкласс BaseAction регистрирует себя через ActionRegistry.register()
 * - Создание экземпляров — через ActionRegistry.create() или createFromConfig()
 * - Новый экшен = новый файл + регистрация, без изменения существующего кода
 */
class ActionRegistry {
  static #actions = new Map();

  /**
   * Регистрирует класс экшена по строковому типу.
   * @param {string} type — уникальный идентификатор (например, 'resetAction')
   * @param {typeof BaseAction} classRef — класс экшена
   */
  static register(type, classRef) {
    if (this.#actions.has(type)) {
      throw new Error(`ActionRegistry: тип "${type}" уже зарегистрирован`);
    }
    this.#actions.set(type, classRef);
  }

  /**
   * Создаёт экземпляр экшена по типу.
   * @param {string} type
   * @param {HTMLElement} parentElement
   * @param {Object} config
   * @param {*} target
   * @returns {BaseAction|null}
   */
  static create(type, parentElement, config, target) {
    const ActionClass = this.#actions.get(type);
    if (!ActionClass) {
      console.warn(`ActionRegistry: неизвестный тип экшена "${type}"`);
      return null;
    }
    return new ActionClass(parentElement, config, target);
  }

  /**
   * Создаёт экшены из конфига вида { items: [{ action: '...', ... }] }.
   * Используется в cTableTabulator для создания экшенов из конфига таблицы.
   *
   * @param {HTMLElement} parentElement
   * @param {Object} actionsConfig — { items: [...] }
   * @param {*} target
   * @returns {BaseAction[]}
   */
  static createFromConfig(parentElement, actionsConfig, target) {
    if (!actionsConfig || !actionsConfig.items || !Array.isArray(actionsConfig.items)) {
      return [];
    }

    return actionsConfig.items
      .map(item => this.create(item.action, parentElement, item, target))
      .filter(Boolean);
  }
}

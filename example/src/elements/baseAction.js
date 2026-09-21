/**
 * baseAction.js
 *
 * BaseAction — базовый класс для всех экшенов.
 * Упрощён: только хранение parentElement, config, target.
 * Фабричная логика (switch) вынесена в ActionRegistry.
 * PageBuilder.addComponent сохранён для обратной совместимости.
 */
class BaseAction {
  static TYPE = "baseAction";

  constructor(parentElement, config, target) {
    this.parentElement = parentElement;
    this.config = config;
    this.target = target;
  }
}
PageBuilder.addComponent(BaseAction.TYPE, BaseAction);

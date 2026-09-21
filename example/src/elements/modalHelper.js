/**
 * modalHelper.js
 *
 * ModalHelper — утилита для поиска и управления модальными окнами.
 * Устраняет дублирование findModal() в EditAction, AddAction, FilterAction.
 *
 * Модальное окно ищется по классу .vnf-modal-overlay.
 * Если не найдено — возвращается null.
 */
const ModalHelper = {
  /**
   * Находит модальное окно на странице и возвращает объект с методами управления.
   * @returns {Object|null} { setTitle, setContent, setFooter, open, close, element }
   */
  findModal() {
    const modalElement = document.querySelector('.vnf-modal-overlay');
    if (!modalElement) return null;

    return {
      element: modalElement,

      setTitle(title) {
        const el = modalElement.querySelector('.vnf-modal-title');
        if (el) el.textContent = title;
      },

      setContent(content) {
        const el = modalElement.querySelector('.vnf-modal-body');
        if (el) el.innerHTML = content;
      },

      setFooter(html) {
        const el = modalElement.querySelector('.vnf-modal-footer');
        if (el) el.innerHTML = html;
      },

      open() {
        modalElement.style.display = 'flex';
        if (modalElement._modalInstance) {
          modalElement._modalInstance.setCloseOnOverlay(false);
        }
      },

      close() {
        modalElement.style.display = 'none';
        if (modalElement._modalInstance) {
          modalElement._modalInstance.setCloseOnOverlay(true);
        }
      }
    };
  }
};
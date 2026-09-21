class DateRange extends BaseElement {
  static TYPE = "dateRange";

  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }

  create() {
    const today = new Date().toISOString().split('T')[0];
    const html = `
      <div class="date-range-container input-group input-group-sm">
        <label class="input-group-text">${this.config.labelFrom || 'С'}</label>
        <input type="date" class="form-control form-control-sm" 
               data-param="${this.config.paramNameFrom}" value="${today}">
        <label class="input-group-text">${this.config.labelTo || 'ПО'}</label>
        <input type="date" class="form-control form-control-sm" 
               data-param="${this.config.paramNameTo}" value="${today}">
      </div>`;
    this.parentElement.insertAdjacentHTML("beforeend", html);
    BaseElement.applyCss(this.parentElement.lastElementChild, this.config);
  }
}
PageBuilder.addComponent(DateRange.TYPE, DateRange);
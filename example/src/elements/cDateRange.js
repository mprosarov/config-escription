class DateRange extends BaseElement {
  static TYPE = "dateRange";

  constructor(parentElement, config) {
    super(parentElement, config);
    this.create();
  }

  create() {
    const today = new Date().toISOString().split("T")[0];
    // Значение по умолчанию
    // TODO: дописать с учетом переадресации
    const valParamNameFrom = PageBuilder.getParamValue(
      this.config.paramNameFrom,
    );
    const valParamNameTo = PageBuilder.getParamValue(this.config.paramNameTo);
    const html = `
      <div class="date-range-container input-group input-group-sm">
        <label class="input-group-text">${this.config.labelFrom || "С"}</label>
        <input type="date" class="form-control form-control-sm" 
               data-param="${this.config.paramNameFrom}" value="${valParamNameFrom ? valParamNameFrom : today}">
        <label class="input-group-text">${this.config.labelTo || "ПО"}</label>
        <input type="date" class="form-control form-control-sm" 
               data-param="${this.config.paramNameTo}" value="${valParamNameTo ? valParamNameTo : today}">
      </div>`;
    this.parentElement.insertAdjacentHTML("beforeend", html);

    this.parentElement.lastElementChild
      .querySelectorAll("input")
      .forEach((input) => {
        input.addEventListener("change", (e) => {
          const paramName = e.target.dataset["param"];
          super.updateParam(paramName, e.target.value);
        });
      });
    BaseElement.applyCss(this.parentElement.lastElementChild, this.config);
  }
}
PageBuilder.addComponent(DateRange.TYPE, DateRange);

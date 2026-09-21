class TableTabulator extends BaseElement {
    static TYPE = 'table-tabulator';
    static URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest"
    static PARAMS = [];//задаем тоже где-то в общем конфиге
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }

    recursiveSearchColumns(data, target) {
      
      let values = {
        headerHozAlign: "center",
        hozAlign: "center",
        headerWordWrap: true,
        //headerVerticalAlign: "middle",
      };

      if (!data[target] || data[target].length < 1) return;
      for (let i = 0; i < data[target].length; i++) {
        let child = data[target][i];
        child = Object.assign(child, values);
        this.recursiveSearchColumns(child, target);
      }
    }

    /**
     * Рекурсивно применяет titleFormatter к листовым колонкам для отображения нумерации.
     * Нумерация располагается в нижней части каждой листовой колонки.
     * Позиционирование выполняется через CSS.
     *
     * ВАЖНО: Этот метод НЕ изменяет DOM после построения таблицы.
     * Вся работа делается через titleFormatter, который Tabulator вызывает
     * при рендеринге заголовка. Это исключает конфликты с fitColumns.
     *
     * @param {Array} columns - массив колонок для обработки
     * @param {Object} indexCols - объект с номерами строк {field: number}
     */
    applyNumberingTitleFormatter(columns, indexCols) {
      if (!columns || columns.length === 0) return;

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];

        if (col.columns && col.columns.length > 0) {
          // Родительская колонка - рекурсивно обрабатываем дочерние
          this.applyNumberingTitleFormatter(col.columns, indexCols);
        } else if (col.field) {
          // Листовая колонка - добавляем titleFormatter
          const field = col.field;
          const numbering = (indexCols && indexCols[field] !== undefined) ? String(indexCols[field]) : '';

          // Добавляем CSS-класс для листовых колонок с нумерацией
          const leafClass = 'tabulator-col-leaf';
          if (!col.cssClass) {
            col.cssClass = leafClass;
          } else if (col.cssClass.indexOf(leafClass) === -1) {
            col.cssClass = col.cssClass.trim() + ' ' + leafClass;
          }

          col.titleFormatter = function(cell, formatterParams, onRendered) {
            // Создаём контейнер для заголовка и нумерации
            const container = document.createElement('div');
            container.className = 'tabulator-col-numbering-wrap';

            // Текст заголовка
            const titleSpan = document.createElement('span');
            titleSpan.className = 'tabulator-col-title-text';
            const title = cell.getColumn().getDefinition().title || '';
            titleSpan.textContent = title;

            // Нумерация в нижней части
            const numberSpan = document.createElement('span');
            numberSpan.className = 'tabulator-col-numbering';
            numberSpan.textContent = numbering;

            container.appendChild(titleSpan);
            container.appendChild(numberSpan);

            return container;
          };
        }
      }
    }

    // ========================================================================
    // ПРЕДЫДУЩЕЕ РЕШЕНИЕ (equalizeNestedLeafColumnHeights) — сохранено для
    // возможности отката. Использовало JS для принудительного выравнивания
    // высоты вложенных листовых колонок через установку inline minHeight.
    // Проблема: вызывало reflow DOM, который триггерил пересчёт Tabulator
    // (fitColumns), сбрасывающий пользовательские изменения ширины колонок.
    // ========================================================================
    //
    // equalizeNestedLeafColumnHeights() {
    //   if (!this.tableObj) return;
    //
    //   const tableElement = this.tableObj.element;
    //   if (!tableElement) return;
    //
    //   const headerElement = tableElement.querySelector('.tabulator-header');
    //   if (!headerElement) return;
    //
    //   // Сбрасываем minHeight ТОЛЬКО у тех элементов, которым мы его устанавливали
    //   const equalized = headerElement.querySelectorAll('[data-equalized]');
    //   equalized.forEach(el => {
    //     el.style.minHeight = '';
    //     el.removeAttribute('data-equalized');
    //   });
    //
    //   // Выбираем ТОЛЬКО вложенные листовые колонки (внутри .tabulator-col-group-cols)
    //   const nestedLeafCols = headerElement.querySelectorAll('.tabulator-col-group-cols .tabulator-col.tabulator-col-leaf');
    //   if (nestedLeafCols.length === 0) return;
    //
    //   // Группируем по непосредственному родительскому .tabulator-col-group-cols
    //   const groups = new Map();
    //   nestedLeafCols.forEach(col => {
    //     let container = col.parentElement;
    //     while (container && container !== headerElement) {
    //       if (container.classList.contains('tabulator-col-group-cols')) break;
    //       container = container.parentElement;
    //     }
    //     if (!container) return;
    //     if (!groups.has(container)) groups.set(container, []);
    //     groups.get(container).push(col);
    //   });
    //
    //   // Для каждой группы выравниваем высоту
    //   groups.forEach((cols) => {
    //     let maxHeight = 0;
    //     cols.forEach(col => {
    //       const h = col.offsetHeight;
    //       if (h > maxHeight) maxHeight = h;
    //     });
    //     if (maxHeight === 0) return;
    //
    //     cols.forEach(col => {
    //       col.style.minHeight = maxHeight + 'px';
    //       col.style.boxSizing = 'border-box';
    //       col.setAttribute('data-equalized', 'true');
    //     });
    //
    //     // Корректируем родительские group-колонки
    //     cols.forEach(col => {
    //       let parent = col.parentElement;
    //       while (parent && parent !== headerElement) {
    //         if (parent.classList.contains('tabulator-col-group-cols')) {
    //           const cur = parseInt(parent.style.minHeight) || 0;
    //           if (cur < maxHeight) {
    //             parent.style.minHeight = maxHeight + 'px';
    //             parent.setAttribute('data-equalized', 'true');
    //           }
    //           const pCol = parent.parentElement;
    //           if (pCol && pCol.classList.contains('tabulator-col')) {
    //             const curP = parseInt(pCol.style.minHeight) || 0;
    //             if (curP < maxHeight) {
    //               pCol.style.minHeight = maxHeight + 'px';
    //               pCol.setAttribute('data-equalized', 'true');
    //             }
    //           }
    //         }
    //         parent = parent.parentElement;
    //       }
    //     });
    //   });
    // }

    create(){
      
      const ds = PageBuilder.getDS(this.config.datasourse);
      const config = this.config;
      const parentElement = this.parentElement;
      //let isEdit = config.actions?.items.some(item => item.action == 'tabulatorEditAction') ?? false;

      ds.addSubscribe(this)
      this.config["tdata"].data = [];

      // Определяем, есть ли toolbar
      const hasToolbar = config.toolbar && config.toolbar.items && config.toolbar.items.length > 0;
      const toolbarHtml = hasToolbar
        ? `<div class="table-tabulator-toolbar" id="toolbar-${config.id}"></div>`
        : '';

      // Новая структура: wrapper > container > content + toolbar
      let contentTable = `<div class="table-tabulator-wrapper">
        ${config.name ? `<h6>${config.name}</h6>` : ''}
        <div class="table-tabulator-container">
          <div class="table-tabulator-content">
            <div id="${config.id}"></div>
          </div>
          ${toolbarHtml}
        </div>
      </div>`;
      this.parentElement.insertAdjacentHTML("beforeend", contentTable);
      
      // Применяем titleFormatter к листовым колонкам для отображения нумерации
      if (this.config["tdata"].columns) {
        this.applyNumberingTitleFormatter(this.config["tdata"].columns, this.config.indexCols || {});
      }
      
      this.recursiveSearchColumns(this.config["tdata"], "columns");
      
      // Устанавливаем headerHeight: false для автоматического расчета высоты заголовков
      if (!this.config["tdata"].hasOwnProperty("headerHeight")) {
        this.config["tdata"].headerHeight = false;
      }
      
      this.tableObj = new Tabulator(`#${this.config["id"]}`, this.config["tdata"]);

      var table = Tabulator.findTable(`#${this.config["id"]}`)[0];

      const self = this;
      this.tableObj.on("tableBuilt", () => {
        // НОВОЕ РЕШЕНИЕ: применяем CSS-выравнивание высоты через flexbox.
        // Вызывается ОДИН раз при инициализации, не триггерит reflow.
        self._applyHeaderFlexAlignment();
        
        // СТАРОЕ РЕШЕНИЕ (закомментировано) — вызывало equalizeNestedLeafColumnHeights
        // после построения таблицы, что могло конфликтовать с fitColumns.
        // requestAnimationFrame(() => {
        //   console.log(">>>> equalize nested leaf column heights after tableBuilt");
        //   self.equalizeNestedLeafColumnHeights();
        // });
        
        if (config.actions) ActionRegistry.createFromConfig(parentElement, config.actions, table);

        // Создаём toolbar после построения таблицы
        if (hasToolbar) self.createToolbar();
      })

      // ВАЖНО: Не подписываемся на columnResized!
      // Любое изменение DOM после ресайза колонки вызывает reflow,
      // который триггерит внутренний пересчёт Tabulator (fitColumns),
      // сбрасывающий пользовательские изменения ширины.
      //
      // СТАРОЕ РЕШЕНИЕ (закомментировано) — подписывалось на columnResized
      // и вызывало equalizeNestedLeafColumnHeights, что ломало ресайз.
      // this.tableObj.on("columnResized", (column) => {
      //   console.log("Ширина изменена, колонка:", column ? column.getField() : 'unknown');
      //   requestAnimationFrame(() => {
      //     self.equalizeNestedLeafColumnHeights();
      //   });
      // });
      //
      // Также закомментирован ResizeObserver — он тоже вызывал лишние reflow.
      // const tableContainer = document.getElementById(this.config.id);
      // if (tableContainer) {
      //   this._resizeObserver = new ResizeObserver(() => {
      //     requestAnimationFrame(() => {
      //       self.equalizeNestedLeafColumnHeights();
      //     });
      //   });
      //   this._resizeObserver.observe(tableContainer);
      // }
    } //end create

    /**
     * НОВОЕ РЕШЕНИЕ: Применяет CSS-выравнивание высоты для вложенных
     * листовых колонок через flexbox. Вызывается ОДИН раз после tableBuilt.
     *
     * В отличие от equalizeNestedLeafColumnHeights, этот метод не устанавливает
     * inline-стили minHeight/height, а добавляет CSS-класс, который через
     * flexbox выравнивает высоту колонок внутри одной группы.
     *
     * Это гарантирует, что Tabulator сохраняет полный контроль над макетом,
     * и пользовательские изменения ширины колонок не сбрасываются.
     */
    _applyHeaderFlexAlignment() {
      if (!this.tableObj) return;

      const tableElement = this.tableObj.element;
      if (!tableElement) return;

      const headerElement = tableElement.querySelector('.tabulator-header');
      if (!headerElement) return;

      // Добавляем CSS-класс на таблицу для активации flex-выравнивания
      tableElement.classList.add('tabulator-header-flex-equalized');

      // Для group-контейнеров внутри заголовка добавляем класс,
      // который через CSS flex выравнивает высоту дочерних колонок
      const groupCols = headerElement.querySelectorAll('.tabulator-col-group-cols');
      groupCols.forEach(el => {
        el.classList.add('tabulator-group-cols-flex');
      });
    }

    /**
     * Создаёт вертикальную панель кнопок (toolbar) справа от таблицы.
     * Каждая кнопка создаётся на основе конфига из this.config.toolbar.items.
     * Если у кнопки есть секция actions, для неё создаётся BaseAction.
     */
    createToolbar() {
      const toolbarConfig = this.config.toolbar;
      if (!toolbarConfig || !toolbarConfig.items || toolbarConfig.items.length === 0) return;

      const toolbarId = `toolbar-${this.config.id}`;
      const toolbar = document.getElementById(toolbarId);
      if (!toolbar) return;

      const self = this;

      for (let i = 0; i < toolbarConfig.items.length; i++) {
        const btnConfig = toolbarConfig.items[i];

        // Иконка (Bootstrap Icons)
        let iconHtml = '';
        if (btnConfig.icon) {
          iconHtml = `<i class="bi bi-${btnConfig.icon} toolbar-btn-icon"></i>`;
        }

        // Текст кнопки
        let textHtml = '';
        if (btnConfig.text) {
          textHtml = `<span class="toolbar-btn-text">${btnConfig.text}</span>`;
        }

        // Атрибут disabled, если указан статус
        const disabledAttr = (btnConfig.status === 'disabled') ? 'disabled' : '';

        // Создаём DOM кнопки
        const btnHtml = `<button class="toolbar-btn" ${disabledAttr}>${iconHtml}${textHtml}</button>`;
        toolbar.insertAdjacentHTML('beforeend', btnHtml);
        const btnElement = toolbar.lastElementChild;

        // Если у кнопки есть actions в формате BaseAction, создаём BaseAction
        if (btnConfig.actions && btnConfig.actions.items && btnConfig.actions.items.length > 0) {
          ActionRegistry.createFromConfig(toolbar, btnConfig.actions, btnElement);
        }
      }
    }

    updatedDS(data) {
      console.log('TABLETABULATOR data', data);
      console.log('TABLETABULATOR this.config', this.config);
      console.log('TABLETABULATOR this.config.indexCols', this.config.indexCols);
      console.log('TABLETABULATOR data.resultset', data.resultset);

      console.log("tabulator this tableobj: ", this.tableObj);
      const self = this;
      if (!this.tableObj.initialized){
        this.tableObj.on("tableBuilt", function () {
          this.setData(data.resultset);

          console.log("UpdatedDS MetaData: ", this.metadata);
          this.metadata = data.metadata;

          // НОВОЕ РЕШЕНИЕ: после загрузки данных применяем flex-выравнивание (один раз)
          self._applyHeaderFlexAlignment();

          // СТАРОЕ РЕШЕНИЕ (закомментировано):
          // requestAnimationFrame(() => {
          //   console.log(">>>>> equalize nested leaf column heights after data load");
          //   self.equalizeNestedLeafColumnHeights();
          // });

          this.off("tableBuilt");
        });
        return;
      }
      this.tableObj.setData(data.resultset);
      
      // НОВОЕ РЕШЕНИЕ: после обновления данных flex-выравнивание уже активно
      // через CSS-класс, поэтому дополнительных действий не требуется.
      //
      // СТАРОЕ РЕШЕНИЕ (закомментировано):
      // requestAnimationFrame(() => {
      //   console.log(">>>>> equalize nested leaf column heights after setData");
      //   if (self.tableObj) {
      //     self.equalizeNestedLeafColumnHeights();
      //   }
      // });
    }
}
PageBuilder.addComponent(TableTabulator.TYPE, TableTabulator);

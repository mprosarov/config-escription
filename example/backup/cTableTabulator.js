class TableTabulator extends BaseElement {
    static TYPE = 'table-tabulator';
    static URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest"
    static PARAMS = [];//задаем тоже где-то в общем конфиге
    constructor(parentElement, config) {
        super(parentElement, config);
        this.metadata = [{"test": "test"}, {"test1": 'test1'}];
        this.create();
    }

    recursiveSearchColumns(data, target) {
      //console.log("recursiveSearchColumns data: ", data);
      //console.log("recursiveSearchColumns target: ", target);

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
     * Используется margin-top: auto (flexbox) для позиционирования внизу,
     * что корректно работает с нативным поведением Tabulator (resize и т.д.).
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

          // Сохраняем оригинальный titleFormatter, если он был
          const originalFormatter = col.titleFormatter;

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

    /**
     * Выравнивает высоту листовых колонок заголовка после построения таблицы.
     * Все листовые колонки получают одинаковую высоту, равную максимальной,
     * чтобы строка нумерации была на одном уровне.
     */
    equalizeLeafColumnHeights() {
      if (!this.tableObj) return;

      const tableElement = this.tableObj.element;
      if (!tableElement) return;

      const headerElement = tableElement.querySelector('.tabulator-header');
      if (!headerElement) return;

      // Получаем все листовые колонки
      const leafCols = headerElement.querySelectorAll('.tabulator-col.tabulator-col-leaf');
      if (leafCols.length === 0) return;

      // Сбрасываем ранее установленную высоту
      leafCols.forEach(col => {
        col.style.minHeight = '';
        col.style.height = '';
      });

      // Даём Tabulator пересчитать высоту
      // Находим максимальную высоту среди листовых колонок
      let maxHeight = 0;
      leafCols.forEach(col => {
        const height = col.offsetHeight;
        if (height > maxHeight) maxHeight = height;
      });

      if (maxHeight === 0) return;

      // Устанавливаем всем листовым колонкам одинаковую высоту
      leafCols.forEach(col => {
        col.style.minHeight = maxHeight + 'px';
        col.style.height = maxHeight + 'px';
        col.style.boxSizing = 'border-box';
      });

      // Поднимаемся по предкам и корректируем их высоту
      // Это нужно, чтобы родительские group-колонки не обрезали листовые
      leafCols.forEach(col => {
        let parent = col.parentElement;
        while (parent && parent !== headerElement) {
          if (parent.classList.contains('tabulator-col-group-cols')) {
            // Устанавливаем min-height для group-cols контейнера
            const currentMinHeight = parseInt(parent.style.minHeight) || 0;
            if (currentMinHeight < maxHeight) {
              parent.style.minHeight = maxHeight + 'px';
            }
            // Также устанавливаем height для родительской .tabulator-col
            const parentCol = parent.parentElement;
            if (parentCol && parentCol.classList.contains('tabulator-col')) {
              const parentColMinHeight = parseInt(parentCol.style.minHeight) || 0;
              if (parentColMinHeight < maxHeight) {
                parentCol.style.minHeight = maxHeight + 'px';
              }
            }
          }
          parent = parent.parentElement;
        }
      });
    }

    create(){
      const ds = PageBuilder.getDS(this.config.datasourse);
      const config = this.config;
      const parentElement = this.parentElement;
      let isEdit = config.actions?.items.some(item => item.action == 'tabulatorEditAction') ?? false;

      console.log("isEdit: ", isEdit);

      ds.addSubscribe(this)
      this.config["tdata"].data = [];

      let contentTable = `<div> <h6>${this.config['name']?this.config['name']:''} </h6> <div id="${this.config["id"]}"> </div> </div>`
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
        // Выравниваем высоту листовых колонок после построения таблицы
        setTimeout(() => {
          console.log(">>>> equalize leaf column heights after tableBuilt");
          self.equalizeLeafColumnHeights();
          if (self.tableObj) {
            self.tableObj.redraw(true);
          }
          // Повторяем после redraw для гарантии
          setTimeout(() => {
            self.equalizeLeafColumnHeights();
          }, 50);
        }, 0);
        
        if (config.actions){
          table.metadata_add = this.metadata;
          new BaseAction(parentElement, config.actions, table);
        }
      })

      // При изменении ширины столбцов пересчитываем
      this.tableObj.on("columnResized", () => {
        setTimeout(() => {
          console.log(">>>> equalize leaf column heights after columnResized");
          self.equalizeLeafColumnHeights();
        }, 0);
      });
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

          // Выравниваем высоту листовых колонок после загрузки данных
          setTimeout(() => {
            console.log(">>>>> equalize leaf column heights after data load");
            self.equalizeLeafColumnHeights();
            this.redraw(true);
            setTimeout(() => {
              self.equalizeLeafColumnHeights();
            }, 50);
          }, 0);

          this.off("tableBuilt");
        });
        return;
      }
      this.tableObj.setData(data.resultset);
      
      // Выравниваем высоту листовых колонок после обновления данных
      setTimeout(() => {
        console.log(">>>>> equalize leaf column heights after setData");
        if (self.tableObj) {
          self.equalizeLeafColumnHeights();
          self.tableObj.redraw(true);
          setTimeout(() => {
            self.equalizeLeafColumnHeights();
          }, 50);
        }
      }, 0);
    }
}
PageBuilder.addComponent(TableTabulator.TYPE, TableTabulator);

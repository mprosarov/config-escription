# Документация по JSON конфигурации

### Порядок работы и первоначальная настройка

- перейти в папку example
- выполнить npm i
- для сборки выполнить npm run build

##### Обновление

Для разработки

- открыть терминал в папке `/example`
- выполнить команду `npm run serve` - запуститься сервер
- открыть новый терминал и выполнить команду `npm run watch` - запуститься отслеживание изменений в файлах `/src/elements/..` - при изменении какого-либо файла будет происходит пересборка проекта, успех сборки выводиться в консоль

Данная документация описывает структуру JSON конфигурации для настройки интерфейса страницы. Конфигурация включает различные элементы, такие как заголовки, боковые панели, кнопки и выпадающие списки.

## Структура конфигурации

Конфигурация представлена в виде объекта, состоящего из пяти полей: `dataSources`,`pageParams`,`navbar`, `sidebars`, `page`.

Общий вид конфигураци:

```
{
    dataSources: [],
    pageParams: [],
    navbar: {},
    sidebars: [],
    page: []
}
```

Каждая из секций `navbar`, `sidebars`, `page` представляет из себя отдельные блоки страницы, в которые можно добавлять элементы

За что отвечает каждая секция:
![preview](img/template-1.png)
![Боковые панели](img/sidebars-common.png)
![Верхнее и нижнее](img/sidebars-common-2.png)

## Навигационная панель (navbar)

```
navbar: {
    titlePosition: 'left', // left,right
    menuPosition: 'top',  // top,bottom
    items: []
}
```

### Объяснение структуры

`titlePosition`:(Строка).Необязательное. Возможные значения:

- `'right'` (По умолчанию)
- `'left'`

Определяет размещение области заголовка навигационной панели, если заголовок присутствует.

// TODO: Вставить картинку с примерами

`menuPosition`:(Строка).Необязательное. Возможные значения:

- `'top'` (По умолчанию)
- `'bottom'`

Определяет размещение элемента `menu` и области размещения кнопок(сверху,снизу) в навигационной панели, если присутствует и меню и кнопки.

// TODO: Вставить картинку с примером

`items`: (Массив).

Массив элементов, которые будут добавленны в навигационную панель

> #### В данную область могут быть долбавленны только следующие типы элементов:
>
> ---
>
> - _header_
> - _button_
> - _button-group_
> - _menu_
> - _checkbox_

Другие типы элементов будут игнорироваться

Общая схема верхней панели:
![Разметка верхней панели](img/navbar-layout.png)

> #### В **Блок 1** будут добавляться все элементы следующих типов:
>
> ---
>
> - _menu_
> - _link_

> #### В **Блок 2** будут добавляться все элементы следующих типов:
>
> ---
>
> - _menu_
> - _button_
> - _checkbox_
> - _button-group_

В **Блок 3** будут добавляться все элементы следующих типов:

`title`

_Примечание:_ Элемент `title` д.б только один, если их будет несколько, то в **Блок 3** будет добавлен последний описанный в конфигурации элемент

## Боковые панели (sidebars)

Выезжающие панели страницы

```
sidebars: [
    {
        type: 'sidebar',
        position: 'top', // top, start, end, bottom
        items: []
    },
    ...
]
```

### Объяснение структуры

`position`:(Строка). Возможные значения:

- `'top'`
- `'end'`
- `'botton'`
- `'start'`

Определяет положение боковой панели относительно области page

`items`: (Массив).

Массив элементов, которые будут добавленны в панель

> #### В данную область могут быть долбавленны только следующие типы элементов:
>
> ---
>
> - _block_
> - _header_
> - _menu_
> - _tabs_
> - _button_
> - _button-group_
> - _radio-group_
> - _checkbox_
> - _input_
> - _select_
> - _table-tabulator_

## Основная рабочая область страницы(page)

?? Возможно будет описание структуры касаемо разметки ??

## Элементы интерфейса

Общий вид элементов:

```
        {
            type: string,
            items: array
        }
```

1. #### `type` (string): Тип элемента. Возможные значения:
   - `block` : Блок разметки
   - `header` : Заголовок
   - `menu`: Меню
   - `tabs`: Группа вкладок
   - `button`: Кнопка
   - `button-group`: Группа кнопок
   - `radio-group`: Группа радио-кнопок
   - `checkbox`: Чек-бокс
   - `input`: Поле ввода
   - `select`: Выпадающий список
   - `table-tabulator`: Таблица класса Tabulator
2. #### items (array): Массив подэлементов (например, элементы выпадающего списка или кнопок в группе).

### Описание подэлементов

---

- **BLOCK**

  #### Общий вид элемента:

  ```
      {
          type: "block",
          orientation: string,
          items": array
      }
  ```

  Описание:
  - `orientation` (string). Положение контейнера для элементов
    - `'row'`
    - `'column'`
  - `items` (array). Массив подэлементов любого типа

- **HEADER**

  #### Общий вид элемента:

  ```
      {
          type: "header",
          text: string,
          size: string
      }
  ```

  - `text` (string). Заголовок
  - `size` (string). Размер шрифта. Устанавливается в соответствии с высотой текста, указанного в классе .h\*.

  ```
  Пример:
  {
      "type": "header",
      "text": "Главная",
      "size": "5"
  }
  ```

- **MENU**

  #### Общий вид элемента:

  ```
     {
         type: "menu",
         items: array
     }
  ```

  #### Общий вид подэлемента items/submenu:

  ```
      {
          title: string,
          action: string,
          url: string,
          config: string,
          newtab: boolean,
          submenu: array
      }
  ```

  // TODO: Вставить картинку с примером

  // TODO: Дописать ACTION
  - `title`(string). Название
  - `action`(string). Необязательное. Действие, выполняемое при взаимодействии с элементом
  - `url`(string). Необязательное. Указывается только при `action: "redirect"`. Игнорируется, если указан `config`. Переход по ссылке при выборе данного пункта меню.
  - `config`(string). Необязательное. Указывается только при `action: "redirect"`. Имя конфигурации, которая которая должна загрузиться при выборе данного пункта меню/подменю
  - `newtab`(boolean). Необязательное. Указывается только при `action: "redirect"`. Показатель способа загрузки конфигурации
    - `true` - открыть в новой вкладке
    - `false` - загрузка на этой же странице
  - `submenu`(array). Maссив объектов подпунктов меню

  ```
  Пример:
    {
      type: "menu",
      items: [
        {
          title: "Главная",
          submenu: [
            {
              title: "Проекты",
              submenu: [
                {
                  title: "ОЭФ",
                  action: "redirect",
                  config: "main_oef",
                  newtab: true
                  submenu: [...]
                },
                {
                  title: "Тест",
                  action: "redirect",
                  url:"https://www.wildberries.ru/"
                }
              ]
            }
          ]
        }
      ]
    }
  ```

- **TABS**

  #### Общий вид элемента:

  ```
     {
         type: "tabs",
         items: array
     }
  ```

  - `items`(array). Массив подэлементов с типом `tab`

  #### Общий вид подэлемента:

  ```
      {
          type: "tab",
          tab_name: string,
          items: [...]
      }
  ```

  - `tab_name`(string). Название вкладки
  - `items`(array). Массив подэлементов любого типа

  ```
  Пример:
      {
          "type": "tabs",
          "items": [
              {
                  type: "tab",
                  tab_name: "НазваниеТаба_1",
                  items: [...]
              },
              {
                  type: "tab",
                  tab_name: "НазваниеТаба_2",
                  items: [...]
              }
          ]
      }
  ```

- **BUTTON**

  // TODO: Разобрать ACTION

  #### Общий вид элемента:

  ```
     {
         type: "button",
         icon: string,
         text: string,
         action: string,
         status: string
     }
  ```

  - `icon`(string). Необязательное. Имя иконки bootstrap
  - `text`(string). Необязательное. Текст внутри кнопки
  - `action`(string). Действие, выполняемое при взаимодействии с элементом
  - `status`(string). Активность кнопки
    - `disabled` - кнопка не активна
    - `unabled` - кнопка активна

  ```
  Пример:
      {
          type: "button",
          icon: "printer",
          text: "Кнопка",
          action: "print",
          status: "disabled"
      }
  ```

- **BUTTON-GROUP**

  // TODO: Разобрать ACTION

  #### Общий вид элемента:

  ```
     {
         type: "button-group",
         items: array
     }
  ```

  `items`(array) - массив подэлементов

  #### Общий вид подэлемента:

  ```
     {
         icon: string,
         text: string,
         class: string,
         action: string,
         status: string
     }
  ```

  - `icon`(string). Необязательное. Имя иконки bootstrap
  - `text`(string). Необязательное. Текст внутри кнопки
  - `class`(string). CSS класс для стилизации элемента (опционально)
    - `primary`
    - `secondary`
    - `success `
    - `info`
    - `warning`
    - `danger`
  - `action`(string). Действие, выполняемое при взаимодействии с элементом
  - `status`(string). Активность кнопки
    - `disabled` - кнопка не активна
    - `unabled` - кнопка активна

  ```
  Пример:
      {
          type: "button-group",
          items: [
              {
                  text: "кнопка_1",
                  class: "success",
                  icon: "floppy",
                  action: "save",
                  status: "disabled"
              },
              {
                  text: "кнопка_2",
                  icon: "arrow-clockwise",
                  class: "secondary",
                  action: "refresh",
                  status: "unabled"
              },
              ...
          ]
      }
  ```

- **RADIO-GROUP**

  #### Общий вид элемента:

  ```
      {
          type: "radio-group",
          name: "radio-name-tab", // возможно, пригодится
          inline: boolean,
          items: []
      }
  ```

  - `name`(string) - имя родительского таба
  - `inline`(boolean). Необязательное. Отображение элементов.
    - `true` - отображение жлементов по горизонтали
    - `false`(По умолчанию, если свойство отсутствует) - отображение элементов по вертикали
  - `items`(array) - массив попэлементов

  #### Общий вид подэлемента:

  ```
      {
          id: string,
          label: string,
          status: string,
      }
  ```

  - `id`(string). Уникальный идентификатом элемента
  - `label`(string). Лэйбл для эелемента
  - `checked`(boolean). Состояние элемента
    - `true` - элемент выбран
    - `false`(по умолчанию, если свойство отсутствует) - элемент не выбран
  - `status`(string). Активность кнопки
    - `disabled` - кнопка не активна
    - `unabled` - кнопка активна

  ```
  Пример
      {
          type: "radio-group",
          name: "radio-name-tab",
          inline": "form-check-inline",
          items: [
          {
              id: "IDradio_1",
              label: "Радио_1",
              status: "unabled",
              checked: "checked"
          },
          {
              id: "IDradio_1",
              label: "Радио_2",
              status: "unabled",
              checked: ""
          }
          ]
      }
  ```

- **CHECKBOX**

  // TODO: Разобрать ACTION

  #### Общий вид элемента:

  ```
      {
          type: "checkbox",
          inline: boolean,
          items": array
      }
  ```

  - `inline`(boolean). Необязательное. Отображение элементов.
    - `true` - отображение жлементов по горизонтали
    - `false`(По умолчанию, если свойство отсутствует) - отображение элементов по вертикали

  #### Общий вид подэлемента:

  ```
     {
         id: string,
         label: string,
         status: "disabled",
         value: string,
         action: string,
         role: string
     }
  ```

  - `id`(string). Уникальный идентификатом элемента
  - `label`(string). Лэйбл для эелемента
  - `role`(string). Необязательное. Переключение вида на свич
  - `paramName`(string). Имя параметра
  - `status`(string). Активность кнопки
    - `disabled` - кнопка не активна
    - `unabled` - кнопка активна
  - `value`(string). Значение элемента при взаимодействии с ним(скорее всего уйдет, значение привязано к параметру)
  - `action`(string). Действие, выполняемое при взаимодействии с элементом

  ```
  Пример
      {
          type: "checkbox",
          inline: "inline",
          items: [
              {
                  label: "текст_1",
                  id: "chb_1",
                  paramName: "pChb_1",
                  status: "disabled",
                  "role": "switch"
              },
              {
                  label: "текст_2",
                  id: "chb_2",
                  paramName: "pChb_1",
                  status: "unabled",
              }
          ]
      }
  ```

- **INPUT**

  // TODO: Разобрать ACTION

  #### Общий вид элемента:

  ```
     {
         type: "input",
         dataType: string,
         id: string,
         label: string,
         status: string,
         action: string
     }
  ```

  - `dataType`(string). Тип поля ввода.
    - `text` - текстовое поле
    - `date` - поле для выбора/ввода даты
    - `number` - числовое поле
    - `file` - поле с загрузкой файла
    - `search` - строка поиска

    ..добавить еще типы

  - `id`(string). Уникальный идентификатор элемента
  - `label`(string). Необязательное. Лэйбл к полю ввода
  - `status`(string). Необязательное. Активность поля
    - `disabled` - поле не активно
    - `unabled`(По умолчанию, если свойство отсутствует) - поле активно
  - `action`(string). Действие, выполняемое при взаимодействии с элементом

  //TODO: сделать везде одинаковый статус активности элементов

  ```
  Пример:
     {
         type: "input",
         dataType: "number",
         id: "inputId",
         label: "введите что-то там...",
         status: false
     }
  ```

- **SELECT**

  // TODO: Разобрать ACTION

  #### Общий вид элемента:

  ```
     {
         type: "select",
         paramName: string,
         label: string,
         labelPosition: string,
         paramName: string,
         datasource: srtring,
         dsValueField: srtring,
         dsTextField: srtring,
         status: string,
         options: array,
    // Возможно добавится свойство domain: object
     }
  ```

  - `paramName`(string). Имя параметра
  - `label`(string). Необязательное. Лэйбл к полю ввода

  - `dsValueField`(string). Имя поля из источника данных, откуда берется значение(value) опций выпадающего списка
  - `dsTextField`(string). Имя поля из источника данных, откуда берется текст(name) опций выпадающего списка
  - `labelPosition`(string)
    - `right` - Лэйбл справа от выпадающего списка
    - `left` - Лэйбл слева от выпадающего списка
  - `status`(string). Необязательное. Активность поля
    - `disabled` - поле не активно
    - `unabled`(По умолчанию, если свойство отсутствует) - поле активно
  - `options`(array) - Массив значений подпунктов выпадающего списка
  - `datasource`(string). Необязательное. Источник данных для выпадающего списка. Если datasource заполнен, то массив значений подпунктов выпадающего списка берется из запроса, игнорируя поле options.

  #### Общий вид подэлемента:

  ```
     {
         "name": string,
         "value": string
     }
  ```

  - `name`(string) - Название подпункта выпадающего списка
  - `value`(string) - Значение подпункта выпадающего списка

  ```
  Пример:
      {
          type: "select",
          paramName: "department",
          label: "Подразделение",
          labelPosition: "left",
          datasource: "id_ds_4",
          dsValueField: "id",
          dsTextField: "cfo",
          status: "disabled",
          options: [
            {
               "name": "Все подразделения",
               "value": "dept_1"
             },
             {
               "name": "Подразделение 1",
               "value": "20"
             },
             {
               "name": "Подразделение 2",
               "value": "dept_2"
             },
             {
               "name": "Подразделение 3",
               "value": "dept_3"
             }
          ]
      }
  ```

- **TABLE-TABULATOR**

  ```
     {
         type: "table-tabulator",
         id: string,
         action: array,
         name: string,
         indexCols: object,
         tdata: object
     }
  ```

  - `id`(string). Уникальный идентификатор таблицы
  - `action`(array). Массив объектов, описывающих действия, выполняемые при взаимодействии с элементами таблицы
  - `name`(string). Необязательное. Название таблицы
  - `indexCols`(object). Необязательное. Нумерование столбцов таблицы
    ```
    {
        "field_1": 1,
        "field_2": 2,
        "field_3": 2.1,
        "field_4": 2.2,
        "field_5": 3
    }
    ```
  - `tdata`(object). Объект класса Tabulator

  ```
  Пример
      {
          id : "table-tabulator_id_10form",
          type: "table-tabulator",
          name : "Форма 10",
          tdata : {
              data [{},{},{}],
              layout: "fitColumns",
              resizableRows: true,
              columnHeaderVertAlign: "middle",
              columns:[
                  {title:"Поле_1", field:"field_1"},
                  {title:"Поле_2", field:"field_2"},
                  {title:"Поле_3", field:"field_3"},
                  {title:"Поле_4", field:"field_4"},
                  {title:"Поле_5", field:"field_5"}
              ],
              "renderGorizontal": "virtual"
          }
      }

  ```

## (ACTION) Действия над элементами интерфейса

- `redirect` - переадресация

---

# Старое описание(устаревшее)

Общий вид элемента:

```
        {
            name: sting
            type: string,
            elemtype: string,
            class: string,
            icon: string,
            items: array
        }
```

1. `name` (string): Название элемента. Может быть пустым для некоторых типов элементов. ПОД ВОПРОСОМ

2. `type` (string): Тип элемента. Возможные значения:

   • `title`: Заголовок.

   • `sidebar`: Боковая панель.

   • `button`: Кнопка.

   • `dropdown`: Выпадающий список.

   • `link`: Ссылка.

   • `button-group`: Группа кнопок.

   • `table`: таблица.

3. `elemtype` (string): ПОД ВОПРОСОМ Подтип элемента, который определяет его визуальное представление. Возможные значения:

   • `title`

   • `sidebar`

   • `button`

   • `link`

   • `button-group`

4. `id` (string): Уникальный идентификатор элемента

5. `clas` (string): CSS класс для стилизации элемента (опционально).

6. `status` (string): Статус элемента. Возможные значения:

   • `enabled`: Элемент доступен для взаимодействия.

   • `unable`: Элемент недоступен для взаимодействия.

7. `multiselect` (boolean): Указывает, можно ли выбрать несколько элементов (только для выпадающих списков).

8. `multilevel` (boolean): Указывает, поддерживает ли элемент многоуровневую структуру (только для выпадающих списков).

9. `items` (array): Массив подэлементов (например, элементы выпадающего списка или кнопок в группе).

10. `action` (object): Объект, описывающий действие, выполняемое при взаимодействии с элементом (только для ссылок).

### Пример конфигурации

```
    "layout": [
        {
            "name": "Главная",
            "type": "title",
            "position": "right",
            "elemtype": "title"
        },
        {
            "id": "sidebarID",
            "type": "sidebar",
            "elemtype": "sidebar",
            "position": "top"
        },
        {
            "id": "sidebarID_2",
            "type": "sidebar",
            "elemtype": "sidebar",
            "position": "end"
        },
        {
            "id": "sidebarID_3",
            "type": "sidebar",
            "elemtype": "sidebar",
            "position": "start"
        },
        {
            "name": "",
            "icon": "svgPrint",
            "class": "secondary",
            "elemtype": "button",
            "type": "dropdown",
            "multiselect": false,
            "multilevel": false,
            "status": "unable",
            "items": []
        },
        {
            "name": "",
            "type": "button-group",
            "elemtype": "button-group",
            "items": []
        },
        {
            "name": "Проект",
            "type": "dropdown",
            "elemtype": "link",
            "multiselect": false,
            "multilevel": true,
            "status": "unable",
            "items": []
        },
        {
            "name": "Конструктор",
            "type": "link",
            "elemtype": "link",
            "status": "unable",
            "action": {}
        },
        {
            "name": "Большой список",
            "type": "dropdown",
            "elemtype": "link",
            "multiselect": false,
            "multilevel": true,
            "status": "unable",
            "items": []
        }
    ]
```

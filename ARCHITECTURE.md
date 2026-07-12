# Архитектура проекта config-escription

## Обзор

**config-escription** — система для декларативного построения веб-интерфейсов на основе JSON-конфигурации. Позволяет описывать структуру страницы (навигацию, боковые панели, основную область) через JSON, а движок времени выполнения автоматически рендерит соответствующий HTML с использованием Bootstrap 5 и Tabulator.

Проект состоит из двух основных подсистем:
1. **Runtime-движок** (`example/`) — сборка и выполнение JSON-конфигураций в браузере.
2. **Визуальный редактор конфигураций** (`json-wizard/`) — SPA-инструмент для создания и редактирования JSON-конфигураций через древовидный интерфейс и формы на основе JSON Schema.

---

## Структура проекта

```
config-escription/
├── example/                    # Runtime-движок
│   ├── server/
│   │   ├── server.js           # HTTP-сервер раздачи JSON-конфигураций
│   │   ├── watch-and-build.js  # Вотчер изменений + автопересборка
│   │   └── pageConfig/         # JSON-файлы конфигураций страниц (*.json)
│   ├── src/
│   │   ├── _app.js             # Точка входа JS (список //= include-директив)
│   │   ├── _app.css            # Точка входа CSS (список //= include-директив)
│   │   ├── _vendors.js         # Точка входа для внешних библиотек
│   │   ├── elements/           # Компоненты UI (по одному классу на тип)
│   │   │   ├── pageBuilder.js  # Ядро: оркестратор построения страницы
│   │   │   ├── baseElement.js  # Базовый класс для всех компонентов
│   │   │   ├── cNavBar.js      # Навигационная панель
│   │   │   ├── cSideBar.js     # Боковая панель (offcanvas)
│   │   │   ├── cMenu.js        # Многоуровневое меню
│   │   │   ├── cTabs.js        # Табы (вкладки)
│   │   │   ├── cItemsBlock.js  # Блок-контейнер (flex row/column)
│   │   │   ├── cButton.js      # Кнопка
│   │   │   ├── cButtonGroup.js # Группа кнопок
│   │   │   ├── cCheckBoxGroup.js # Группа чекбоксов
│   │   │   ├── cRadioGroup.js  # Группа радио-кнопок
│   │   │   ├── cSelect.js      # Выпадающий список
│   │   │   ├── cInputField.js  # Поле ввода
│   │   │   ├── cHeader.js      # Заголовок
│   │   │   ├── cTableTabulator.js # Таблица (Tabulator)
│   │   │   ├── cDataSources.js # Источник данных (SQL-подобные запросы)
│   │   │   └── cPageParam.js   # Реактивный параметр страницы
│   │   ├── css/                # Стили
│   │   │   ├── bootstrap.min.css
│   │   │   ├── bootstrap-icons.min.css
│   │   │   ├── tabulator_semanticui.min.css
│   │   │   ├── sidebars.css
│   │   │   ├── loader.css
│   │   │   └── style.css
│   │   └── vendors/            # Внешние JS-библиотеки
│   │       ├── bootstrap.min.js
│   │       └── tabulator.min.js
│   ├── dist/                   # Собранные бандлы (app.js, vendors.js, app.css)
│   ├── build.cmd               # Сборочный скрипт (rigger)
│   └── package.json
├── json-wizard/                # Визуальный редактор конфигураций
│   ├── index.html              # Главная страница SPA
│   ├── scripts/
│   │   ├── main.js             # Точка входа редактора
│   │   ├── TreeView.js         # Древовидное представление конфигурации
│   │   ├── TreeNode.js         # Узел дерева (рендеринг, события)
│   │   ├── utils.js            # Утилиты (transformToTree и др.)
│   │   ├── availableTypesFormat.js # Правила вложенности типов элементов
│   │   ├── FormEditor.js       # Редактор формы (заглушка)
│   │   └── test-JSON.js        # Тестовые данные
│   ├── schemes/                # JSON Schema для каждого типа компонента
│   │   ├── block.schema.json
│   │   ├── button.schema.json
│   │   ├── button-group.schema.json
│   │   ├── checkbox.schema.json
│   │   ├── dataSource.schema.json
│   │   ├── header.schema.json
│   │   ├── input.schema.json
│   │   ├── param.schema.json
│   │   ├── radio-group.schema.json
│   │   ├── sidebar.schema.json
│   │   └── tab.schema.json
│   ├── lib/                    # Библиотека jsonform (рендеринг форм по схеме)
│   │   ├── jsonform.js
│   │   ├── jsonform-split.js
│   │   └── jsonform-defaults.js
│   ├── styles/
│   │   └── styles.css
│   ├── deps/                   # Зависимости (jQuery, Underscore, JSV, Bootstrap)
│   └── assets/
├── img/                        # Изображения для документации
├── README.md                   # Документация по формату JSON-конфигурации
└── ARCHITECTURE.md             # Этот файл
```

---

## Архитектура Runtime-движка

### Сборка

Сборка осуществляется утилитой [rigger](https://www.npmjs.com/package/rigger) — конкатенатором с директивами `//= path/to/file.js`. Три точки входа:

| Файл | Назначение |
|------|-----------|
| `src/_app.js` | Все компоненты (`elements/*.js`) → `dist/js/app.js` |
| `src/_vendors.js` | Внешние библиотеки → `dist/js/vendors.js` |
| `src/_app.css` | Все CSS-файлы → `dist/css/app.css` |

Скрипт `watch-and-build.js` отслеживает изменения в `src/elements/` и автоматически запускает пересборку с дебаунсом 300 мс.

### Ядро: PageBuilder

`pageBuilder.js` — центральный оркестратор, реализованный как **IIFE-модуль** (Module Pattern). Предоставляет единую точку входа для всего жизненного цикла страницы.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `addComponent(type, constructor)` | Регистрация компонента в реестре |
| `create(parentElement, config)` | Фабрика: создаёт экземпляр компонента по типу |
| `createPage(config)` | Построение всей страницы из JSON-конфигурации |
| `createMainNavBar(config)` | Создание навигационной панели |
| `loadPageConfig(configName)` | Загрузка JSON-конфигурации с сервера и рендеринг |
| `loadWithParams(configName, params)` | Загрузка с подстановкой GET-параметров |
| `getParam(name)` / `getParamValue(name)` | Доступ к реактивным параметрам |
| `getDS(name)` | Доступ к источникам данных |
| `clear()` | Очистка страницы перед перерисовкой |

**Порядок построения страницы (`createPage`):**
1. Инициализация `pageParams` — создание реактивных параметров
2. Инициализация `dataSources` — создание источников данных
3. Рендеринг `navbar` — навигационная панель
4. Рендеринг `page` — основная область (контейнер `.app-page`)
5. Рендеринг `sidebars` — боковые панели
6. Выполнение запросов данных (`DS.execute()`)

### Иерархия компонентов

```
BaseElement (базовый класс)
├── ItemsBlock       (type: "block")        — flex-контейнер
├── Header           (type: "header")       — заголовок h1-h6
├── Button           (type: "button")       — одиночная кнопка
├── ButtonGroup      (type: "button-group") — группа кнопок
├── CheckBoxGroup    (type: "checkbox")     — группа чекбоксов
├── RadioGroup       (type: "radio-group")  — группа радио-кнопок
├── Select           (type: "select")       — выпадающий список
├── InputField       (type: "input")        — поле ввода
├── Tabs             (type: "tabs")         — контейнер вкладок
├── TableTabulator   (type: "table-tabulator") — таблица Tabulator
├── Menu             (type: "menu")         — многоуровневое меню (не наследует BaseElement)
├── NavBar           (type: "navbar")       — навигационная панель (не наследует BaseElement)
├── SideBar          (type: "sidebar")      — боковая панель (не наследует BaseElement)
├── DataSources      (type: "dataSource")   — источник данных (не наследует BaseElement)
└── PageParam        (type: "param")        — реактивный параметр (не наследует BaseElement)
```

**Паттерн создания компонента (конвенция):**
1. Статическое свойство `TYPE` — строка, соответствующая ключу `type` в JSON-конфигурации
2. Конструктор `(parentElement, config)` — принимает родительский DOM-элемент и объект конфигурации
3. Метод `create()` — рендерит HTML и вставляет в `parentElement`
4. Регистрация через `PageBuilder.addComponent(TYPE, Class)` в конце файла

### Система реактивных параметров (PageParam)

Реализует паттерн **Observer (Pub/Sub)**:

- `PageParam` — хранит значение параметра и список подписчиков
- Подписчики (`DataSources`, UI-элементы) вызывают `addSubscribe()` и получают уведомления через `paramChanged(name, value)`
- Инициализация параметра поддерживает типы: `raw` (прямое значение), `get` (из URL), `date` (текущая дата), `number` (число)
- Изменение значения через `setParamValue()` триггерит оповещение всех подписчиков

### Система источников данных (DataSources)

- Каждый `DataSources` содержит SQL-подобный запрос с плейсхолдерами `{paramName}`
- При создании парсит запрос, находит все `{...}` и подписывается на соответствующие `PageParam`
- При изменении любого параметра вызывает `execute()`:
  1. Подставляет значения параметров в запрос
  2. Выполняет запрос (в dev-режиме возвращает тестовые данные)
  3. Оповещает подписанные компоненты (например, `TableTabulator`) через `updatedDS(data)`

### BaseElement — базовый класс

Предоставляет общую функциональность:
- `applyCss(element, config)` — применение стилей из конфигурации (padding, margin, цвет фона/текста)
- `actionRedirect(configAction, params)` — обработка действия `redirect` (загрузка другой конфигурации на этой же странице или в новой вкладке)
- `_redirectConfig()` / `_redirectToURL()` — конкретные реализации редиректа

### NavBar — навигационная панель

Структура navbar (Bootstrap 5):
- **Блок 1** (data-menu): `menu`, `link`
- **Блок 2** (data-buttons): `button`, `checkbox`, `button-group`
- **Блок 3** (data-title): `header` (заголовок страницы)

Параметры: `titlePosition` (left/right), `menuPosition` (top/bottom).

### SideBar — боковая панель

Использует Bootstrap Offcanvas. Позиции: `top`, `end`, `bottom`, `start`.
- Кнопка-переключатель с иконкой (bootstrap-icons)
- Автоматическое скрытие всех панелей при клике вне области (если открыто >1)
- Принимает любые дочерние компоненты

### Взаимодействие компонентов

```
JSON Config (с сервера)
        │
        ▼
  PageBuilder.loadPageConfig()
        │
        ▼
  PageBuilder.createPage(config)
        │
        ├──► PageParam[] (инициализация)
        │       │
        │       ▼ subscribe
        ├──► DataSources[] ──► execute() ──► TableTabulator.updatedDS()
        │
        ├──► NavBar.create()
        │       └──► Menu / Button / ButtonGroup / CheckBox / Header
        │
        ├──► Page items (рекурсивно)
        │       └──► ItemsBlock / Tabs / TableTabulator / Input / Select / ...
        │
        └──► SideBar[] (рекурсивно)
                └──► Любые дочерние компоненты
```

---

## Архитектура JSON Wizard (редактор)

### Общая схема

SPA-приложение (без серверной части), запускается через `browser-sync` как статический сервер.

```
┌──────────────────────────────────────────────────────┐
│                    index.html                         │
│  ┌──────────────────┐  ┌───────────────────────────┐ │
│  │   Sidebar (дерево)│  │   Main Panel (форма)      │ │
│  │                   │  │                           │ │
│  │  TreeView         │  │  jsonform (JSON Schema)   │ │
│  │   └── TreeNode[]  │  │   └── showSchemaForm()    │ │
│  │                   │  │                           │ │
│  │  + кнопка         │  │  Загрузка .json файла     │ │
│  │    добавления     │  │  конфигурации             │ │
│  └──────────────────┘  └───────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Компоненты редактора

| Компонент | Файл | Назначение |
|-----------|------|-----------|
| `TreeView` | `TreeView.js` | Управление деревом: рендеринг, навигация, добавление/удаление узлов |
| `TreeNode` | `TreeNode.js` | Отдельный узел: сворачивание/разворачивание, выделение, иконка по типу |
| `Utils` | `utils.js` | `transformToTree()` — преобразование JSON-конфигурации в древовидную структуру |
| `availableTypesFormat` | `availableTypesFormat.js` | Правила: какие типы элементов можно добавлять в какие родительские контейнеры |
| `FormEditor` | `FormEditor.js` | Заглушка редактора формы (не реализован) |
| `FormContainer` (в main.js) | `main.js` | Загрузка JSON Schema и отображение формы через `jsonform.js` |

### Поток работы редактора

1. Пользователь загружает JSON-файл конфигурации через `<input type="file">`
2. `Utils.transformToTree()` преобразует плоский JSON в иерархическую структуру:
   ```js
   { id, text, raw, children[], type }
   ```
3. `TreeView.setData()` рендерит дерево
4. При клике на узел:
   - `createSelectList()` обновляет выпадающий список доступных для добавления типов (на основе `availableTypesFormat`)
   - `FormContainer.showSchema()` загружает JSON Schema для типа узла и рендерит форму редактирования через `jsonform.js`

### Правила вложенности (availableTypesFormat)

Каждый тип элемента имеет массив `parents` — в каких типах контейнеров он может находиться:

| Тип элемента | Может быть внутри |
|-------------|-------------------|
| `param` | `pageParams` |
| `dataSource` | `dataSources` |
| `header` | `page`, `block`, `sidebar`, `tab`, `navbar` |
| `block` | `page`, `block`, `sidebar`, `tab` |
| `sidebar` | `sidebars` |
| `button-group` | `page`, `block`, `sidebar`, `tab`, `navbar` |
| `button` | `page`, `block`, `sidebar`, `tab`, `navbar` |
| `tab` | `tabs` |
| `select` | `page`, `block`, `sidebar`, `tab` |
| `table-tabulator` | `page`, `block`, `sidebar`, `tab` |
| `radio-group` | `page`, `block`, `sidebar`, `tab`, `navbar` |
| `checkbox` | `page`, `block`, `sidebar`, `tab`, `navbar` |
| `input` | `page`, `block`, `sidebar`, `tab`, `navbar` |

### JSON Schema (schemes/)

Для каждого типа компонента определена JSON Schema (draft-2020-12). Эти схемы используются:
- `jsonform.js` для автоматической генерации формы редактирования
- Валидация структуры элемента

Пример (`block.schema.json`):
```json
{
  "type": "object",
  "properties": {
    "type": { "type": "string", "default": "block", "readonly": true },
    "orientation": { "type": "string", "enum": ["row", "column"] }
  }
}
```

---

## Формат JSON-конфигурации (кратко)

```json
{
  "dataSources": [ /* источники данных */ ],
  "pageParams":   [ /* реактивные параметры */ ],
  "navbar":       { /* навигационная панель */ },
  "sidebars":     [ /* боковые панели */ ],
  "page":         [ /* элементы основной области */ ]
}
```

Поддерживаемые типы элементов: `block`, `header`, `menu`, `tabs`/`tab`, `button`, `button-group`, `radio-group`, `checkbox`, `input`, `select`, `table-tabulator`.

---

## Технологический стек

| Слой | Технологии |
|------|-----------|
| **Runtime UI** | Vanilla JS (ES6+), Bootstrap 5.3, Tabulator, Bootstrap Icons |
| **Сборка** | rigger (конкатенация с директивами) |
| **Dev-сервер** | Node.js HTTP (кастомный), browser-sync |
| **Редактор** | Vanilla JS, jQuery, jsonform.js, Underscore.js, JSV |
| **Схемы** | JSON Schema (draft-2020-12) |

---

## Точки расширения

1. **Добавление нового типа элемента:**
   - Создать класс в `example/src/elements/` (следовать конвенции: `TYPE`, `constructor`, `create`, `PageBuilder.addComponent`)
   - Добавить `//= elements/cNewElement.js` в `_app.js`
   - Создать JSON Schema в `json-wizard/schemes/`
   - Добавить запись в `availableTypesFormat.js` с правилами вложенности

2. **Добавление нового действия (action):**
   - Добавить обработчик в `switch` блока `performAnAction` в `pageBuilder.js`
   - Реализовать метод в `BaseElement` для переиспользования

3. **Новый тип инициализации параметра:**
   - Добавить ветку в `PageParam.create()` с логикой инициализации
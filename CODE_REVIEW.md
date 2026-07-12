# Code Review: config-escription

## Критичность

| Маркер | Значение |
|--------|----------|
| 🔴 | Критично — баг, утечка памяти, падение |
| 🟠 | Существенно — архитектурная проблема, technical debt |
| 🟡 | Незначительно — стиль, консистентность |
| 🟢 | Рекомендация — улучшение, не требующее срочности |

---

## 1. Runtime-движок (`example/`)

### 1.1. pageBuilder.js — Ядро

#### 🔴 `performAnAction` — пустая реализация
```js
// pageBuilder.js:49-55
function performAnAction(name, obj, tableID) {
  console.warn(name);
  console.warn(obj);
  console.warn(tableID);
  switch (name) {
    case "redirect":
      break;
  }
}
```
Метод только логирует, но не выполняет действий. Вся логика `redirect` продублирована в `cMenu.js` и `BaseElement.js`. Если метод задуман как единая точка диспетчеризации экшенов — он не используется.

**Рекомендация:** либо удалить, либо реализовать централизованную диспетчеризацию и делегировать из компонентов сюда.

---

#### 🔴 `cPageParam.js` — баг: `valueType = 'get'` не сохраняет значение
```js
// cPageParam.js:20-25
if(type == 'get'){
    let redirectUrlParams = new URL(window.location.href);
    let urlParams = new URLSearchParams(redirectUrlParams.search);
    urlParams.get(this.getName()); // значение получено, но НЕ присвоено this.paramValue
    return
}
```
`urlParams.get()` возвращает значение, но оно никуда не сохраняется. Параметр всегда остаётся `undefined`.

**Исправление:**
```js
this.paramValue = urlParams.get(this.getName());
```

---

#### 🔴 `cSideBar.js` — утечка обработчиков событий
```js
// cSideBar.js:42-53
function _initEvent(){
  window.addEventListener("click", (e) => {
    if(SideBar.openCount<2) return;
    if (!e.target.closest(".offcanvas") && !e.target.closest(`[data-type="sidebar"]`)) {
      SideBar._allSidebars.forEach((offcanvas) => {
        offcanvas.hide();
      });
    }
  });
};
_initEvent();
```
`_initEvent()` вызывается при создании **каждого** экземпляра SideBar. При `loadPageConfig` (перезагрузке страницы) старые обработчики не удаляются. После 10 переходов на странице висит 10 обработчиков на `window.click`.

**Рекомендация:** вынести в статический метод, вызываемый однократно (например, через флаг `SideBar._globalListenerInitialized`).

---

#### 🟠 `cMenu.js` — использование глобального `event`
```js
// cMenu.js:56-58
a_element.onclick = () => {
    event.preventDefault(); // event — глобальный window.event, не параметр стрелки
    PageBuilder.loadPageConfig(item.config);
};
```
Стрелочная функция не принимает параметр `event`. Код полагается на `window.event` (IE-совместимость), что нестандартно и может сломаться в strict mode или в Firefox при отсутствии глобального `event`.

**Исправление:** `a_element.onclick = (event) => { event.preventDefault(); ... }`

---

#### 🟠 `cMenu.js` — дублирование логики `createMenuItem` и `createSubMenu`
Методы на 90% идентичны. Различие только в CSS-классах (`dropdown` vs `dropend`) и типе родительского элемента (`li` vs вложенный). Это нарушает DRY.

**Рекомендация:** объединить в один метод `_createMenuItem(parentEl, item, isSubmenu)`.

---

#### 🟠 `cTableTabulator.js` — мутация конфигурации
```js
// cTableTabulator.js:30
this.config["tdata"].data = []; // потеря исходных данных конфигурации

// cTableTabulator.js:34
this.recursiveSearchColumns(this.config["tdata"], "columns"); // Object.assign мутирует columns
```
Компонент необратимо модифицирует переданный объект конфигурации. При повторном использовании той же конфигурации (например, при перезагрузке страницы) данные будут потеряны.

**Рекомендация:** делать глубокое копирование `this.config` перед мутацией.

---

#### 🟠 `cTableTabulator.js` — двойное добавление `indexCols`
```js
// create():42
this.config["tdata"]["data"].unshift(this.config["indexCols"]);

// updatedDS():70
if (this.config["indexCols"]) {
    data.unshift(this.config["indexCols"]);
}
```
При инициализации `indexCols` уже добавлен в `create()`, но при обновлении данных через `updatedDS()` добавляется повторно к пришедшим данным, которые уже могут содержать `indexCols` (если `data` включает старые данные).

**Рекомендация:** добавить `indexCols` только в `updatedDS`, убрать из `create()`.

---

#### 🟠 `cTableTabulator.js` — обработчик `tableBuilt` не снимается
```js
// cTableTabulator.js:72-76
if (!this.tableObj.initialized){
    this.tableObj.on("tableBuilt", function () {
      this.setData(data);
      this.off("tableBuilt"); // снимается, но только в этом обработчике
    });
    return;
}
```
Если `tableBuilt` никогда не сработает (ошибка инициализации Tabulator), обработчик останется висеть. В остальном корректно — `off` вызывается.

---

#### 🟠 `cTabs.js` — статический счётчик не сбрасывается
```js
static idCounter = 0;
constructor(parentElement, config) {
    Tabs.idCounter++;
}
```
При очистке страницы и создании новой (`clear()` + `createPage()`) счётчик не обнуляется. ID табов будут расти бесконечно (`tab-1-0`, `tab-56-0`...). Это не баг, но неопрятно.

**Рекомендация:** добавить `Tabs.resetCounter()` и вызывать в `PageBuilder.clear()`.

---

#### 🟡 `pageBuilder.js` — несоответствие имён свойств в документации и коде
| Компонент | В документации (README) | В коде |
|-----------|------------------------|--------|
| ButtonGroup | `items` | `elements` |
| CheckBoxGroup | `items` | `elements` |
| RadioGroup | `items` | `elements` |
| Select | `items` | `options` |

**Рекомендация:** привести к единообразию. Конфигурации, написанные по документации, не будут работать с текущим кодом.

---

#### 🟡 `pageBuilder.js` — хардкод URL
```js
let URL = "";
if (location.href.indexOf("file") >= 0) {
    URL = "http://localhost:3000/config";
} else {
    URL = "http://base-s-web-01.vniief.local/pentaho/plugin/vnf/api/rest";
}
```
Внутренний сервер в коде. При развёртывании на другом окружении потребуется правка исходников.

**Рекомендация:** вынести в конфиг или переменную окружения (передавать через глобальный объект `window.__APP_CONFIG__`).

---

#### 🟡 `pageBuilder.js` — зависимость от глобальной `initPage()`
```js
window.addEventListener("popstate", (event) => {
    clearState();
    initPage(); // глобальная функция, не определена в проекте
});
```
Функция `initPage()` не определена ни в одном файле проекта. Предположительно, она находится в `templates.html` (упоминается в комментарии), который не включён в репозиторий.

**Рекомендация:** либо добавить `templates.html` в репозиторий, либо сделать `initPage` частью `PageBuilder`.

---

#### 🟡 `pageBuilder.js` — массив `createdComponents` не используется
```js
var createdComponents = [];
// ...
createdComponents.push(PageBuilder.create(domPage, item)) // заполняется
// но нигде не читается и не очищается
```

**Рекомендация:** либо использовать для очистки (вызов destroy/dispose), либо удалить.

---

#### 🟡 `baseElement.js` — `applyCss` — data-driven рефакторинг
Метод содержит 6 почти идентичных блоков для каждого CSS-свойства. Структура `CONFIG_PAGE` уже data-driven, но применение — нет.

**Рекомендация:** заменить на цикл по маппингу `configKey → styleProperty → dimension`.

---

#### 🟡 `baseElement.js` — `_redirectToURL` не реализован
```js
_redirectToURL(configAction, resultParams = []) {
    console.log('ПЕРЕАДРЕСАЦИЯ ПО УРЛ', configAction.url);
}
```

**Рекомендация:** реализовать или выбросить `new Error('Not implemented')`.

---

#### 🟡 `cDataSources.js` — мок-данные в продакшн-коде
```js
fetchQuery(query) {
    let test = [];
    for (let i = 0; i < 10; i++) {
        test.push({ idconfig: ..., 2: Date.now(), ... });
    }
    return test;
}
```
Реальная реализация закомментирована. Мок-данные попадут в production-сборку.

**Рекомендация:** управлять через флаг (например, `window.__DEV_MODE__`), либо вынести мок-данные в отдельный плагин.

---

#### 🟡 `cDataSources.js` — `fetch` без обработки ошибок
Закомментированный код:
```js
var resp = fetch(`${URL}/doquery`, { ... })
let respText = resp.text(); // нет await!
let json = JSON.parse(respText);
```
Даже если раскомментировать: нет `await`, нет `.catch()`, нет проверки `resp.ok`.

---

#### 🟡 `cCheckBoxGroup.js`, `cRadioGroup.js`, `cSelect.js` — `status` используется как HTML-атрибут
```js
`<input ... ${item.status}>` // status = "disabled" → OK, но status = "unabled" → битый HTML
```
Значение `unabled` не является валидным HTML-атрибутом. Оно вставляется как булев атрибут, что не имеет смысла.

**Рекомендация:** использовать `status === 'disabled' ? 'disabled' : ''`.

---

#### 🟡 `cButton.js` — то же самое
```js
`<button ... ${this.config.status}>` // status = "disabled" → "disabled", но "unabled" → битый атрибут
```

---

#### 🟢 `cNavBar.js` — `switch` по типам можно заменить на конфигурацию
```js
switch (item.type) {
    case Menu.TYPE: ... break;
    case Button.TYPE: ... break;
    // ...
}
```
При добавлении нового типа, допустимого в navbar, нужно править NavBar.

**Рекомендация:** добавить в компоненты статический массив `ALLOWED_IN` или перенести логику размещения в `PageBuilder.create()`.

---

#### 🟢 `cSideBar.js` — хрупкий `lastElementChild`
```js
this.parentElement.lastElementChild.querySelector(".offcanvas-body");
```
Зависимость от порядка вставки — если кто-то вставит элемент после, код сломается.

**Рекомендация:** сохранять ссылку на созданный элемент:
```js
const offcanvasEl = document.createElement('div');
offcanvasEl.innerHTML = `...`;
this.parentElement.appendChild(offcanvasEl);
this.container = offcanvasEl.querySelector('.offcanvas-body');
```

---

### 1.2. Сборка и сервер

#### 🟡 `build.cmd` — нет проверки ошибок
```bat
chcp 65001
npx rig src/_app.js > dist/js/app.js && echo Создан файл app.js && ...
```
При ошибке `rig` (например, файл не найден) билд продолжается с пустым/битым выходным файлом, потому что `&&` проверяет только exit code предыдущей команды, а `>` создаёт файл в любом случае.

---

#### 🟢 `server.js` — нет кэширования
Каждый запрос читает файл с диска заново. Для статического конфига это приемлемо, но при масштабировании стоит добавить `Cache-Control` или in-memory кэш.

---

#### 🟢 `watch-and-build.js` — путь к TARGET_DIR
```js
const TARGET_DIR = '../example';
```
Скрипт лежит в `example/server/`, а ссылается на `../example` — фактически на `example/example/`, что не существует. Команда `npm run build` скорее всего работает потому что `exec` запускается с `cwd: TARGET_DIR`, но путь выглядит ошибочным.

---

## 2. JSON Wizard (`json-wizard/`)

### 2.1. Критические проблемы

#### 🔴 `FormEditor.js` — синтаксически сломан
```js
const FormEditor = (function(){
    constructor(onSaveCallback, onCancelCallback)  // нет function, нет класса
    open(currentKey, currentValue, path)            // нет function
    close()                                          // нет function
})()
```
IIFE не содержит валидного JavaScript. Это вызовет `SyntaxError` при загрузке.

**Рекомендация:** либо реализовать, либо удалить файл из `index.html`.

---

#### 🔴 `TreeNode.js` — отладочный код в продакшне
```js
reRender() {
    alert("reRender");
    this.container.innerHTML = "";
    this.container.appendChild(this.render());
}
```
`alert()` блокирует UI. Метод нигде не вызывается, но при случайном вызове — это баг.

**Рекомендация:** заменить на `console.warn` или удалить.

---

#### 🔴 `TreeNode.js` — `handleDeleteClick` не обновляет модель
```js
handleDeleteClick() {
    this.nodeContainer.parentNode.removeChild(this.nodeContainer);
}
```
Удаляет DOM-элемент, но не удаляет данные из `this.node.children` родительского узла. При последующем `getJson()` или `render()` данные останутся.

**Рекомендация:** удалять из модели данных родителя, затем перерендерить.

---

#### 🔴 `main.js` — неявная глобальная переменная `tree`
```js
if(!tree){
    tree = new TreeView("#tree", clickNode)
}
```
`tree` не объявлена через `let`/`var`/`const` — становится `window.tree`. В strict mode вызовет `ReferenceError`.

**Исправление:** `let tree;` перед `downloadConfig` или внутри неё.

---

#### 🟠 `TreeView.js` — `selectedNode` как глобальное состояние
```js
// TreeNode.js:156
this.treeViewInstance.selectedNode = treeNode;
```
Состояние выделенного узла хранится в `TreeView`, но мутируется из `TreeNode`. Это создаёт неявную связанность.

**Рекомендация:** сделать метод `TreeView.selectNode(treeNode)` и вызывать его из `TreeNode`.

---

#### 🟠 `TreeNode.js` — `ComponentFactory` и `DataSource` не используются
```js
class ComponentFactory { ... }
class DataSource { ... }
const factory = new ComponentFactory(); // создаётся, но не вызывается
```
Мёртвый код. `factory` создаётся в области видимости модуля, но `createComponent()` нигде не вызывается.

**Рекомендация:** удалить или интегрировать в `addChild`/`handleDeleteClick`.

---

#### 🟡 `utils.js` — `transformToTree` смешивает логику и UI
```js
const transformToTree = (config, configName) => {
    explorerName = document.getElementById("sidebarConfigName");
    configName
      ? (explorerName.innerText = configName)
      : (explorerName.innerText = "Без названия");
    // ... затем трансформация данных
}
```
Функция называется «трансформировать в дерево», но побочно меняет DOM. Нарушает Single Responsibility.

**Рекомендация:** вынести обновление `explorerName` в вызывающий код.

---

#### 🟡 `utils.js` — нет проверки на `items` у `navbar`
```js
} else {
    if (config[key]["items"].length) { // упадёт, если items отсутствует
        addChildren(item.children, config[key]["items"]);
    }
}
```
Для `pageParams` и `dataSources` проверяется `instanceof Array`, но для `navbar` (объект) — нет проверки на существование `items`.

**Исправление:** `if (config[key]?.items?.length)`.

---

#### 🟡 `main.js` — хардкод URL для схем
```js
const URL = "http://localhost:3000";
fetch(`${URL}/schemes/${nodeJson.type}.schema.json`)
```
При деплое на другой хост потребуется правка кода.

**Рекомендация:** использовать относительный путь: `fetch('./schemes/...')`.

---

#### 🟡 `availableTypesFormat.js` — нет валидации на дубликаты
При ручном добавлении записей легко создать дубликат типа. Нет проверки целостности.

**Рекомендация:** добавить самопроверку при загрузке:
```js
const types = availableFormat.map(f => f.type);
const duplicates = types.filter((t, i) => types.indexOf(t) !== i);
if (duplicates.length) console.error('Duplicate types:', duplicates);
```

---

#### 🟢 `TreeNode.js` — `expandClick` использует глобальный `event`
```js
expandClick() {
    const item = event.target.closest("button");
    event.stopPropagation();
```
Та же проблема, что в `cMenu.js`. В Firefox без `window.event` упадёт.

**Исправление:** передавать `event` через `addEventListener`:
```js
button.addEventListener("click", (event) => this.expandClick(event));
```

---

#### 🟢 `TreeView.js` — методы-заглушки
```js
getData() {}
deleteNode(path) {}
updateNode(path, newKey, newValue) {}
getNewId() {}
```
Наличие пустых методов вводит в заблуждение — они выглядят как часть API, но ничего не делают.

**Рекомендация:** либо реализовать, либо удалить, либо выбрасывать `new Error('Not implemented')`.

---

## 3. Общие проблемы проекта

### 🔴 Отсутствие тестов
В проекте нет ни одного теста — ни unit, ни integration, ни e2e. При модификации `pageBuilder.js` или любого компонента невозможно автоматически проверить, что ничего не сломано.

**Рекомендация:** внедрить Jest/Vitest для unit-тестов компонентов и jsdom для тестов DOM-манипуляций.

---

### 🟠 Отсутствие модульной системы
Код полагается на глобальные переменные и конкатенацию через `rigger`. Нет `import`/`export`. Это создаёт:
- Неявные зависимости между файлами (порядок конкатенации в `_app.js` критичен)
- Конфликты имён (все классы в глобальной области)
- Невозможность tree-shaking

**Рекомендация:** мигрировать на ES-модули + сборщик (Vite/webpack).

---

### 🟠 Смешение русского и английского
- Код на английском (`createPage`, `loadPageConfig`...)
- Комментарии на русском (`//чистим историю`, `//ЭКШЕНЫ`)
- Строковые литералы UI на русском (`"Главная"`, `"Кнопка"`)
- Имена переменных транслитом (`datasourse`, `pTest`)

**Рекомендация:** принять стандарт: код и идентификаторы — английский; строки UI — через i18n; комментарии — на одном языке (русский или английский).

---

### 🟠 Отсутствие валидации конфигурации
Runtime-движок не проверяет структуру JSON-конфигурации перед использованием. Опечатка в `type` элемента приводит к `throw new Error` (хорошо), но отсутствие обязательных полей — к `undefined is not an object` в рантайме.

**Рекомендация:** использовать JSON Schema (уже есть в `json-wizard/schemes/`) для валидации при загрузке конфигурации в `loadPageConfig`.

---

### 🟠 Отсутствие документации API компонентов
Есть только `README.md` с форматом JSON. Нет:
- JSDoc для классов и методов
- Описания жизненного цикла компонента
- Инструкции по добавлению нового типа элемента

**Рекомендация:** добавить JSDoc в ключевые файлы и `CONTRIBUTING.md`.

---

### 🟡 Нет обработки ошибок `fetch`
```js
let response = await fetch(`${URL}?name=${configName}`);
let config = await response.json();
```
Если сервер недоступен — необработанное исключение. Лоадер останется на экране навсегда.

**Рекомендация:** обернуть в `try/catch` с показом ошибки пользователю.

---

### 🟡 `clear()` — хрупкая очистка DOM
```js
function clear() {
    let nodes = [...document.body.children].filter((node) => node.nodeName !== "SCRIPT");
    nodes.forEach((node) => node.parentElement.removeChild(node));
}
```
Удаляет всё, кроме `<script>`. Если в `<body>` будут другие элементы (например, `<link>`, модальные окна, тултипы Bootstrap), они будут удалены.

**Рекомендация:** использовать контейнер с известным `id` (например, `<div id="app-root">`) и очищать только его.

---

## 4. Дальнейшее развитие проекта

### 4.1. Краткосрочные улучшения (1-2 недели)

| Приоритет | Задача |
|-----------|--------|
| **P0** | Исправить баги: `valueType='get'` в `PageParam`, глобальный `event` в `cMenu.js`, `FormEditor.js`, утечка обработчиков в `cSideBar.js` |
| **P0** | Привести имена свойств в коде к документации (`elements` → `items`, `options` → `items`) |
| **P1** | Добавить `try/catch` вокруг `fetch` в `loadPageConfig` |
| **P1** | Вынести URL в конфигурацию (`window.__APP_CONFIG__`) |
| **P1** | Заменить `alert('reRender')` и убрать мёртвый код (`ComponentFactory`, `DataSource` в TreeNode) |
| **P1** | Добавить `let` для переменной `tree` в `main.js` |

### 4.2. Среднесрочные улучшения (1-2 месяца)

| Приоритет | Задача |
|-----------|--------|
| **P2** | Внедрить сборщик (Vite) и ES-модули вместо `rigger` |
| **P2** | Добавить unit-тесты (Jest + jsdom) для `PageBuilder`, `BaseElement`, `DataSources`, `PageParam` |
| **P2** | Валидация конфигурации по JSON Schema при загрузке (использовать схемы из `json-wizard/schemes/`) |
| **P2** | Рефакторинг `cMenu.js`: объединить `createMenuItem`/`createSubMenu`, исправить `event` |
| **P2** | Рефакторинг `BaseElement.applyCss`: data-driven применение стилей |
| **P2** | Заменить `insertAdjacentHTML + lastElementChild` на `createElement + appendChild` с сохранением ссылок |
| **P3** | Реализовать `_redirectToURL` в `BaseElement` |
| **P3** | Централизованная диспетчеризация экшенов через `performAnAction` |
| **P3** | Добавить JSDoc ко всем публичным методам |

### 4.3. Долгосрочная дорожная карта (3-6 месяцев)

| Направление | Задачи |
|-------------|--------|
| **Редактор конфигураций** | Доделать `FormEditor`: инлайн-редактирование свойств узла без перезагрузки формы; drag-and-drop узлов; undo/redo; экспорт JSON |
| **Серверная часть** | API для сохранения/загрузки конфигураций; аутентификация; ролевая модель (разные конфигурации для разных пользователей) |
| **Расширяемость** | Плагинная система для компонентов — возможность подключать кастомные типы элементов без изменения ядра |
| **Производительность** | Виртуальный DOM или патчинг для обновления параметров без полной перерисовки; ленивая загрузка конфигураций |
| **i18n** | Вынести все строки UI в словари; поддержка нескольких языков |
| **Документация** | JSDoc + генерация документации; Storybook для компонентов; интерактивные примеры конфигураций |
| **DevOps** | CI/CD пайплайн; линтинг (ESLint); форматирование (Prettier); pre-commit хуки |
| **TypeScript** | Постепенная миграция на TypeScript для типобезопасности конфигураций и компонентов |
| **Мониторинг** | Логирование ошибок на клиенте; сбор метрик производительности рендеринга |

### 4.4. Архитектурные цели

```
Текущее состояние                    Целевое состояние
─────────────────────                ─────────────────────
Глобальные переменные         →      ES-модули + DI-контейнер
Конкатенация (rigger)         →      Сборщик (Vite/webpack)
Vanilla JS + jQuery           →      TypeScript + легковесный UI-фреймворк (или остаться на vanilla)
Нет тестов                    →      80%+ покрытие unit-тестами
Нет валидации                 →      JSON Schema валидация на входе
Хардкод URL                   →      Конфигурация окружения
Мок-данные в коде             →      MSW (Mock Service Worker) для разработки
Ручное управление DOM         →      Компонентный подход с жизненным циклом (create/destroy/update)
```
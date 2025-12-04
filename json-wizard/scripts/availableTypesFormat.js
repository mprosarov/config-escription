const availableFormat = [
  {
    label: "Параметр",
    type: "param",
    parents: ["pageParams"],
  },

  {
    label: "Источник данных",
    type: "dataSource",
    parents: ["dataSources"],
  },
  {
    label: "Заголовок",
    type: "header",
    parents: ["page", "block", "sidebar", "tab", "navbar"],
  },
  {
    label: "Секция",
    type: "block",
    parents: ["page", "block", "sidebar", "tab"],
  },
  {
    type: "sidebar",
    label: "Боковая панель",
    parents: ["sidebars"],
  },
  {
    type: "button-group",
    label: "Группа кнопок",
    parents: ["page", "block", "sidebar", "tab", "navbar"],
  },
  {
    type: "button",
    label: "Кнопка",
    parents: ["page", "block", "sidebar", "tab", "navbar"],
  },
  {
    type: "tabs",
    label: "Табы",
    parents: ["page", "block", "sidebar", "tab", "navbar"],
  },
  {
    type: "tab",
    label: "Таб",
    parents: ["tabs"],
  },
  {
    type: "select",
    label: "Выпадающий список",
    parents: ["page", "block", "sidebar", "tab"],
  },
  {
    type: "table-tabulator",
    label: "Таблица",
    parents: ["page", "block", "sidebar", "tab"],
  },
  {
    type: "radio-group",
    label: "Радиокнопки",
    parents: ["page", "block", "sidebar", "tab", "navbar"],
  },
  {
    type: "checkbox",
    label: "Чекбокс",
    parents: ["page", "block", "sidebar", "tab", "navbar"],
  },
];
console.info(`Доступных элементов для добавления:${availableFormat.length}`);

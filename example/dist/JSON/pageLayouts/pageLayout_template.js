const config = {
  navbar: {
    titlePosition: "right",
    menuPosition: "bottom",
    items: [
      {
        type: "menu",
        items: [
          {
            title: "Главная",
            submenu: [
              {
                title: "Уровень-1.1",
                link: "/",
                submenu: [
                  {
                    title: "Уровень-1-1",
                  },
                ],
              },
              {
                title: "Уровень-1.2",
                link: "/",
                submenu: [
                  {
                    title: "Уровень-1-1",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "button",
        icon: "printer",
        text: "Кнопка",
      },
    ],
  },
  page: [
    {
      type: "button",
      icon: "printer",
      text: "Кнопка",
    },
    {
      type: "menu",
      items: [
        {
          title: "Главная",
          submenu: [
            {
              title: "Уровень-1.1",
              link: "/",
              submenu: [
                {
                  title: "Уровень-1-1",
                },
              ],
            },
            {
              title: "Уровень-1.2",
              link: "/",
              submenu: [
                {
                  title: "Уровень-1-1",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "radio-group",
      name: "radio-name",
      //inline: "form-check-inline", // не обязательный параметр, по умолчанию "false"
      items: [
        {
          id: "r_id_1",
          label: "Радио_1",
          status: "unabled",
          checked: "",
        },
        {
          id: "r_id_2",
          label: "Радио_2",
          status: "unabled",
        },
      ],
    },
    // Таблица
    {
      id: "table_id_8d",
      type: "table-tabulator",
      name: "",
      tdata: {
        data: [{ 1: "Чек-лист" }, { 1: "ОЭФ" }, { 1: "Калькуляция" }],
        layout: "fitColumns",
        resizableRows: true,
        columnHeaderVertAlign: "middle",
        columns: [
          { title: "Подразделение", field: "1" },
          { title: "Проект", field: "2" },
          { title: "Этап", field: "3" },
          { title: "Работа", field: "4" },
          { title: "Статус", field: "5" },
          { title: "Контрагент", field: "6" },
          { title: "ИНН", field: "7" },
          { title: "КПП", field: "8" },
          { title: "№ Родительского договора", field: "9" },
          { title: "Дата родительского договора", field: "10" },
          { title: "Коментарий сотрудника управления", field: "11" },
          { title: "Отправить извещение", field: "12" },
          { title: "Коментарий сотрудника подразделения", field: "13" },
          { title: "Создатель процедуры проверки", field: "14" },
          { title: "Создатель последнего изменения", field: "15" },
          { title: "Дата начала проверки", field: "16" },
          { title: "Дата последнего изменения", field: "17" },
        ],
        renderGorizontal: "virtual",
      },
    },
  ],
};
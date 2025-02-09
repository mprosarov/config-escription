const pageLayout = {
  navbar: [
    {
      name: "Главная",
      type: "title",
      position: "right",
      elemtype: "title",
    },
    {
      name: "",
      icon: "svgPrint",
      class: "secondary",
      elemtype: "button",
      type: "dropdown-button",
      multiselect: false,
      multilevel: false,
      status: "unable",
      items: [
        {
          name: "значение_1",
          value: "",
          type: "link",
          action: {
            params: [],
            func: [],
            url: "",
          },
        },
        {
          name: "значение_2",
          value: "",
          type: "link",
          action: {
            params: [],
            func: [],
            url: "",
          },
        },
      ],
    },
    {
      name: "",
      type: "button-group",
      elemtype: "button-group",
      items: [
        {
          name: "",
          class: "secondary",
          icon: "svgSave",
          action: {
            params: [],
            func: [],
          },
        },
        {
          name: "",
          icon: "svgRefresh",
          class: "secondary",
          action: {
            params: [],
            func: [],
          },
        },
        {
          name: "",
          class: "secondary",
          icon: "svgCancel",
          action: {
            params: [],
            func: [],
          },
        },
      ],
    },
    {
      name: "Проект",
      type: "dropdown",
      elemtype: "link",
      multiselect: false,
      multilevel: true,
      status: "unable",
      items: [
        {
          name: "Тест",
          value: "",
          type: "link",
          action: {
            params: [],
            func: [],
            url: "menu.html",
          },
        },
        {
          name: "ОЭФ",
          value: "",
          type: "dropdown",
          items: [
            {
              name: "Чек-лист",
              value: "",
              type: "link",
              action: {
                params: [],
                func: [],
                url: "oef/checklist.html",
              },
            },
            {
              name: "ОЭФ",
              value: "",
              type: "link",
              action: {
                params: [],
                func: [],
                url: "oef/oef.html",
              },
            },
            {
              name: "Калькуляция",
              value: "",
              type: "link",
              action: {
                params: [],
                func: [],
                url: "oef/calculation.html",
              },
            },
          ],
        },
        {
          name: "Недавно просматриваемые проекты",
          value: "",
          type: "dropdown",
          items: [
            {
              name: "Проект_1",
              value: "",
              type: "link",
              action: {
                params: [],
                func: [],
                url: "",
              },
            },
          ],
        },
      ],
    },
    {
      name: "Конструктор",
      type: "link",
      elemtype: "link",
      status: "unable",
      action: {
        params: [],
        func: [],
        url: "",
      },
    },
    {
      name: "Большой список",
      type: "dropdown",
      elemtype: "link",
      multiselect: false,
      multilevel: true,
      status: "unable",
      items: [
        {
          name: "Значение_1",
          type: "link",
          value: "",
          action: {
            params: [],
            func: [],
            url: "",
          },
        },
        {
          name: "Значение_2",
          value: "",
          type: "dropdown",
          items: [
            {
              name: "Значение_2_1",
              value: "",
              type: "link",
              action: {
                params: [],
                func: [],
                url: "",
              },
            },
            {
              name: "Значение_2_2",
              value: "",
              type: "dropdown",
              items: [
                {
                  name: "Значение_2_2_1",
                  value: "",
                  type: "link",
                  action: {
                    params: [],
                    func: [],
                    url: "",
                  },
                },
              ],
            },
          ],
        },
        {
          name: "Значение_3",
          type: "link",
          value: "",
          action: {
            params: [],
            func: [],
            url: "",
          },
        },
      ],
    },
  ],
  sidebars: [
    {
      type: "sidebar",
      position: "bottom",
      items: [],
    },
    {
      type: "sidebar",
      position: "top",
      items: [
        {
          name: "",
          type: "button-group",
          elemtype: "button-group",
          items: [
            {
              name: "",
              class: "secondary",
              icon: "svgSave",
              action: {
                params: [],
                func: [],
              },
            },
            {
              name: "",
              icon: "svgRefresh",
              class: "secondary",
              action: {
                params: [],
                func: [],
              },
            },
            {
              name: "",
              class: "secondary",
              icon: "svgCancel",
              action: {
                params: [],
                func: [],
              },
            },
          ],
        },
      ],
    },
    {
      type: "sidebar",
      position: "end",
      items: [
        {
          type: "tabs",
          items: [
            {
              type: "tab",
              tab_name: "8(8д)ТЗР11",
              items: [
                {
                  name: "",
                  type: "button-group",
                  elemtype: "button-group",
                  items: [
                    {
                      name: "",
                      class: "secondary",
                      icon: "svgSave",
                      action: {
                        params: [],
                        func: [],
                      },
                    },
                    {
                      name: "",
                      icon: "svgRefresh",
                      class: "secondary",
                      action: {
                        params: [],
                        func: [],
                      },
                    },
                    {
                      name: "",
                      class: "secondary",
                      icon: "svgCancel",
                      action: {
                        params: [],
                        func: [],
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: "tab",
              tab_name: "10(10д)ДЗП",
              items: [
                // {
                //   type: "tabs",
                //   items: [
                //     {
                //       type: "tab",
                //       tab_name: "8(8д)ТЗРasdad",
                //       items: [
                //         {
                //           name: "",
                //           type: "button-group",
                //           elemtype: "button-group",
                //           items: [
                //             {
                //               name: "",
                //               class: "secondary",
                //               icon: "svgSave",
                //               action: {
                //                 params: [],
                //                 func: [],
                //               },
                //             },
                //             {
                //               name: "",
                //               icon: "svgRefresh",
                //               class: "secondary",
                //               action: {
                //                 params: [],
                //                 func: [],
                //               },
                //             },
                //             {
                //               name: "",
                //               class: "secondary",
                //               icon: "svgCancel",
                //               action: {
                //                 params: [],
                //                 func: [],
                //               },
                //             },
                //           ],
                //         },
                //       ],
                //     },
                //     {
                //       type: "tab",
                //       tab_name: "8(8д)ТЗРsadas",
                //       items: [],
                //     },
                //   ],
                // },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "sidebar",
      position: "start",
      items: [],
    },
  ],
  page: [
    {
      name: "",
      type: "button-group",
      elemtype: "button-group",
      items: [
        {
          name: "",
          class: "secondary",
          icon: "svgSave",
          action: {
            params: [],
            func: [],
          },
        },
        {
          name: "",
          icon: "svgRefresh",
          class: "secondary",
          action: {
            params: [],
            func: [],
          },
        },
        {
          name: "",
          class: "secondary",
          icon: "svgCancel",
          action: {
            params: [],
            func: [],
          },
        },
      ],
    },
    {
      type: "tabs",
      items: [
        {
          type: "tab",
          tab_name: "8(8д)ТЗР",
          items: [
            {
              name: "",
              type: "button-group",
              elemtype: "button-group",
              items: [
                {
                  name: "",
                  class: "secondary",
                  icon: "svgSave",
                  action: {
                    params: [],
                    func: [],
                  },
                },
                {
                  name: "",
                  icon: "svgRefresh",
                  class: "secondary",
                  action: {
                    params: [],
                    func: [],
                  },
                },
                {
                  name: "",
                  class: "secondary",
                  icon: "svgCancel",
                  action: {
                    params: [],
                    func: [],
                  },
                },
              ],
            },
          ],
        },
        {
          type: "tab",
          tab_name: "10(10д)ДЗП",
          items: [
            {
              type: "table",
              id: "table_id_8d",
              name: "Расчет-обоснование норматива транспортно-заготовительных затрат",
              indexCols: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10 },
              tdata: {
                data: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                layout: "fitColumns",
                resizableRows: true,
                columnHeaderVertAlign: "middle",
                columns: [
                  { title: "№ п/п", field: "1" },
                  { title: "Вид транспортно-заготовительных затрат", field: "2", hozAlign: "center" },
                  {
                    title: "Отчетный период/период,предшествующий планируемому(год____)",
                    columns: [
                      { title: "Всего транспортно-заготовительных затрат", field: "3" },
                      {
                        title: "из транспортно-заготовительных затрат на:",
                        columns: [
                          { title: "сырье и материалы", field: "4" },
                          { title: "покупные полуфабрикаты", field: "5" },
                          { title: "покупные комплектующие изделия", field: "6" },
                        ],
                      },
                    ],
                  },
                  {
                    title: "Планируемый период(n-ый год____)",
                    columns: [
                      { title: "Всего транспортно-заготовительных затрат", field: "7" },
                      {
                        title: "из транспортно-заготовительных затрат на:",
                        columns: [
                          { title: "сырье и материалы", field: "8" },
                          { title: "покупные полуфабрикаты", field: "9" },
                          { title: "покупные комплектующие изделия", field: "10" },
                        ],
                      },
                    ],
                  },
                ],
                renderGorizontal: "virtual",
              },
            },
            {
              type: "tabs",
              items: [
                {
                  type: "tab",
                  tab_name: "8(8д)ТЗРasdad",
                  items: [
                    {
                      name: "",
                      type: "button-group",
                      elemtype: "button-group",
                      items: [
                        {
                          name: "",
                          class: "secondary",
                          icon: "svgSave",
                          action: {
                            params: [],
                            func: [],
                          },
                        },
                        {
                          name: "",
                          icon: "svgRefresh",
                          class: "secondary",
                          action: {
                            params: [],
                            func: [],
                          },
                        },
                        {
                          name: "",
                          class: "secondary",
                          icon: "svgCancel",
                          action: {
                            params: [],
                            func: [],
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "tab",
                  tab_name: "8(8д)ТЗРsadas",
                  items: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
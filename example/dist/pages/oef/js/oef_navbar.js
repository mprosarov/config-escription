const navbar = [
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
];
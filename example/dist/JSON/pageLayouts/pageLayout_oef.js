const pageLayout = [
    {
      name: "ОЭФ",
      type: "title",
      elemtype: "title",
    },
    {
      id: "sidebarID",
      type: "sidebar",
      elemtype: "sidebar",
      icon: "caret-left.svg",
      position: "top",
    },
    {
      name: "",
      icon: "svgPrint",
      class: "secondary",
      elemtype: "button",
      type: "dropdown",
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
  ];
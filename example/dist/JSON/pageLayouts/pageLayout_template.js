const config = {
  navbar: {
    titlePosition: "left",
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
      },
    ],
  },
};
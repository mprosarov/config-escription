class Menu {
  static TYPE = "menu";
  constructor(parent, menuData) {
    this.menuData = menuData;
    this.parent = parent;
    this.create();
  }

  create() {
    this.parent.insertAdjacentHTML("beforeend", `<div class="navbar navbar-expand"><ul class="navbar-nav mr-auto mb-2 mb-sm-0 flex-row"></ul></div>`);
    const menuContainer = this.parent.lastElementChild.lastElementChild;
    this.menuData.items.forEach((item) => {
      let menuItem = this.createMenuItem(menuContainer, item);
      menuContainer.appendChild(menuItem);
    });
    return menuContainer;
  }

  createMenuItem(parentEl, item) {
    parentEl.insertAdjacentHTML("beforeend", `<li class="nav-item"><a class="nav-link" href="${item.link}">${item.title}</a></li>`);
    const li_element = parentEl.lastElementChild;
    const a_element = li_element.lastElementChild;
    if (!item.submenu || item.submenu.length == 0) return li_element;
    // У пункта есть подменю - добавляем необходимые классы
    li_element.classList.add("dropdown");
    a_element.classList.add("dropdown-toggle");
    a_element.setAttribute("data-bs-toggle", "dropdown");
    a_element.setAttribute("data-bs-auto-close", "outside");
    li_element.insertAdjacentHTML("beforeend", `<ul class="dropdown-menu shadow"></ul>`);
    const submenuContainer = li_element.lastElementChild;
    item.submenu.forEach((subitem) => {
      submenuContainer.appendChild(this.createSubMenu(submenuContainer, subitem));
    });
    li_element.appendChild(submenuContainer);
    return li_element;
  }

  createSubMenu(parentEl, item) {
    parentEl.insertAdjacentHTML(
      "beforeend",
      `<li>
        <a class="dropdown-item" href="${item["link"] || "#"}">${item.title}</a>
      </li>`
    );
    const li_element = parentEl.lastElementChild;
    const a_element = li_element.lastElementChild;
    // Если нет подменю - возвращаем элемент
    if (!item.submenu || item.submenu.length == 0) return li_element;
    // У пункта есть подменю - добавляем необходимые классы
    li_element.classList.add("dropend");
    a_element.classList.add("dropdown-toggle");
    a_element.setAttribute("data-bs-toggle", "dropdown");
    a_element.setAttribute("data-bs-auto-close", "outside");
    li_element.insertAdjacentHTML("beforeend", `<ul class="dropdown-menu dropdown-submenu shadow"></ul>`);
    const submenuContainer = li_element.lastElementChild;
    item.submenu.forEach((subitem) => {
      this.createSubMenu(submenuContainer, subitem);
    });
    return li_element;
  }
}
PageBuilder.addComponent(Menu.TYPE, Menu);
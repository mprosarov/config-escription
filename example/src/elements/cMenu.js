// У конечного пункта могут быть варианты действий (переход на страницу или что-то другое)
// свойство "action": "redirect" - загрузка новой страницы, по имени конфигурации json, указанной в свойстве "config"
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
    parentEl.insertAdjacentHTML("beforeend", `<li class="nav-item"><a class="nav-link" href="${item.config}">${item.title}</a></li>`);
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
        <a class="dropdown-item" href="${item["config"] || "#"}">${item.title}</a>
      </li>`
    );
    const li_element = parentEl.lastElementChild;
    const a_element = li_element.lastElementChild;
    // Если нет подменю - возвращаем элемент
    if (!item.submenu || item.submenu.length == 0){
      //TODO: проверять какое действие нужно делать если нет подменю
      // если есть свойство и  action равно redirect, то загружаем страницу по имени из свойства config
      if(!item['action']||item['action']==''){
        a_element.onclick = () => {
          event.preventDefault();
          PageBuilder.loadPageConfig(item.config);
        };
      }
      
      if(item['action'] == 'redirect'){
        a_element.onclick = () => {
          event.preventDefault();
          if (item["url"]) {
            window.open(item["url"], "_blank").focus();
          } else if (item["url"] == "" && !item['config']) {
            throw new Error(`не указан ни один параметр для перехода (url,config)`);
          }
          if (!item["newtab"]) PageBuilder.loadPageConfig(item.config);
          else {
              let redirectUrl = new URL(window.location.href);
              let searchParams = new URLSearchParams(redirectUrl.search);
              searchParams.set("config", item["config"]);
              redirectUrl.search = searchParams.toString();
              window.open(redirectUrl, "_blank").focus();
          } 
        } 
      }
      return li_element;
    }
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
const PageElement = {
  btnGroup : (function(){
    const _icons = {
      svgPrint: `<svg width="16" height="16" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16">
              <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
              <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
              </svg>`,
      svgSave: `<svg  width="16" height="16" fill="currentColor" class="bi bi-save" viewBox="0 0 16 16">
              <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/>
              </svg>`,
      svgRefresh: `<svg width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>`,
      svgCancel: `<svg  width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
              <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
              </svg>`,
      svgMenu: `<svg width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
              </svg>`,
    };
    function add(parent, obj) {
      let content = "";
      for (let i = 0; i < obj.items.length; i++) content += `<button class="btn btn-outline-${obj.items[i].class} btn-sm" type="button">${_icons[obj.items[i].icon]}</button>`;
      let result = `<div class="input-group">${content}</div>`;
      parent.insertAdjacentHTML("beforeend", result);
    };
    return{ add }
  })(),
  checkbox : (function(){
    function add(parent, obj){
      let content = '';
      content = `<div class="form-check ${obj.class}">
                      <input class="form-check-input"  role="${obj.role}" type=${obj.type} value="" id=${obj.id} ${obj.status} ${obj.checked}>
                      <label class="form-check-label" for=${obj.id}>
                        ${obj.name}
                      </label>
                    </div>`;
      parent.insertAdjacentHTML("beforeend", content);
    }
    return { add }
  })(),
  radio : (function(){
    function add(parent, obj){
      let content = '';
      for(let i=0; i<obj.items.length; i++)
        content += `<div class="form-check ${obj.class}">
                        <input class="form-check-input" type=${obj.type} name=${obj.name} value="" id=${obj.items[i].id} ${obj.items[i].status} ${obj.items[i].checked}>
                        <label class="form-check-label" for=${obj.items[i].id}>
                          ${obj.items[i].name}
                        </label>
                    </div>`;
      parent.insertAdjacentHTML("beforeend", content);
    }
    return { add }
  })(),
  select: (function(){
    function add(parent, obj){
      let content = '';
      for(let i=0; i<obj.items.length; i++)
        content += `<option value=${obj.items[i].value} ${obj.items[i].selected}>${obj.items[i].name}</option>`;
      let result = `<select class="form-select form-select-sm" aria-label=".form-select-sm" >${content}</select>`
      parent.insertAdjacentHTML("beforeend", result);
    }
    return { add }
  })(),
 
}

//Боковые панели
PageElement['sidebars'] = (function(){
    const _allSidebars = [];
    let openCount = 0;
    function _create(parent,obj) {
      let content = `<div class="offcanvas offcanvas-${obj.position}" tabindex="-1">
                        <button style="font-size: 0; z-index: 1060;" data-btn="btn-outline-${obj.position}" class="btn btn-outline-${obj.position} btn-sm" data-type="sidebar" type="button" aria-controls="${obj.id}"></button>
                        <div class="offcanvas-body"></div>
                   </div>`;
      parent.insertAdjacentHTML("beforeend", content);
      //Проходим по дочерним элементам у sidebara
      parentForChild = parent.lastElementChild.querySelector(".offcanvas-body");
      for(let i=0;i<obj.items.length;i++){
        Page.create(parentForChild,obj.items[i]);
      }
      let sidebarBS = new bootstrap.Offcanvas(parent.lastElementChild);
      sidebarBS._element.querySelector(`button[data-type="sidebar"]`).onclick = function () {
        sidebarBS.toggle();
      };
      _allSidebars.push(sidebarBS);
      sidebarBS._element.addEventListener("hidden.bs.offcanvas", (event) => {
        openCount--;
      });
      sidebarBS._element.addEventListener("show.bs.offcanvas", (event) => {
        openCount++;
      });
    }
    function _initEvent(){
      window.addEventListener("click", (e) => {
        if(openCount<2) return;
        if (!e.target.closest(".offcanvas") && !e.target.closest(`[data-type="sidebar"]`)) {
          _allSidebars.forEach((offcanvas) => {
            offcanvas.hide();
          });
        }
      });
    };
    function add(parent, sidebarArr) {
      for (let i = 0; i < sidebarArr.length; i++) {
        _create(parent, sidebarArr[i]);
      }
      _initEvent();
    }
    return {add}
})();

//Табы
PageElement['tabs'] = (function(){
  let globalID = 1;
  function add(parent,tabsConfig) {
    let contentTab, contentUL;
    if(!tabsConfig && !tabsConfig.items) return;
    globalID++;
    parent.insertAdjacentHTML("beforeend", '<ul class="nav nav-tabs" id="myTab" role="tablist"></ul>');
    let tabBox = parent.lastElementChild;
    let tabs = tabsConfig.items;
    for (i in tabs) {
      contentTab = `<li class="nav-item" role="presentation">
                              <button class="nav-link" id="tab-${globalID}-${i}" data-bs-toggle="tab" data-bs-target="#tab-${globalID}-${i}-pane" type="button" role="tab" aria-controls="tab-${globalID}-${i}-pane" aria-selected="false">${tabs[i]["tab_name"]}</button>
                          </li>`;
      tabBox.insertAdjacentHTML("beforeend", contentTab);
    }
    tabBox.firstElementChild.querySelector("button").click();
    parent.insertAdjacentHTML("beforeend", '<div class="tab-content" style="padding: 15px;"></div>');
    let tab = parent.lastElementChild;
    for (i in tabs) {
      if (i < 1) contentUL = `<div class="tab-pane fade show active" id="tab-${globalID}-${i}-pane" role="tabpanel" aria-labelledby="tab-${globalID}-${i}" tabindex="0"></div>`;
      else contentUL = `<div class="tab-pane fade" id="tab-${globalID}-${i}-pane" role="tabpanel" aria-labelledby="tab-${globalID}-${i}" tabindex="0"></div>`;
      tab.insertAdjacentHTML("beforeend", contentUL);
      let cTab = tab.lastChild;
      //console.log(cTab);
      for (let j = 0; j < tabs[i].items.length; j++) {
        let item = tabs[i].items[j];
        Page.create(cTab,item);
        // if (item.type == "table") CreateTable.create(cTab, item);
      }
    }
  }
  return{ add }
})();


/**
 * Модуль, который отвечает за общую разметку страницы
 * секция navpanel в конфигурации - надо бы переименновать в layout или pageLayout
 */
const Page = (function () {
  let _workPlace = document.getElementById("workPlace");
  //===========================================
  // основная функция построения макета
  //============================================
  const create = function (parent,config) {
      let type = config.type;
      switch (type) {
        case 'button-group':
          PageElement.btnGroup.add(parent,config);
          break;
        case "tabs":
          PageElement.tabs.add(parent, config);
          break;
        case "table":
          CreateTable.create(parent, config);
          break;
        case "checkbox":
          PageElement.checkbox.add(parent,config);
        break;
        case "radio":
          PageElement.radio.add(parent,config);
        break
        case "select":
          PageElement.select.add(parent,config);          
        break      
      }
  };
  function getWorkplace() {
    return _workPlace;
  }
  return {
    create,
    getWorkplace,
  };
})();


const NavBar = (function(){
  let _panelBoxContent = null;
  let _buttonForm = null;
  let _dbName = null;
  const _icons = {
    svgPrint: `<svg width="16" height="16" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16">
            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
            </svg>`,
    svgSave: `<svg  width="16" height="16" fill="currentColor" class="bi bi-save" viewBox="0 0 16 16">
            <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/>
            </svg>`,
    svgRefresh: `<svg width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>`,
    svgCancel: `<svg  width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
            <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
            </svg>`,
    svgMenu: `<svg width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
            </svg>`,
  };
  function _initDOM(parent,titlePosition){
    let position = '';
    if(titlePosition=='left') position = '-reverse';
    let panelBox = `<nav class="navbar navbar-expand-sm navbar-light bg-light navbar-light shadow">
                            <div class="container-fluid flex-row${position}">
                                <div class="collapse navbar-collapse">
                                    <div style="display:flex;align-items: start;flex-direction:column">
                                        <ul class="navbar-nav mr-auto mb-2 mb-sm-0" id="navbar-content"></ul>
                                        <ul class="navbar-nav mr-auto mb-2 mb-sm-0" id="buttonForm"></ul>
                                    </div>
                                </div>
                                <a class="navbar-brand" id="dbName"></a>
                            </div>
                        </nav>`;
    parent.insertAdjacentHTML("afterbegin", panelBox);
    _panelBoxContent = document.getElementById("navbar-content");
    _buttonForm = document.getElementById("buttonForm");
    _dbName = document.getElementById("dbName");
  }
  function _showDBName(name) {
    _dbName.innerText = name;
  }
  function _getDropDownContent(target, arr) {
    var content = "",
      ddList = "";
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].type == "dropdown") ddList = _getDropDownContent(target, arr[i][target]);
      if (arr[i].type == "link") {
        ddList = "";
        content += `<li><a class="dropdown-item" href="pages/${arr[i].action.url}">${arr[i].name}</a></li>`;
      }
      if (ddList)
        content += `<li class="dropend">
                                <a href="#" class="dropdown-item dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside">${arr[i].name}</a>
                                <ul class="dropdown-menu dropdown-submenu shadow">${ddList}</ul>
                            </li>`;
    }
    return content;
  }
  function _addDropdown(parent, obj) {
    var dropdownContent = "";
    if (!obj.multilevel) {
      for (let i = 0; i < obj.items.length; i++) {
        dropdownContent += `<li><a class="dropdown-item" href="pages/${obj.items[i].action.url}">${obj.items[i].name}</a></li>`;
      }
    } else dropdownContent = _getDropDownContent("items", obj["items"]);
    let main = "";
    if (obj.elemtype == "button")
      main = `<div class="dropdown me-1">
                        <button type="button" class="btn btn-outline-${obj.class} btn-sm"  data-bs-toggle="dropdown" aria-expanded="false" data-bs-offset="10,20">
                            ${_icons[obj.icon]}
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuOffset">
                        ${dropdownContent}
                        </ul>
                    </div>  `;
    else
      main = `<li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" data-bs-auto-close="outside">${obj.name}</a>
                        <ul class="dropdown-menu shadow">${dropdownContent}</ul>
                    </li>`;
    parent.insertAdjacentHTML("beforeend", main);
  }
  function _addLink(parent, obj) {
    let link = `<li class="nav-item">
                    <a class="nav-link" href="pages/${obj.action.url}">${obj.name}</a>
                </li>`;
    parent.insertAdjacentHTML("beforeend", link);
  }

  function create(parent,navbarItems){
    let titlePosition;
    let title = navbarItems.find((item)=>item.type=='title');
    if(title) titlePosition = title.position;
    else titlePosition = 'right';
    _initDOM(parent, titlePosition);
    for(let i=0;i<navbarItems.length;i++){
      switch (navbarItems[i].type) {
        case "dropdown":
          _addDropdown(_panelBoxContent, navbarItems[i]);
          break;
        case "dropdown-button":
          _addDropdown(_buttonForm, navbarItems[i]);
          break;
        case "link":
          _addLink(_panelBoxContent, navbarItems[i]);
          break;
        case "button-group":
          PageElement.btnGroup.add(_buttonForm, navbarItems[i]);
          break;
        case "title":
          _showDBName(navbarItems[i].name);
          break;

        default:
          break;
      }
    }

  }
  function updateNavbarCssVar(){
    let nav = document.body.querySelector("nav");
    document.documentElement.style.setProperty("--headerHeigth", `${nav.getBoundingClientRect().height}px`);
  }
  return {
    create,
    updateNavbarCssVar
  };
})();
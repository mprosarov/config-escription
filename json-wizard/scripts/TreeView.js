class TreeView {
  constructor(rootSelector, nodeClickHandler) {
    this.container = document.querySelector(rootSelector);
    this.objects = [];
    this.nodeClickHandler = nodeClickHandler;
    this.nodes = [];
    this.initState = {
      dataSources: [],
      pageParams: [],
      navbar: [],
      sidebars: [],
      page: [],
    };
  }
  MAIN_NODES = {
    dataSources: "Источники данных",
    pageParams: "Наборы параметров",
    navbar: "Панель навигации",
    sidebars: "Анимированные панели",
    page: "Основное тело страницы",
  };
  setData(objects) {
    this.objects = objects;
    this.render();
  }
  getNewId() {}
  getIcon(type) {
    switch (type) {
      case "dataSources":
      case "pageParams":
      case "navbar":
      case "sidebars":
      case "page":
        return "fa-regular fa-folder";
      case "param":
        return "fa-solid fa-gears";
      case "sidebar":
        return "fa-solid fa-gears";
      case "button":
        return "fa-solid fa-gears";
      case "tabs":
        return "fa-regular fa-window-restore";
      case "tab":
        return "fa-regular fa-window-maximize";
      case "dataSource":
        return "fa-solid fa-database";
      case "checkbox":
        return "fa-regular fa-square-check";

      case "button-group":
      case "button-group-item":
        return "fa-solid fa-boxes-stacked";

      case "header":
        return "fa-solid fa-h";
      case "block":
        return "fa-brands fa-buromobelexperte";
      default:
        return "fa-regular fa-file";
    }
  }

  render() {
    this.container.innerHTML = "";
    // for (let key in this.MAIN_NODES) {
    //   const item = {
    //     id: key,
    //     text: this.MAIN_NODES[key],
    //     raw: {},
    //     children: [],
    //     type: key,
    //   };
    //   const treeNode = new TreeNode(this, this.container, 0, item);
    //   this.container.appendChild(treeNode.render());
    //   this.nodes.push(treeNode);
    //   this.setNodeClickHandler(treeNode);
    // }
    // return;

    this.objects.forEach((node) => {
      node = new TreeNode(this, this.container, 0, node);
      this.container.appendChild(node.render());
      this.nodes.push(node);
      this.setNodeClickHandler(node);
    });
  }
  setNodeClickHandler(node) {
    const that = this;
    node.setClickHandler(this.nodeClickHandler);
    if (node.treeNodeChildren.length == 0) return;
    node.treeNodeChildren.forEach((item) => {
      this.setNodeClickHandler(item);
      // item.treeNodeChildren.forEach((child) => this.setNodeClickHandler(child));
    });
  }
  getData() {}
  addNode(type, treeNodeParent) {
    const newNode = Utils.getEmptyElementByType(type);
    treeNodeParent.addChild(newNode);
    // treeNodeParent.reRender();
  }
  deleteNode(path) {}
  updateNode(path, newKey, newValue) {}
}

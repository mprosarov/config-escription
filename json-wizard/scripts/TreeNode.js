class ComponentFactory {
  constructor() {}
  createComponent(configComponent) {
    const type = configComponent.type;
    if (!configComponent.type) {
      // console.warn("Компонент не имеет типа");
      return null;
    }
    switch (type) {
      case "dataSource":
        console.log("create DS");
        return new DataSource(configComponent);
      default:
        console.warn("Неизвестный тип");
    }
  }
}
class DataSource {
  constructor(config) {
    this.id = config.id;
    this.type = "dataSource";
    this.query = config.query;
  }
  getJson() {
    return {
      id: this.id,
      query: this.query,
    };
  }
}
const factory = new ComponentFactory();
class TreeNode {
  SELECTED_CLASS = "selectedNode";
  LEVEL_SPACE = 10;
  EXPAND_BUTTON = `<button class="expand tree-button">
            <i class="fa-solid fa-chevron-right"></i>
         </button>`;
  DELETE_BUTTON = `<div class = "delete-item">
        <button class="delete-button">
            <i class="fa-regular fa-trash-can"></i>
         </button></div>`;
  constructor(treeViewInstance, parentDom, level, data) {
    this.treeViewInstance = treeViewInstance;
    this.container = parentDom;
    this.level = level;
    this.node = data;
    //this.nodeClickHandler = nodeClickHandler;
    this.selectedNode = null;
    this.onClickNodeHandler = null;
    this.treeNodeChildren = [];
    this.childContainer = null;
    this.nodeContainer = null;
    // this.component = factory.createComponent(data.raw);
  }
  reRender() {
    alert("reRender");
    this.container.innerHTML = "";
    this.container.appendChild(this.render());
  }
  render() {
    const parentDiv = document.createElement("div");
    this.nodeContainer = parentDiv;
    parentDiv.classList.add("tree-node");
    const div = document.createElement("div");

    parentDiv.appendChild(div);
    const hasChildren = this.node?.children?.length;

    const expand = hasChildren
      ? this.EXPAND_BUTTON
      : `<div class="tree-spacer"></div>`;
    const typeIcon = `<span class="tree-node-icon">
                <i class="${this.treeViewInstance.getIcon(this.node.type)}"></i>
              </span>`;
    const nodeName = `<div class="node-text">${this.node.text}</div>`;

    div.classList.add("tree-node-content");
    div.style.paddingLeft = `${this.LEVEL_SPACE * this.level + 6}px`;
    div.innerHTML = `
        ${expand}
        ${typeIcon}
        ${nodeName}
        ${this.DELETE_BUTTON}`;
    div.addEventListener("click", () => this.nodeClick(div, this));
    this.setExpandClick();
    const deleteButton = div
      .querySelector(".delete-button")
      .addEventListener("click", () => {
        this.handleDeleteClick();
      });
    // const button = div.querySelector(".expand");
    // if (button) button.addEventListener("click", this.expandClick);

    if (hasChildren) {
      this._renderChilds(parentDiv, this.level, this.node.children);
    }
    return parentDiv;
  } //HTMLElement  Возвращает готовый DOM-элемент
  setExpandClick() {
    const button = this.nodeContainer.querySelector(".expand");
    if (button) button.addEventListener("click", this.expandClick);
  }
  setClickHandler(clbk) {
    this.onClickNodeHandler = clbk;
  }
  _getChildContainer() {
    if (!this.childContainer) {
      this.childContainer = document.createElement("div");
      this.childContainer.classList.add("tree-children");
      this.nodeContainer.appendChild(this.childContainer);
    }
    return this.childContainer;
  }
  _checkExpand() {
    if (this.treeNodeChildren.length == 0) {
      this.nodeContainer
        .querySelector(".tree-node-content>.tree-spacer")
        .remove();
      this.nodeContainer
        .querySelector(".tree-node-content")
        .insertAdjacentHTML("afterbegin", this.EXPAND_BUTTON);
      this.setExpandClick();
    }
  }
  addChild(config) {
    this._checkExpand();
    const container = this._getChildContainer();
    const newLevel = this.level + 1;
    const child = new TreeNode(
      this.treeViewInstance,
      container,
      newLevel,
      config
    );
    this.treeNodeChildren.push(child);
    container.appendChild(child.render());
    this.treeViewInstance.setNodeClickHandler(child);
    this.node.children.push(config);
  }
  handleDeleteClick() {
    //TODO  добавить окно подтверждения
    this.nodeContainer.parentNode.removeChild(this.nodeContainer);
  }
  _renderChilds(parent, level, childs) {
    const container = this._getChildContainer();
    const newLevel = level + 1;
    for (let i = 0; i < childs.length; i++) {
      // this.addChild(childs[i]);
      const child = new TreeNode(
        this.treeViewInstance,
        container,
        newLevel,
        childs[i]
      );
      this.treeNodeChildren.push(child);
      container.appendChild(child.render());
    }

    parent.appendChild(container);
  }
  expandClick() {
    const item = event.target.closest("button");
    event.stopPropagation();
    if (!item) return;
    item.classList.toggle("expand");
    item.classList.toggle("unexpand");
    item.querySelector("i").classList.toggle("fa-chevron-right");
    item.querySelector("i").classList.toggle("fa-chevron-down");
    item.parentNode.classList.toggle("expand");
  }
  nodeClick(htmlNode, treeNode) {
    this.unselectAll();
    htmlNode.classList.add(this.SELECTED_CLASS);
    this.treeViewInstance.selectedNode = treeNode;
    if (typeof this.onClickNodeHandler === "function")
      this.onClickNodeHandler(this);
  }

  unselectAll() {
    let selected =
      this.treeViewInstance.container.querySelectorAll(".selectedNode");
    selected.forEach((item) => item.classList.remove("selectedNode"));
  }

  getComponentType() {
    return this.node.type;
  }
  handleExpandClick() {}
  handleEditClick() {}
  updateElement(newData) {}
  getJson() {}
}

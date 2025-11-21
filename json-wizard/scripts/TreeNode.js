class TreeNode {
  SELECTED_CLASS = "selectedNode";
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
  }
  render() {
    const parentDiv = document.createElement("div");
    parentDiv.classList.add("tree-node");
    const div = document.createElement("div");

    parentDiv.appendChild(div);
    const hasChildren = this.node?.children?.length;

    const expand = hasChildren
      ? `<button class="expand tree-button">
            <i class="fa-solid fa-chevron-right"></i>
         </button>`
      : `<div class="tree-spacer"></div>`;
    const typeIcon = `<span class="tree-node-icon">
                <i class="${this.treeViewInstance.getIcon(this.node.type)}"></i>
              </span>`;
    const nodeName = `<div class="node-text">${this.node.text}</div>`;

    div.classList.add("tree-node-content");
    div.style.paddingLeft = `${24 * this.level}px`;
    div.innerHTML = `
        ${expand}
        ${typeIcon}
        ${nodeName}`;
    div.addEventListener("click", () => this.nodeClick(div, this));
    const button = div.querySelector(".expand");
    if (button) button.addEventListener("click", this.expandClick);

    if (hasChildren) {
      this._renderChilds(parentDiv, this.level, this.node.children);
    }
    return parentDiv;
  } //HTMLElement  Возвращает готовый DOM-элемент

  setClickHandler(clbk) {
    this.onClickNodeHandler = clbk;
  }
  _getChildContainer() {
    if (!this.childContainer) {
      this.childContainer = document.createElement("div");
      this.childContainer.classList.add("tree-children");
    }
    return this.childContainer;
  }
  addChild(config) {
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
    this.node.children.push(config);
  }
  _renderChilds(parent, level, childs) {
    const container = this._getChildContainer();
    const newLevel = level + 1;
    for (let i = 0; i < childs.length; i++) {
      console.count();
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
  handleDeleteClick() {}
  updateElement(newData) {}
}

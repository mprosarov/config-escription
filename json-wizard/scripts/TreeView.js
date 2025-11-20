class TreeView {
  SELECTED_CLASS = "selectedNode";

  constructor(rootSelector, nodeClickHandler) {
    this.container = document.querySelector(rootSelector);
    this.objects = [];
    this.nodeClickHandler = nodeClickHandler;
    this.selectedNode = null;
  }
  setData(objects) {
    this.objects = objects;
    this.render();
  }

  getIcon(type) {
    switch (type) {
      case "folder":
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

  createNode(parent, nodeObject, level) {
    const hasChildren = nodeObject.children.length;
    nodeObject.level = level;
    const expand = hasChildren
      ? `<button class="expand tree-button">
            <i class="fa-solid fa-chevron-right"></i>
         </button>`
      : `<div class="tree-spacer"></div>`;
    const typeIcon = `<span class="tree-node-icon">
                <i class="${this.getIcon(nodeObject.type)}"></i>
              </span>`;
    const nodeName = `<div class="node-text">${nodeObject.text}</div>`;
    const node = document.createElement("div");
    node.classList.add("tree-node-content");
    node.style.paddingLeft = `${24 * level}px`;
    node.innerHTML = `
        ${expand}
        ${typeIcon}
        ${nodeName}`;
    node.addEventListener("click", () => this.nodeClick(node, nodeObject));
    nodeObject.dom = node;
    parent.appendChild(node);
    if (hasChildren) {
      node.querySelector("button").addEventListener("click", this.expandClick);
      const div = document.createElement("div");
      div.classList.add("tree-children");
      for (var i = 0; i < hasChildren; i++) {
        this.createNode(div, nodeObject.children[i], level + 1);
      }
      parent.appendChild(div);
    }
  }
  unselectAll() {
    let selected = this.container.querySelectorAll(".selectedNode");
    selected.forEach((item) => item.classList.remove("selectedNode"));
  }
  nodeClick(htmlNode, obj) {
    this.unselectAll();
    htmlNode.classList.add(this.SELECTED_CLASS);
    this.selectedNode = obj;
    this.nodeClickHandler(obj);
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
  render() {
    this.container.innerHTML = "";
    this.objects.forEach((node) => {
      this.createNode(this.container, node, 0);
    });
  }
  getData() {}
  addNode(type, parent) {
    console.log(type, parent);
    const newNode = Utils.getEmptyElementByType(type);
    let childContainer = parent.dom.parentNode.querySelector(".tree-children");
    if (!childContainer) {
      childContainer = document.createElement("div");
    }
    let currentLevel = parent.level;
    this.createNode(childContainer, newNode, (currentLevel += 1));
  }
  deleteNode(path) {}
  updateNode(path, newKey, newValue) {}
}

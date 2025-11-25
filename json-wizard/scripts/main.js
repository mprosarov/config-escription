const selectList = document.getElementById("addTreeNode");
function createSelectList(treeNodeObj) {
  const typeComponent = treeNodeObj.getComponentType();
  selectList.innerHTML = "";
  var options = [];
  for (let i = 0; i < availableFormat.length; i++) {
    if (availableFormat[i]["parents"].includes(typeComponent)) {
      options.push(
        `<li data-type="${availableFormat[i]["type"]}"><a class="dropdown-item"  href="#">${availableFormat[i]?.label}</a></li>`
      );
    }
  }
  selectList.insertAdjacentHTML(
    "beforeend",
    options.length
      ? options.join("")
      : `<li>
        <a class="dropdown-item disabled" href="#">
          нет доступных элементов
        </a>
      </li>`
  );
}

const tree = new TreeView("#tree", clickNode);
// tree.setData(TEST_DATA);
const transformData = Utils.transformToTree(TEST_CONFIG, "NAME_TEST_CONFIG");
tree.setData(transformData);

const availableFormat = [
  {
    label: "параметр",
    type: "param",
    parents: ["pageParams"],
  },

  {
    label: "источник данных",
    type: "dataSource",
    parents: ["dataSources", "pageParams"],
  },
  {
    label: "заголовок",
    type: "header",
    parents: ["page", "block", "sidebar", "tab", "pageParams"],
  },
  {
    label: "секция",
    type: "block",
    parents: ["page", "block", "sidebar", "tab"],
  },
  //   {
  //     type: "sidebar",
  //     parents: [],
  //   },
  //   {
  //     type: "button-group",
  //     parents: [],
  //   },
  //   {
  //     type: "button",
  //     parents: [],
  //   },
  //   {
  //     type: "tabs",
  //     parents: [],
  //   },
  //   {
  //     type: "tab",
  //     parents: [],
  //   },
  //   {
  //     type: "select",
  //     parents: [],
  //   },
  //   {
  //     type: "table-tabulator",
  //     parents: [],
  //   },
  //   {
  //     type: "radio-group",
  //     parents: [],
  //   },
  //   {
  //     type: "checkbox",
  //     parents: [],
  //   },
];
selectList.onclick = function (e) {
  const menuItem = e.target.closest("li");

  if (!menuItem) return;
  const menuElemType = menuItem.dataset?.type;
  if (!menuElemType) return;
  tree.addNode(menuElemType, tree.selectedNode);
};

const FormContainer = (function () {
  const form = document.getElementById("dynamic-form");
  showConfig = (config) => {
    form.innerHTML = JSON.stringify(config, null, 1);
  };
  return { showConfig };
})();

function clickNode(treeNodeObj) {
  console.log("click");
  createSelectList(treeNodeObj);
  FormContainer.showConfig(treeNodeObj.node);
}

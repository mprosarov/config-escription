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
console.log(transformData);
tree.setData(transformData);

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
    // form.innerHTML = JSON.stringify(config, null, 1);
  };
  showSchema = (nodeJson) => {
    const URL = "http://localhost:3000";
    fetch(`${URL}/schemes/${nodeJson.type}.schema.json`)
      .then((res) => res.json())
      .then((data) => showSchemaForm(data, nodeJson));
  };
  return { showConfig, showSchema };
})();

function clickNode(treeNodeObj) {
  createSelectList(treeNodeObj);
  FormContainer.showConfig(treeNodeObj.node);
  FormContainer.showSchema(treeNodeObj.node);
}

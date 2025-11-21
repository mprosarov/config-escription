const Utils = (function () {
  const transformToTree = (config) => {
    let result = [];
    const name = {
      dataSources: "Источники данных",
      pageParams: "Наборы параметров",
      navbar: "Панель навигации",
      sidebars: "Анимированные панели",
      page: "Основное тело страницы",
    };
    for (let key in config) {
      const item = {
        id: key,
        text: name[key],
        raw: {},
        children: [],
        type: key,
      };
      result.push(item);

      var isArray = config[key] instanceof Array;
      if (isArray) {
        if (config[key].length) {
          addChildren(item.children, config[key]);
        }
      } else {
        if (config[key]["items"].length) {
          addChildren(item.children, config[key]["items"]);
        }
      }
    }

    function addChildren(parent, item) {
      for (let i = 0; i < item.length; i++) {
        //if (!item[i]["type"]) console.log(item[i]);
        //--------------Временное решение----------------
        let name = item[i]["id"]
          ? item[i]["id"]
          : item[i]["name"]
          ? item[i]["name"]
          : item[i]["type"];
        //------------------------------------------------
        const child = {
          id: `${item[i]["type"]}_${i}`,
          text: `${name}`,
          //text: `${item[i]["type"]}_${i}`,
          raw: {},
          children: [],
          type: item[i]["type"],
        };
        parent.push(child);
        if (item[i]["items"]?.length) {
          addChildren(child.children, item[i]["items"]);
        }
      }
    }
    return result;
  };
  function getEmptyElementByType(type) {
    return {
      id: "",
      text: type,
      raw: {},
      children: [],
      type: type,
    };
  }
  return {
    transformToTree,
    getEmptyElementByType,
  };
})();
//   {
//     id: "name-config-id-3",
//     text: "page",
//     raw: {},
//     children: [],
//     type: "folder",
// CONTEXT: {
//   roles:...
// }
//   },

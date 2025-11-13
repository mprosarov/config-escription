const TreeView = (function(){
    setIn(obj, path, value) // newObj (Иммутабельное обновление по пути)
    deleteIn(obj, path) // newObj
    getIn(obj, path) // value
    parseValue(rawValue) // value  Пытается определить тип: 123  число, true  boolean, "string"  строка.

})

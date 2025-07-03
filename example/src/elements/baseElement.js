//TODO:Сделоать объект в котором, указано на какое свойсво в конфиге смотреть, для каждого свойства указать какой параметр менять в style,
//какие единицы измерения использовать
/*
{
    configKey:"ИмяКлюча",
    values:[
        {
            configName:"ИмяКлюча",
            styleName:"ИмяСтиля(paddingTop)" ,
            demension:"px",
        }
    ]
}
        "Оформление":{
          "ВнутренниеОтступы":{
            "ВерхнийОтсуп":10,
            "НижнийОтступ":50
          },
          "Цвет":{
            "ЦветФона":"#0000ff",
            "ЦветТекста":"#ff0000"
          }
        }
*/

const CONFIG_PAGE = {
  STYLE: "Оформление",
  PADDING_STYLE: "ВнутренниеОтступы",
  PADDING_TOP: "ВерхнийОтсуп",
  PADDING_BOTTOM: "НижнийОтступ",
  COLOR_STYLE: "Цвет",
  COLOR_BG: "ЦветФона",
  COLOR_TEXT: "ЦветТекста",
  MARGIN_STYLE: "ВнешниеОтступы",
  MARGIN_TOP: "ВерхнийОтсуп",
  MARGIN_LEFT: "ЛевыйОтсуп",
  MARGIN_RIGHT: "ПравыйОтсуп",
  MARGIN_BOTTOM: "НижнийОтступ",
};
class BaseElement {
  constructor(parentElement, config) {
    this.parentElement = parentElement;
    this.config = config;
  }
  static applyCss(element, config) {
    if (!config[CONFIG_PAGE.STYLE]) return;
    const style = config[CONFIG_PAGE.STYLE];
    if (style[CONFIG_PAGE.PADDING_STYLE]) {
      if (style[CONFIG_PAGE.PADDING_STYLE][CONFIG_PAGE.PADDING_TOP]) {
        element.style.paddingTop = style[CONFIG_PAGE.PADDING_STYLE][CONFIG_PAGE.PADDING_TOP] + "px";
      }
      if (style[CONFIG_PAGE.PADDING_STYLE][CONFIG_PAGE.PADDING_BOTTOM]) {
        element.style.paddingBottom = style[CONFIG_PAGE.PADDING_STYLE][CONFIG_PAGE.PADDING_BOTTOM] + "px";
      }
    }
    // Применение цветов
    if (style[CONFIG_PAGE.COLOR_STYLE]) {
      if (style[CONFIG_PAGE.COLOR_STYLE][CONFIG_PAGE.COLOR_BG]) {
        element.style.backgroundColor = style[CONFIG_PAGE.COLOR_STYLE][CONFIG_PAGE.COLOR_BG];
      }
      if (style[CONFIG_PAGE.COLOR_STYLE][CONFIG_PAGE.COLOR_TEXT]) {
        element.style.color = style[CONFIG_PAGE.COLOR_STYLE][CONFIG_PAGE.COLOR_TEXT];
      }
    }
    // Применение внешних отступов
    if (style[CONFIG_PAGE.MARGIN_STYLE]) {
        let marginStyle = style[CONFIG_PAGE.MARGIN_STYLE];
        if(marginStyle[CONFIG_PAGE.MARGIN_TOP]) {
            element.style.marginTop = marginStyle[CONFIG_PAGE.MARGIN_TOP] + "px";
        }
        if(marginStyle[CONFIG_PAGE.MARGIN_BOTTOM]) {
            element.style.marginBottom = marginStyle[CONFIG_PAGE.MARGIN_BOTTOM] + "px";
        }
        if(marginStyle[CONFIG_PAGE.MARGIN_LEFT]) {
            element.style.marginLeft = marginStyle[CONFIG_PAGE.MARGIN_LEFT] + "px";
        }
        if(marginStyle[CONFIG_PAGE.MARGIN_RIGHT]) {
            element.style.marginRight = marginStyle[CONFIG_PAGE.MARGIN_RIGHT] + "px";
        }
    }
  }

  actionRedirect(configAction, paramsObjArr = []){
    let resultParams = [];
    // Собираем "глобальные параметры" страницы, если они есть
    if (paramsObjArr.params?.pageParams) {
      for (let i = 0; i < paramsObjArr.params.pageParams.length; i++) {
        let param = paramsObjArr.params.pageParams[i];
        resultParams.push({
          name: param.pName,
          value: PageBuilder.getParamValue(param.pName),
        });
      }
    };
    resultParams = resultParams.concat(paramsObjArr);
    if(configAction.config) this._redirectConfig(configAction, resultParams);
    else if(configAction.url) this._redirectToURL(configAction, resultParams);
    else{
      throw new Error("Не корректная конфигурация.Неизвестный тип redirect", configAction);
    }
  }

  _redirectConfig(configAction, resultParams = []) {
    if (!configAction["newtab"]) {
      resultParams.push({
        name: "config",
        value: configAction.config,
      });
      PageBuilder.loadWithParams(configAction.config, resultParams);
      return;
    }
    let redirectUrl = new window.URL(window.location.href);
    let searchParams = new URLSearchParams(redirectUrl.search);
    searchParams.set("config", configAction.config);

    resultParams.forEach((p)=>searchParams.set(p.name, p.value));

    redirectUrl.search = searchParams.toString();
    window.open(redirectUrl, "_blank").focus();
  }
  _redirectToURL(configAction, resultParams = []) {
    //TODO: Реализовать редирект по url
    console.log('ПЕРЕАДРЕСАЦИЯ ПО УРЛ', configAction.url);
  }
}

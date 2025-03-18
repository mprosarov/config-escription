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
}

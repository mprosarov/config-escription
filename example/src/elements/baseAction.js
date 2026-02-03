class BaseAction {
  static TYPE = "baseAction";
  constructor(parentElement, config, target) {
    this.parentElement = parentElement;
    this.config = config;
    this.target = target;

    this.create();
  }

  create() {
    //let actions = [];
    //const parentElement = this.parentElement;
    //const config = this.config;

    console.log("////////baseAction START");
    console.log("baseAction parentElement: ", this.parentElement);
    console.log("baseAction config: ", this.config);
    console.log("baseAction target: ", this.target);

    /*this.config.items.forEach(function(item){ 
        switch(item.action){
            case "tabulatorEditAction": new EditAction(parentElement, config); break;
            case "contextMenuAction": new ContextMenuAction(parentElement, config); break;
            case "rederectAction": break;
        }
    })*/
    for (let i = 0; i < this.config.items.length; i++) {
            console.warn("i iteration",this.config.items[i].action)
            switch(this.config.items[i].action){
                case "tabulatorEditAction": new EditAction(this.parentElement, this.config.items[i], this.target); break;
                case "contextMenuAction": new ContextMenuAction(this.parentElement, this.config.items[i]); break;
                case "redirectAction": new RedirectAction(this.parentElement, this.config.items[i], this.target); break;
                case "modalAction": new ModalAction(this.parentElement, this.config.items[i], this.target); break;
                default: console.warn(`BaseAction: Неизвестный тип экшена: ${this.config.items[i].action}`);
            }
        }

    //console.log("actions types: ", actions);
    console.log("Base action class methods: ", BaseAction);
    console.log("////////baseAction END");
    /*actions.forEach(function(action){
        switch()
    })*/

  }
}
PageBuilder.addComponent(BaseAction.TYPE, BaseAction);

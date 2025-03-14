/*
 1. Создать класс который наследуется от класса BaseElement
 2. Создать статическое свойство компонента TYPE, которое соответствует типу(поле typr) компонента в конфигурации.
 3. Переопределить конструктор и передать в конструктор родительского класса параметры элемента.
 4. Переопределить метод создания компонента(create), в котором будет создан элемент и добавлен в родительский элемент.
*/

class SideBar extends BaseElement {
    static TYPE = "sidebar";
    constructor(parentElement, config) {
        super(parentElement, config);
        this.create();
    }

    create() {
        // const _allSidebars = [];
        // let openCount = 0;
        //     let obj = this.config.items
        //   let content = `<div class="offcanvas offcanvas-${obj.position}" tabindex="-1">
        //                     <button style="font-size: 0; z-index: 1060;" data-btn="btn-outline-${obj.position}" class="btn btn-outline-${obj.position} btn-sm" data-type="sidebar" type="button" aria-controls="${obj.id}"></button>
        //                     <div class="offcanvas-body"></div>
        //                </div>`;
        //   this.parentElement.insertAdjacentHTML("beforeend", content);
        //   //Проходим по дочерним элементам у sidebara
        //   parentForChild = this.parentElement.lastElementChild.querySelector(".offcanvas-body");
        //   for(let i=0;i<this.config.items.length;i++){
        //     PageBuilder.create(parentForChild,this.config.items[i]);
        //   }
        //   let sidebarBS = new bootstrap.Offcanvas(this.parentElement.lastElementChild);
        //   sidebarBS._element.querySelector(`button[data-type="sidebar"]`).onclick = function () {
        //     sidebarBS.toggle();
        //   };
        //   _allSidebars.push(sidebarBS);
        //   sidebarBS._element.addEventListener("hidden.bs.offcanvas", (event) => {
        //     openCount--;
        //   });
        //   sidebarBS._element.addEventListener("show.bs.offcanvas", (event) => {
        //     openCount++;
        //   });
       
        // function _initEvent(){
        //   window.addEventListener("click", (e) => {
        //     if(openCount<2) return;
        //     if (!e.target.closest(".offcanvas") && !e.target.closest(`[data-type="sidebar"]`)) {
        //       _allSidebars.forEach((offcanvas) => {
        //         offcanvas.hide();
        //       });
        //     }
        //   });
        // };
        //   _initEvent();

    }
}
PageBuilder.addComponent(SideBar.TYPE, SideBar);
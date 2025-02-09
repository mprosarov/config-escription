function createBody(tabs, parent){
    let page = document.getElementById('workPlace');
    //if(page.innerHTML) return
    let contentTab,contentUL ;
    if(tabs){
        page.insertAdjacentHTML('beforeend', '<ul class="nav nav-tabs" id="myTab" role="tablist"></ul>');
        let tabBox = page.querySelector('.nav-tabs');

        for(i in tabs){
            let k=Number(i)+1;
            if(i<1)
                contentTab = `<li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="tab-${k}" data-bs-toggle="tab" data-bs-target="#tab-${k}-pane" type="button" role="tab" aria-controls="tab-${k}-pane" aria-selected="true">${tabs[i]['tab_name']}</button>
                            </li>`;
            else
                contentTab = `<li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-${k}" data-bs-toggle="tab" data-bs-target="#tab-${k}-pane" type="button" role="tab" aria-controls="tab-${k}-pane" aria-selected="false">${tabs[i]['tab_name']}</button>
                            </li>`
            tabBox.insertAdjacentHTML('beforeend',contentTab);
        }
        page.insertAdjacentHTML('beforeend','<div class="tab-content" style="padding: 15px;" id="myTabContent"></div>');
        let tab = page.querySelector('.tab-content');
        var contentTable = ''
        for(i in tabs){
            let k = Number(i) + 1;
            if (i < 1)
                contentUL = `<div class="tab-pane fade show active" id="tab-${k}-pane" role="tabpanel" aria-labelledby="tab-${k}" tabindex="0"></div>`;
            else
                contentUL = `<div class="tab-pane fade" id="tab-${k}-pane" role="tabpanel" aria-labelledby="tab-${k}" tabindex="0"></div>`;

            tab.insertAdjacentHTML('beforeend', contentUL);
            let cTab = tab.lastChild;
            console.log(cTab)

            for(let j=0; j<tabs[i].items.length;j++)
            {
                let item = tabs[i].items[j];
                if(item.type == "table")
                CreateTable.create(cTab,item)
            }

        }
    }

}

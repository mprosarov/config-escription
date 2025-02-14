const page = [
    {
        type: "tabs",
        items: [
            {
                type: "tab",
                tab_name: "8(8д)ТЗР",
                items: [
                    {
                        type: "table",
                        id: "table_id_8d",
                        name: "Расчет-обоснование норматива транспортно-заготовительных затрат",
                        indexCols: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10 },
                        tdata: {
                            data: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                            layout: "fitColumns",
                            resizableRows: true,
                            columnHeaderVertAlign: "middle",
                            columns: [
                                { title: "№ п/п", field: "1" },
                                { title: "Вид транспортно-заготовительных затрат", field: "2", hozAlign: "center" },
                                {
                                    title: "Отчетный период/период,предшествующий планируемому(год____)",
                                    columns: [
                                        { title: "Всего транспортно-заготовительных затрат", field: "3" },
                                        {
                                            title: "из транспортно-заготовительных затрат на:",
                                            columns: [
                                                { title: "сырье и материалы", field: "4" },
                                                { title: "покупные полуфабрикаты", field: "5" },
                                                { title: "покупные комплектующие изделия", field: "6" },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    title: "Планируемый период(n-ый год____)",
                                    columns: [
                                        { title: "Всего транспортно-заготовительных затрат", field: "7" },
                                        {
                                            title: "из транспортно-заготовительных затрат на:",
                                            columns: [
                                                { title: "сырье и материалы", field: "8" },
                                                { title: "покупные полуфабрикаты", field: "9" },
                                                { title: "покупные комплектующие изделия", field: "10" },
                                            ],
                                        },
                                    ],
                                },
                            ],
                            renderGorizontal: "virtual",
                        },
                    }
                ],
            },

            {
                type: "tab",
                tab_name: "10(10д)ДЗП",
                items: [
                    {
                        id : "table_id_10d",
                        type: "table",
                        name : "Расчет-обоснование1 уровня (%) дополнительной заработной платы основных работников 2, 3, 4",
                        indexCols: {11: "1",22: "2",33: "3",44: "4.1",55: "4.2",66: "5"},
                        tdata : {
                            data: [{},{}],
                            layout: "fitColumns",
                            resizableRows: true,
                            columnHeaderVertAlign: "middle",
                            columns:[
                                {title:"№ п/п",field:"11"},
                                {title:"Наименование",field:"22"},
                                {
                                    title:"Период, предшествующий отчетному ( ____г.)",
                                    columns:[{title:"факт",field:"33"}]
                                },
                                {
                                    title:"Отчетный период / период, предшествующий планируемому ( ____ г.)",
                                    columns:[
                                        {title:"План",field:"44"},
                                        {title:"Факт",field:"55"}
                                    ]
                                },
                                {
                                    title:"Планируемый период",
                                    columns:[{title:"План",field:"66"}]
                                }

                            ],
                            renderGorizontal: "virtual"
                        }
                    },
                    {
                        id : "table_id_10d_2",
                        type: "table",
                        name : "Структура дополнительной заработной платы",
                        indexCols: {11: "1",22: "2",33: "3",44: "4.1",55: "4.2",66: "5"},
                        tdata : {
                            data: [{},{}],
                            layout: "fitColumns",
                            resizableRows: true,
                            columnHeaderVertAlign: "middle",
                            columns:[
                                {title:"№ п/п","field":"11"},
                                {title:"Наименование","field":"22"},
                                {
                                    title:"Период, предшествующий отчетному ( ____г.)",
                                    columns:[{title:"факт",field:"33"}]
                                },
                                {
                                    title:"Отчетный период / период, предшествующий планируемому ( ____ г.)",
                                    columns:[
                                        {title:"План",field:"44"},
                                        {title:"Факт",field:"55"}
                                    ]
                                },
                                {
                                    title:"Планируемый период",
                                    columns:[{title:"План",field:"66"}]
                                }
                            ],
                            renderGorizontal: "virtual"
                        }
                    }
                ],
            },
            {
                type: "tab",
                tab_name: "11ОПР",
                items: [
                    {
                        id : "table_id_11",
                        type: "table",
                        name : "Смета и расчет1, 2 общепроизводственных затрат на _________ год  по _________",
                        indexCols: {11: "1",22: "2",33: "3",44: "4",55: "5",66: "6",77: "7",88: "8",99: "9"},
                        tdata : {
                            data: [{},{}],
                            layout: "fitColumns",
                            resizableRows: true,
                            columnHeaderVertAlign: "middle",
                            columns:[
                                {title:"№ п/п",field:"11"},
                                {title:"Наименование статей",field:"22"},
                                {
                                    title:"Отчетный период / период, предшествующий планируемому (год _____)",
                                    columns:[
                                        {
                                            title:"План",
                                            columns:[
                                                {title:"всего",field:"33"},
                                                {title:"в том числе по госконтрактам (контрактам) ГОЗ",field:"44"}
                                            ]
                                        },
                                        {
                                            "title":"Факт",
                                            "headerHozAlign": "center",
                                            "headerWordWrap": true,
                                            "columns":[
                                                {title:"всего",field:"55"},
                                                {title:"в том числе по госконтрактам (контрактам) ГОЗ",field:"66"}
                                            ]
                                        }
                                    ]
                                },
                                {title:"Применяемый индекс цен","field":"77"},
                                {
                                    title:"Планируемый период (год ____)",
                                    columns:[
                                        {
                                            title:"предложено организацией-поставщиком (подрядчиком, исполнителем)",
                                            columns:[
                                                {title:"всего","field":"88"},
                                                {title:"в том числе по госконтрактам (контрактам) ГОЗ",field:"99"}
                                            ]
                                        }
                                    ]
                                }
                            ],
                            renderGorizontal: "virtual"
                        }
                    }                    
                ],
            },
            {
                type: "tab",
                tab_name: "12ОХР",
                items: [
                    {
                        id : "table_id_12",
                        type: "table",
                        name : "Смета и расчет общехозяйственных затрат / административно-управленческих расходов1, 2 на _________ год по _______________________________",
                        indexCols: {11: "1",22: "2",33: "3",44: "4",55: "5",66: "6",77: "7",88: "8",99: "9"},
                        tdata : {
                            data: [{},{}],
                            layout: "fitColumns",
                            resizableRows: true,
                            columnHeaderVertAlign: "middle",
                            columns: [
                                {title:"№ п/п",field:"11"},
                                {title:"Наименование статей",field:"22"},
                                {
                                    title:"Отчетный период / период, предшествующий планируемому (год _____)",
                                    columns:[
                                        {
                                           title:"План",
                                           columns:[
                                                {title:"всего",field:"33"},
                                                {title:"в том числе по госконтрактам (контрактам) ГОЗ",field:"44"}
                                            ]
                                        },
                                        {
                                            title:"Факт",
                                            columns:[
                                                {title:"всего","field":"55"},
                                                {title:"в том числе по госконтрактам (контрактам) ГОЗ",field:"66"}
                                            ]
                                        }
                                    ]
                                },
                                {headerHozAlign: "center",title:"Применяемый индекс цен","field":"77"},

                                {
                                    title:"Планируемый период (год ____)",
                                    columns:[
                                        {
                                            title:"предложено организацией-поставщиком (подрядчиком, исполнителем)",
                                            columns:[
                                                {title:"всего","field":"88"},
                                                {title:"в том числе по госконтрактам (контрактам) ГОЗ","field":"99"}
                                            ]
                                        }
                                    ]
                                }

                            ],
                            renderGorizontal: "virtual"
                        }
                    }                ],
            },
            {
                type: "tab",
                tab_name: "21 свед.об V поставки",
                items: [
                    {
                        id : "table_id_21",
                        type: "table",
                        name : "Сведения об объемах поставки продукции, в том числе по государственному оборонному заказу, включая экспортные поставки",
                        indexCols: {1: "1",2: "2",3: "3",4: "4",5: "5",6: "6",7: "7",8: "8",9: "9",10: "10",11: "11",12: "12",13: "13",14: "14",15: "15"},
                        tdata : {
                            data: [{},{}],
                            layout: "fitColumns",
                            resizableRows: true,
                            columnHeaderVertAlign: "middle",
                            columns:[
                                {title:"№ строки",field:"1"},
                                {title:"Наименование",field:"2"},
                                {title:"Единица измерения",field:"3"},
                                {
                                    title:"Отчетный за n-ый год(___ г)",
                                    columns:[
                                        {
                                            title:"в целом по предприятию",
                                            columns:[
                                                {title:"план",field:"4"},
                                                {title:"в том числе на экспорт",field:"5"},
                                                {title:"факт",field:"6"},
                                                {title:"в том числе на экспорт",field:"7"}
                                            ]
                                        },
                                        {
                                            title:"в том числе по государственным контрактам (контрактам) ГОЗ",
                                            columns:[
                                                {title:"план",field:"8"},
                                                {title:"в том числе на экспорт",field:"9"},
                                                {title:"факт",field:"10"},
                                                {title:"в том числе на экспорт",field:"11"}
                                            ]
                                        }
                                    ]
                                },                            
                                {
                                    title:"Предусмотрено бизнес-планом на ___ г",
                                    columns:[
                                        {
                                            title:"в целом по предприятию",
                                            columns:[
                                                {title:"план",field:"12"},
                                                {title:"в том числе на экспорт",field:"13"}
                                            ]
                                        },
                                        {
                                            title:"в том числе по государственным контрактам (контрактам) ГОЗ",
                                            columns:[
                                                {title:"план",field:"14"},
                                                {title:"в том числе на экспорт",field:"15"}
                                            ]
                                        }
                                    ]
                                }

                            ],
                            renderGorizontal: "virtual"
                        }
                    }
                ],
            },
            {
                type: "tab",
                tab_name: "22(22д) свед. о норм",
                items: [
                    {
                        id : "table_id_22d",
                        type: "table",
                        name : "Сведения о нормативах и экономических показателях организации, используемых при определении цены продукции на _____г.",
                        indexCols: {11: "1",22: "2",33: "3",44: "4",55: "5"},
                        tdata : {
                            layout:"fitColumns",
                            data: [{},{}],
                            layout: "fitColumns",
                            resizableRows: true,
                            columnHeaderVertAlign: "middle",
                            columns:[
                                {title:"№ п/п",field:"11"},
                                {title:"Наименование",field:"22"},
                                {title:"Единица измерения",field:"33"},
                                {title:"Значение",field:"44"},
                                {title:"Основание",field:"55"}
                            ],
                            renderGorizontal: "virtual"
                        }
                    }                    
                ],
            },
            {
                type: "tab",
                tab_name: "23 труд",
                items: [
                    {
                        id : "table_id_23",
                        type: "table",
                        name : "Расчет (обоснование) трудоемкости",
                        indexCols: {1: "1",2: "2",3: "3",4: "4",5: "5",6: "6",7: "7",8: "8",9: "9",10: "10",11: "11",12: "12",13: "13",14: "14",15: "15",16: "16",17: "17"},
                        tdata : {
                            data: [{},{}],
                            resizableRows: true,
                            columnHeaderVertAlign: "middle",
                            columns:[
                                {title:"№ п/п",field:"1",width:150},
                                {title:"Наименование товаров, работ, услуг",field:"2",width:200},
                                {
                                    title:"Отчетный период/период, предшествующий планируемому(год____)",
                                    columns:[
                                        {
                                            title:"в целом по предприятию",
                                            columns:[
                                                {
                                                    title:"план",
                                                    columns:[
                                                        {title:"технологическая трудоемкость единицы продукции (____)",field:"3",width:250},
                                                        {title:"стоимость _____(руб.)",field:"4","width":250},
                                                        {title:"годовой объем производства (шт.)",field:"5",width:250},
                                                        {title:"технологическая трудоемкость всего",field:"6",width:250},
                                                        {title:"основная заработная плата основных работников",field:"7",width:250}
                                                    ]
                                                },
                                                {
                                                    "title":"факт",
                                                    "columns":[
                                                        {title:"технологическая трудоемкость единицы продукции (____)",field:"8",width:250},
                                                        {title:"стоимость _____(руб.)",field:"9",width:250},
                                                        {title:"годовой объем производства (шт.)",field:"10",width:250},
                                                        {title:"технологическая трудоемкость всего",field:"11",width:250},
                                                        {title:"основная заработная плата основных работников",field:"12",width:250}
                                                    ]
                                                }

                                            ]
                                        }
                                    ]
                                },
                                {
                                    title:"Планируемый период (год____)",
                                    columns:[
                                        {title:"технологическая трудоемкость единицы продукции (____)",field:"13",width:250},
                                        {title:"стоимость _____(руб.)",field:"14",width:250},
                                        {title:"годовой объем производства (шт.)",field:"15",width:250},
                                        {title:"технологическая трудоемкость всего",field:"16",width:250},
                                        {title:"основная заработная плата основных работников",field:"17",width:250}
                                    ]
                                }

                            ],
                            renderGorizontal: "virtual"
                        }
                    }
                ],
            }            
        ],
    },
];
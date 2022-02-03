c.Tabs = ({tabs, child}) => {
    return c.div(data => 
        [
            c.Nav({
                style: {
                    position: 'relative'
                },
                child: [
                    c.div__dflex(
                        tabs.map((itm, key) =>
                            c.div({
                                style: {
                                    padding: '10px',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box',
                                    transition: 'all .5s',
                                    textAlign: 'center',
                                    width: `calc(100% / ${tabs.length})`,
                                    color: data.watch(tabIndex => {
                                        return tabIndex == key ? 'rgb(67,134,204)' : '#444'
                                    })
                                },
                                innerHTML: itm,
                                onclick() {
                                    data.tabIndex = key
                                }
                            })
                        )
                    ),

                    c.div({
                        style: {
                            position: 'absolute',
                            transition: 'all .3s',
                            height: '2px',
                            background: 'rgb(67 134 204)',
                            width: `calc(100% / ${tabs.length})`,
                            left: data.watch(tabIndex => {
                                return `calc(100% / ${tabs.length} * ${tabIndex} )`
                            }),
                        }
                    })
                ]
            }),
            c.div({
                style: {
                    transition: 'all .5s',
                    opacity: [0, 1],
                    transform: ['translateY(30px)', 'translateY(0px)'],
                    padding: '2px 0'
                },
                child: data.watch(tabIndex => {
                    if (typeof child[tabIndex] == 'function'){
                        const tb = w('div')
                        const update = (newIndex = 'pass') => {
                            if (newIndex!='pass'){
                                data.tabIndex = newIndex
                            } else
                                w(tb, {
                                    child: child[tabIndex](update)
                                })
                        }
                        update()
                        return tb
                    } else return child[tabIndex]
                })
            })
    ],
    {
        tabIndex: 0
    }
)}


c.list = ({list = false, blocklist = false}) => 
    c.div({
        style: {
            padding: '5px',
            border: '1px solid #ccc',
            margin: '5px 0',
            borderRadius: '5px'
        },
        child: Array.isArray(blocklist)
            ?blocklist.map(itm => c.div(itm))
            :list
    })


c.btn = ({title, onclick = () => {}}) => {
    const btn = c.button({
        className: 'btn btn-primary btn-sm m-1',
        innerHTML: title,
        onclick
    })

    return btn
}


c.Label = ({ title, input, inputFirst = false, inline = false}) => {
    const wrapper = c.span({
        style: 'padding: 3px 5px',
        child: input
    })

    return c.label({
        style: {
            display: inline?'flex':'block',
            fontSize: '14px',
            marginTop: '10px',
            fontWeight: '600'
        },
        child: [
            inputFirst?wrapper:false,
            w('span', {
                style: {
                    marginBottom: '5px'
                },
                child: title
            }),
            !inputFirst?wrapper:false,
        ]
    })
}


c.Nav = ({child, style = false}) => 
    c.nav__navbar$navbarLight$bgLight(
        c.div__containerFluid(
            c.div({
                style,
                child
            })
        )
    )


c.Table = ({ head = false, body }) => 
    c.table__table([
            head?
            c.thead(
                c.tr(
                    head.map(x => 
                        c.th(x)
                    )
                )
            ):false,
            c.tbody(
                body.map(i => 
                    c.tr(
                        i.map(e => 
                            c.td(e)
                        )
                    )
                )
            ),
        ])


c.FilterTable = ({ head, body, filter_text = '', not_found = false}) => {

    if (filter_text==''){
        const url4 = new URL(location.href)
        const search_text = url4.searchParams.get('search')
        if (search_text)
            filter_text = search_text
    }

    const table_state = widgetstate.use({filter: filter_text})

    return c.div(
        [
            c.div(
                c.input({
                    className: ['form-control'],
                    placeholder: 'filter',
                    style: {
                        display: 'block',
                        margin: '5px 0',
                        boxSizing: 'border-box'
                    },
                    type: 'text',
                    value: table_state.filter,
                    oninput() {
                        table_state.filter = this.value
                        history.pushState({page: 1}, "Поиск: " + this.value, "?search=" + this.value)
                    }
                })
            ),
            c.div(
                table_state.watch(filter => {
                    const filtered_body = body.filter(line => {
                        let cut_line = false;
                        line.map(el => {
                            if (typeof el == 'string')
                                if (el.indexOf(filter) != -1) cut_line = true;
                        })
                        return cut_line;
                    })

                    return filtered_body.length==0
                        ?(not_found
                            ?(typeof not_found == 'function'
                                ?not_found(filter)
                                :not_found)
                            :c.div('not Found: ' + filter))
                        :c.Table({
                            head,
                            body: filter != '' 
                                ?filtered_body.map(line => {
                                    return line.map(el => {
                                        if (typeof el == 'string')
                                            return el.replace(filter, `<span style="background: #bbd6ff">${filter}</span>`)
                                        else
                                            return el
                                    })
                                })
                                :body
                        })
                })
            )
        ]
    )
}


c.Fetch = ({url, body = false, callback = false}) => {
    const element = c.div(
        c.div({
            style: {
                padding: '10px'
            },
            child: 'Подождите...',
            className: 'load'
        })
    )

    fetch(url, 
        {
            ...{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            ...(body
                ?{body: (JSON.stringify(body))}
                :{}
            )
        }
).then(itm => {
        if ('clone' in itm)
            return itm.clone().json().catch(() => itm.text())
        else
            return itm
    }).then(itm => {
        if (typeof callback == 'function')
            itm = callback(itm)
        
        w(element, {
            child: itm
        })
    })

    return element
}



// to use this widget need to include this --> <script src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js"></script>
c.Code = ({code, lang = 'php', oninput = false, onchange = false}) =>
    w('pre', {
        style:{
            borderRadius: '3px',
            padding: '10px'
        },
        contentEditable: true,
        className: [`prettyprint lang-${lang}`],
        innerHTML: code,
        onkeydown(e){
            if (e.keyCode === 9){
                e.preventDefault()
                this.focus()
            }
        },
        oninput(e){
            if (typeof oninput == 'function'){
                const f = oninput.bind(this)
                f(e)
            }
            // __input.code = this.innerText
            PR.prettyPrint()
        },
        oninput(e) {
            if (typeof onchange == 'function') {
                const f = onchange.bind(this)
                f(e)
            }
        }
    })



c.RadioList = ({list, checked = false}) => 
        c.div(
            list.map(itm => c.div([
                    c.label([
                        c.input({
                            type: 'radio',
                            value: itm,
                            name: 'value',
                            style: {
                                marginRight: '10px'
                            },
                            checked: checked==itm
                        }),
                        c.span(itm),
                    ])
                ])
            )
        )



c.CheckboxList = ({list, checked = []}) => 
    c.div(
        list.map(itm => 
            c.Label({
                title: itm,
                input: c.input({
                    type: 'checkbox',
                    value: 'on',
                    name: itm,
                    style: {
                        marginRight: '10px'
                    },
                    checked: checked.indexOf(itm) != -1
                }),
                inputFirst: true,
                inline: true,
            })
        )
    )



c.sortList = ({list}) => {
    return c.div(
        state => state.watch(list => {
            return list.map((itm, key) => {
                return c.div([
                    c.btn({
                        title: 'v',
                        onclick(){

                            temp = list[key]
                            list.set(key, list[key+1])
                            list.set(key+1, temp)

                            return false
                        }
                    }),
                    c.span({innerHTML: itm}),
                    c.input({
                        type: 'hidden',
                        value: itm,
                        name: itm
                    })
                ])
            })
        }),
        {list}
    )
}



c.dragList = ({list}) => {
    return c.div(
        state => state.watch(list => {

            return list.map((itm, key) => {
                return c.div({
                    style: {
                        padding: '10px',
                        border: '1px solid #ccc',
                        margin: '2px',
                        cursor: 'pointer'
                    },
                    child: itm
                })
            })

        }),
        {list}
    )
}


c.Card = ({title, valueElement, button = false}) => 
    c.div__card(
        [
            c.div__cardHeader(
                c.h5__m$$0(title)
            ),
            c.div__cardBody(
                [
                    c.p__cardText(valueElement),
                    button
                ]
            )
        ]
    )



c.Select = ({options, select, onchange}) => 
    c.select({
        child: options.map(itm => {
            return c.option({
                selected: itm == select,
                child: itm
            })
        }),
        onchange
    })


c.ButtonLengthCounterClickReset = ({stateName, prop}) => {
    const state = widgetstate.name(stateName)

    return c.div(
        state.watchEmpty(prop, 
            false,
            c.button({
                child: [
                    c.div({
                        child: 'сброс',
                        style: `
                        margin-right: 4px;
                        border-right: 1px solid #ccc;
                        padding: 0 3px;
                        `
                    }),
                    c.div({
                        child: state.watch(prop, array => array.length),
                        style: 'padding: 0 2px;',
                    })
                ],
                style: `
                    border: 1px solid #ccc;
                    background: #fff;
                    color: #000;
                    border-radius: 10px;
                    display: flex;
                    cursor: pointer;
                `,
                onclick(){
                    state[prop] = []
                }
            })
        
        )
    )
}

c.unitInput = ({value, unitState}) => 
    c.div({
        child: [
            c.input({
                value: widgetstate.name(unitState).model(value),
                className: 'filterInput_f2',
                type: 'number',
            }),
            c.div({
                child: widgetstate.name(unitState).watch('unit'),
                className: 'inputUnit',
            })
        ],
        className: 'inputWrapper',
    })

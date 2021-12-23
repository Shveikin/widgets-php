
c.slider = function({state, title, sliderWidth = 500, range, type = 'float2'}) {


    let globalState = false;
    if (Array.isArray(state)){
        state.forEach(key => {
            if (globalState){
                globalState = globalState[key]
            } else {
                globalState = widgetstate.name(key)
            }
        })
    } else {
        globalState = widgetstate.name(state)
    }
    const min = 0;
    const max = 100;
    const boxsizing = 12

    return c.div({
        style: 'margin-bottom: 20px;',
        child: [
        c.div({
            className: 'title_f2',
            innerHTML: globalState.watch((min, max) => {
                return `${title}: <b>от ${min} до ${max}</b> `
            })
        }),
        c.div({
            dragboard: {
                childs: [
                    c.div({
                        className: 'sliderLine',
                        title: 'DD',
                    }),
                    c.div({
                        className: 'sliderLine',
                        style: globalState.watch((min, max) => {
                            const min_pos = widgetconvertor.map(min, range, [0, sliderWidth]) + (boxsizing /2)
                            const max_pos = widgetconvertor.map(max, range, [0, sliderWidth]) + (boxsizing /2)

                            return `left: ${min_pos}px; width: ${max_pos-min_pos}px; background: rgb(0, 150, 187);`
                        })
                    }),
                ],
                state: globalState,
                drag: {
                    min: c.div({className: 'sliderPoint'}),
                    max: c.div({className: 'sliderPoint'}),
                },
                axis: 'x',
                range,
                width: sliderWidth,
                height: 34,
                boxsizing,
                ondrag(id, x, y, posx, posy){
                    const value = widgetconvertor.roundValue(
                        widgetconvertor.map(x, [0, 100], range),
                        type
                    )
                    
                    if (id==0){
                        globalState.min = value
                    } else {
                        globalState.max = value
                    }
                },
            }
        }),

        c.div({
            style: 'display: flex; justify-content: space-between;',
            child: [
                c.input({
                    type: 'number',
                    className: 'filterInput_f2',
                    value: globalState.model('min')
                }),
                c.input({
                    className: 'filterInput_f2',
                    type: 'number',
                    value: globalState.model('max')
                }),
            ]
        })
    ]})
}
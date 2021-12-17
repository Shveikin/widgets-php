
c.slider = function({state, title, range, sliderWidth = 500, type = 'float2'}) {

    const globalState = widgetstate.name(state)
    const min = 0;
    const max = 100;

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
                        className: 'sliderLine'
                    }),
                    c.div({
                        className: 'sliderLine',
                        style: globalState.watch((min, max) => {
                            const min_pos = widgetconvertor.map(min, [range.min, range.max], [0, sliderWidth])
                            const max_pos = widgetconvertor.map(max, [range.min, range.max], [0, sliderWidth])

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
                range: [0, 200],
                width: sliderWidth,
                height: 34,
                boxsizing: 16,
                ondrag(id, x, y, posx, posy){
                    const value = widgetconvertor.roundValue(
                        widgetconvertor.map(x, [0, 100], [range.min, range.max]),
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
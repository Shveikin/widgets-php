
c.slider = function({state, title, range, sliderWidth = 500, type = 'float2'}) {
    const map = (value, [from, to], [from2, to2]) => (((to2 - from2) / 100) * ((value - from) / ((to - from) / 100))) + from2
    function roundValue(value){
        switch (type) {
            case 'int': return parseInt(value)
            case 'float': return Math.round(value * 10) / 10
            case 'float2': return Math.round(value * 100) / 100
            case 'float3': return Math.round(value * 1000) / 1000
        }
    }

    const globalState = widgetstate.name(state)
    const localState = widgetstate.use({
        min: 0,
        max: 100,

        min_proc: map(globalState.min, [range.min, range.max], [0, 100]),
        max_proc: map(globalState.max, [range.min, range.max], [0, 100]),
        min_pos: Math.floor(map(globalState.min, [range.min, range.max], [0, sliderWidth])),
        max_pos: Math.floor(map(globalState.max, [range.min, range.max], [0, sliderWidth])),

        moveLeft: false,
        moveRight: false,
    })


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
                        style: localState.watch((min_pos, max_pos) => {
                            return `left: ${min_pos}px; width: ${max_pos-min_pos}px; background: rgb(0, 150, 187);`
                        })
                    }),
                ],
                state: {
                    state: localState,
                    values: [
                        'min_proc', 
                        'max_proc'
                    ]
                },
                drag: {
                    10: c.div({className: 'sliderPoint'}),
                    90: c.div({className: 'sliderPoint'}),
                },
                axis: 'x',
                unit: '%',
                width: sliderWidth,
                height: 30,
                boxsizing: 16,
                ondrag(id, x, y, posx, posy){
                    const value = roundValue(map(x, [0, 100], [range.min, range.max]))
                    
                    if (id==0){
                        localState.min_pos = posx +5
                        localState.min_proc = x
                        globalState.min = value
                    } else {
                        localState.max_pos = posx +5
                        localState.max_proc = x
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
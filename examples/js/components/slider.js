
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
        min_pos: Math.floor(map(globalState.min, [range.min, range.max], [0, sliderWidth])),// globalState.min,
        max_pos: Math.floor(map(globalState.max, [range.min, range.max], [0, sliderWidth])),//globalState.max,

        moveLeft: false,
        moveRight: false,
    })

    // console.log('min_pos', localState.min_pos)
    // console.log('max_pos', localState.max_pos)

    return c.div({
        style: 'margin-bottom: 20px;',
        child: [
        c.div({
            innerHTML: globalState.watch((min, max) => {
                return `<b>${title}:</b> от ${min} до ${max} `
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
                drag: {
                    [localState.min_proc]: c.div({className: 'sliderPoint'}),
                    [localState.max_proc]: c.div({className: 'sliderPoint'}),
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
                    className: 'sliderInput',
                    style: localState.check('moveLeft', true, 'border: 1px solid rgb(0, 150, 187)', ''),
                    value: globalState.model('min')//, function(value){
                        // value = parseInt(value)<localState.max_proc
                        //             ?value
                        //             :localState.max_proc

                    //     return roundValue(map(value,[0, 100], [range.min, range.max]))
                    // }
                    
                }),
                c.input({
                    className: 'sliderInput',
                    type: 'number',
                    style: localState.check('moveRight', true, 'border: 1px solid rgb(0, 150, 187)', ''),
                    value: globalState.model('max')
                    // , function(value){
                        // value = parseInt(value)>localState.min_proc
                        //         ?value
                        //         :localState.min_proc

                        // return roundValue(map(value,[0, 100], [range.min, range.max]))
                    // }
                }),
            ]
        })
    ]})
}

c.slider = function({state, title, sliderWidth = 500, sliderType = 'single', type = 'float2'}) {


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

    const range = globalState._range
    const min = 0
    const max = 100
    const boxsizing = 16

    let drag = {}
    let inputs = []

    drag['min'] = c.div({className: 'sliderPoint'})
    inputs.push(
        c.input({
            type: 'number',
            className: 'filterInput_f2',
            value: globalState.model('min')
        })
    )
    if (sliderType!='single'){
        drag['max'] = c.div({className: 'sliderPoint'})
        inputs.push(
            c.input({
                type: 'number',
                className: 'filterInput_f2',
                value: globalState.model('max')
            })
        )
    }



    function getLineBy(index){
        return c.div({
            className: 'sliderLine',
            style: globalState.watch(_slide => {
                let minVal = _slide[index][0]
                let maxVal = _slide[index][1]

                if (minVal=='rangeMin') minVal = globalState._range[0]
                if (maxVal=='rangeMax') maxVal = globalState._range[1]


                const min_pos = widgetconvertor.map(minVal, range, [0, sliderWidth])
                const max_pos = widgetconvertor.map(maxVal, range, [0, sliderWidth + boxsizing])

                return `left: ${min_pos}px; width: ${max_pos-min_pos}px; background: rgb(154 195 219);`
            })
        })
    }


    const back = [
        c.div({
            className: 'sliderLine',
        })
    ];
    if (sliderType=='split'){
        globalState._slide.forEach((index, key) => {
            back.push(getLineBy(key))
        })
    }





    return c.div({
        style: 'margin-bottom: 20px;',
        child: [
        c.div({
            className: 'title_f2',
            innerHTML: globalState.watch((min, max) => {
                if (sliderType=='single'){
                    return `${title}: ${min}`
                } else {
                    return `${title}: <b>от ${min} до ${max}</b> `
                }
            })
        }),
        c.div({
            dragboard: {
                childs: back,
                    // [
                    
                    // c.div({
                    //     className: 'sliderLine',
                    //     style: globalState.watch((min, max) => {
                    //         const min_pos = widgetconvertor.map(min, range, [0, sliderWidth])
                    //         const max_pos = widgetconvertor.map(max, range, [0, sliderWidth + (boxsizing /2)])

                    //         return `left: ${min_pos}px; width: ${max_pos-min_pos}px; background: rgb(0, 150, 187);`
                    //     })
                    // }),
                // ],
                state: globalState,
                drag,
                axis: 'x',
                range,
                width: sliderWidth,
                height: 34,
                useSlide: sliderType=='split',
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
            child: inputs,
        })
    ]})
}
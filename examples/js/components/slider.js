// slider.js

c.slider = function({state, title, sliderWidth = 500, sliderType = 'single', type = 'float2', url}) {

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

    const min = 0
    const max = 100
    const boxsizing = 16

    let drag = {}
    let inputs = []

    drag['min'] = c.div({className: 'sliderPoint'})
    inputs.push(
        c.unitInput({
            value: 'min',
            state: globalState
        })
    )

    if (sliderType!='single'){
        drag['max'] = c.div({className: 'sliderPoint'})
        inputs.push(
            c.unitInput({
                value: 'max',
                state: globalState
            })
        )
    }





    function rangeArray(){
        return [globalState.range_min, globalState.range_max]
    }

    function getLineBy(index){
        return c.div({
            className: 'sliderLine',
            style: globalState.watch((slide_min_start, slide_min_finish, slide_max_start, slide_max_finish) => {
                let minVal = index==0?slide_min_start:slide_max_start;
                let maxVal = index==0?slide_min_finish:slide_max_finish;

                if (minVal=='rangeMin') minVal = globalState.range_min
                if (maxVal=='rangeMax') maxVal = globalState.range_max

                const min_pos = widgetconvertor.map(minVal, rangeArray(), [0, sliderWidth])
                const max_pos = widgetconvertor.map(maxVal, rangeArray(), [0, sliderWidth + boxsizing])

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
        back.push(getLineBy(0))
        back.push(getLineBy(1))
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
                style: 'display: flex; justify-content: space-between; margin-bottom: -10px; margin-top: 5px;',
                child: [
                    globalState.watch((range_min, unit) => `от ${range_min} ${unitToRu(unit)}`),
                    globalState.watch((range_max, unit) => `до ${range_max} ${unitToRu(unit)}`),
                ],
            }),
            c.div({
                dragboard: {
                    childs: back, // Статические элементы
                    state: globalState,
                    drag: drag, // Динамические элементы 
                    axis: 'x',
                    range: ['range_min', 'range_max'],
                    width: sliderWidth,
                    height: 34,
                    useSlide: sliderType=='split',
                    boxsizing,
                    
                    ondrag(id, x, y, posx, posy){
                        const value = widgetconvertor.roundValue(
                            widgetconvertor.map(x, [0, 100], rangeArray()),
                            type
                        )
                        
                        if (id==0){
                            globalState.min = value
                        } else {
                            globalState.max = value
                        }

                        widgetstate.name('filter').inside('_view', url)
                    },
                }
            }),

            c.div({
                style: 'display: flex; justify-content: space-between;',
                child: inputs,
            })
        ]
    })
    }

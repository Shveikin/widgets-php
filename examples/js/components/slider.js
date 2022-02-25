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



    function rangeArray(){
        return globalState.__translate[globalState.unit]
    }

    function convertToCurrentUnit(value){
        return widgetconvertor.map(
            value, 
            globalState.__translate[globalState.default_unit], 
            globalState.__translate[globalState.unit]
        ).toFixed(2)
    }

    // globalState.watch('unit').link(function(unit){
    //     globalState.range_min = globalState.__translate[unit][0];
    //     globalState.range_max = globalState.__translate[unit][1];
    // })

    function getPointTitle(value, unit, default_unit){
        return default_unit==unit
                    ?`${value} ${unitToRu(unit)}`
                    :c.div([
                        c.div({
                            child: `${value} ${unitToRu(default_unit)}`,
                            style: 'color: #ccc'
                        }), 
                        c.div(`${convertToCurrentUnit(value)} ${unitToRu(unit)}`)
                    ])
    }


    drag['min'] = c.div({
        child: c.div({
            child: globalState.watch((min, unit, default_unit) => 
                getPointTitle(min, unit, default_unit)
            ),
            className: 'sliderPointTitle',
            
            style: sliderType=='single'
                ?false
                :globalState.watch((min, max, range_min, range_max, unit, default_unit) => {
                    const c100 = range_max - range_min
                    const cRange = max - min

                    return cRange<c100 / 5
                    ?default_unit==unit
                        ?'bottom: 35px'
                        :'bottom: 50px'
                    :''
                })

        }),
        className: 'sliderPoint',
    })


    inputs.push(
        c.unitInput({
            value: 'min',
            state: globalState
        })
    )

    if (sliderType!='single'){
        drag['max'] = c.div({
            child: c.div({
                child: globalState.watch((max, unit, default_unit) => 
                    getPointTitle(max, unit, default_unit)
                ),
                className: 'sliderPointTitle',
            }),
            className: 'sliderPoint',
        })
        inputs.push(
            c.unitInput2({
                value: 'max',
                state: globalState
            })
        )
    }





    function getLineBy(index){
        return c.div({
            className: 'sliderLine',
            style: globalState.watch((slide_min_start, slide_min_finish, slide_max_start, slide_max_finish) => {
                let minVal = index==0?slide_min_start:slide_max_start;
                let maxVal = index==0?slide_min_finish:slide_max_finish;

                if (minVal=='rangeMin') minVal = globalState.__translate[globalState.default_unit][0]
                if (maxVal=='rangeMax') maxVal = globalState.__translate[globalState.default_unit][1]

                const min_pos = widgetconvertor.map(minVal, globalState.__translate[globalState.default_unit], [0, sliderWidth])
                const max_pos = widgetconvertor.map(maxVal, globalState.__translate[globalState.default_unit], [0, sliderWidth + boxsizing])

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
        style: 'margin: 40px 0 20px 0px;',
        child: [
            
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
                            widgetconvertor.map(x, [0, 100], globalState.__translate[globalState.default_unit]),
                            type
                        )

                        
                        if (id==0){
                            globalState.min = value
                        } else {
                            globalState.max = value
                        }

                        widgetstate.name('eye').inside('_view', url)
                    },
                }
            }),

            c.div({
                style: 'display: flex; justify-content: space-between; margin-bottom: 5px; color: rgb(157,157,157);',
                child: [
                    globalState.watch((unit) => `<span class='brekts'>|</span> от ${globalState.__translate[globalState.unit][0]} ${unitToRu(unit)}`),
                    globalState.watch((unit) => `до ${globalState.__translate[globalState.unit][1]} ${unitToRu(unit)} <span class='brekts'>|</span>`),
                ],
            }),

            c.div({
                style: 'display: flex; justify-content: space-between;',
                child: inputs,
            })
        ]
    })
}

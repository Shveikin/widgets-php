
c.slider = function({state, title, min, max}) {
    const sliderStateName = state
    widgetstate.use({
        _name: sliderStateName,
        min: 0,
        max: 100,
        min_temp: 0,
        max_temp: 80,
        moveLeft: false,
        moveRight: false,
    })

    return c.div({
        style: 'margin-bottom: 20px;',
        child: [
        c.div({
            innerHTML: widgetstate.name(sliderStateName).watch((min_temp, max_temp) => {
                return `<b>${title}:</b> от ${min_temp} до ${max_temp} `
            })
        }),// 'Температура',
        c.div({
            style: `
                position: relative;
                padding: 20px;
            `,
            onmouseleave(){
                widgetstate.name(sliderStateName).moveLeft = false;
                widgetstate.name(sliderStateName).moveRight = false;
            },
            onmouseup(){
                widgetstate.name(sliderStateName).moveLeft = false;
                widgetstate.name(sliderStateName).moveRight = false;
            },
            onmousemove(){
                // dragElement(this, function(e){
                //     console.log(e)
                // })
            },
            child: [
                c.div([
                    c.div({
                        className: 'sliderLine'
                    }),
                    c.div({
                        className: 'sliderLine',
                        style: widgetstate.name(sliderStateName).watch((min_temp, max_temp) => {
                            return `left: ${min_temp}px; width: ${max_temp-min_temp}px; background: rgb(0, 150, 187);`
                        })
                    }),
                ]),
                c.div({
                    className: 'sliderPoint',
                    style: widgetstate.name(sliderStateName).watch(min_temp =>  `left: ${min_temp}px`),
                    onmousedown(){
                        widgetstate.name(sliderStateName).moveLeft = true;
                    },
                    onmouseup(){
                        widgetstate.name(sliderStateName).moveLeft = false;
                    },
                    // dragElement: {
                    //     border: 'parent',
                    //     only: 'x',
                    //     checkState: sliderStateName,
                    //     checkStateValue: 'moveLeft',
                    //     onSetValue(x){

                    //     }
                    // }
                }),
                c.div({
                    className: 'sliderPoint',
                    style: widgetstate.name(sliderStateName).watch(max_temp =>  `left: ${max_temp}px`),
                    onmousedown(){
                        widgetstate.name(sliderStateName).moveRight = true;
                    },
                    onmouseup(){
                        widgetstate.name(sliderStateName).moveRight = false;
                    }
                }),
            ]
        }),
        c.div({
            style: 'display: flex; margin-top: 20px; justify-content: space-between;',
            child: [
                c.input({
                    type: 'number',
                    className: 'sliderInput',
                    style: widgetstate.name(sliderStateName).check('moveLeft', true, 'border: 1px solid rgb(0, 150, 187)', ''),
                    value: widgetstate.name(sliderStateName).model('min_temp', function(value){
                        return parseInt(value)<widgetstate.name(sliderStateName).max_temp
                                ?value
                                :widgetstate.name(sliderStateName).max_temp
                    })
                }),
                c.input({
                    className: 'sliderInput',
                    type: 'number',
                    style: widgetstate.name(sliderStateName).check('moveRight', true, 'border: 1px solid rgb(0, 150, 187)', ''),
                    value: widgetstate.name(sliderStateName).model('max_temp', function(value){
                        return parseInt(value)>widgetstate.name(sliderStateName).min_temp
                                ?value
                                :widgetstate.name(sliderStateName).min_temp
                    })
                }),
            ]
        })
    ]})
}
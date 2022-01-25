
class widgetsmartprops {


    static dragboard(dragboard, props) {
        let mouseDown = false
        let mouseDownPosition = []
        const elements = []
        const boxsizing = {
            x: props.boxsizing?(props.boxsizing.x?props.boxsizing.x:props.boxsizing):0,
            y: props.boxsizing?(props.boxsizing.y?props.boxsizing.y:props.boxsizing):0,
        }

        const width = props.width/* ?props.width + boxsizing.x:0 */
        const height = props.height/* ?props.height + boxsizing.y:0 */



        dragboard.rootElement.style.position = 'relative'
        dragboard.rootElement.style.userSelect = 'none'
        dragboard.rootElement.style.width = width + boxsizing.x + 'px'
        dragboard.rootElement.style.height = props.height + 'px'

        if ('childs' in props) {
            const widgets = widgetconvertor.toArrayOfWidgets(props.childs);
            widgets.forEach(widget => {
                dragboard.rootElement.appendChild(
                    widgetdom.createElement(widget)
                )
            })
        }

        function rangeArray(){
            return [props.state.range_min, props.state.range_max]
        }

        console.log('props.range', rangeArray())

        let shift = false;


        let sliderMoveRange = {
            x: {min: 0, max: props.width },
            y: {min: 0, max: props.height},
        }

        if (props.useSlide){
            props.state.watch(['slide_min_start', 'slide_min_finish', 'slide_max_start', 'slide_max_finish']).link(
            function(slide_min_start, slide_min_finish, slide_max_start, slide_max_finish){
                // const rangeList = [0, 1].map(range => {
                //     let min = slide[range][0];
                //     let max = slide[range][1];
                //     if (min=="rangeMin")
                //         min = props.state.range_min
                //     if (max=="rangeMax")
                //         max = props.state.range_max

                //     const x_range = {
                //         min: widgetconvertor.map(min, rangeArray(), [0, props.width]),
                //         max: widgetconvertor.map(max, rangeArray(), [0, props.width]),
                //     }

                //     return {
                //         x: x_range
                //     }

                // })

                if (slide_min_start=="rangeMin")
                    slide_min_start = props.state.range_min


                if (slide_max_finish=="rangeMax")
                    slide_max_finish = props.state.range_max





                sliderMoveRange = [
                    {
                        x: {
                            min: widgetconvertor.map(slide_min_start, rangeArray(), [0, props.width]),
                            max: widgetconvertor.map(slide_min_finish, rangeArray(), [0, props.width]),
                        }
                    },
                    {
                        x: {
                            min: widgetconvertor.map(slide_max_start, rangeArray(), [0, props.width]),
                            max: widgetconvertor.map(slide_max_finish, rangeArray(), [0, props.width]),
                        }
                    }
                ]
                

                // sliderMoveRange = rangeList
            })
        }


        function mousemove(x, y){
            let posx, posy = 0

            const range = Array.isArray(sliderMoveRange)?sliderMoveRange[mouseDown]:sliderMoveRange

            if (props?.axis != 'y'){
                posx = (parseInt(elements[mouseDown].style.left) + x)
                if (posx>range.x.max)
                    posx = range.x.max
                if (posx < range.x.min)
                    posx = range.x.min
                elements[mouseDown].style.left = posx + 'px'
            }
            if (props?.axis != 'x'){
                posy = (parseInt(elements[mouseDown].style.top) + y)
                if (posy>range.y.max)
                    posy = range.y.max
                if (posy < range.y.min)
                    posy = range.y.min
                elements[mouseDown].style.top = posy + 'px'
            }

            if (typeof props.ondrag == 'function'){
                let valposx = posx
                let valposy = posy

                valposx = widgetconvertor.map(posx, [0, width],  [0, 100])
                valposy = widgetconvertor.map(posy, [0, height], [0, 100])
                props.ondrag(mouseDown, valposx, valposy, posx, posy)
            }
        }

        const dragType = widgetconvertor.getType(props.drag)
        let widgets = []
        switch (dragType){
            case 'Object': 
                widgets = Object.values(props.drag)
                shift = Object.keys(props.drag)
            break;
            default: 
                widgets = props.drag
            break;  
        }

        function shiftXY(shiftVal){
            let left = 0
            let top = 0
            if (props?.axis != 'y')
                left = shiftVal

            if (props?.axis != 'x')
                top = shiftVal

            left = widgetconvertor.map(left, rangeArray(), [0, width])
            top =  widgetconvertor.map(top, rangeArray(), [0, height])

            return [left, top]
        }

        widgets = widgetconvertor.toArrayOfWidgets(widgets)
        widgets.forEach((widget, key) => {
            const dragElement = widgetdom.createElement(widget)
            dragElement.style.position = 'absolute'
            if (shift){
                if ('state' in props) {
                    props.state.watch([shift[key], 'range_' + shift[key]]).link(function(newValue){
                        if (mouseDown===false){
                            const left = widgetconvertor.map(newValue, rangeArray(), [0, props.width])
                            dragElement.style.left = left + 'px';
                        }
                    })
                } else {
                    const [left, top] = shiftXY(shift[key])
                    dragElement.style = `position: absolute; left: ${left}px; top: ${top}px`;
                }
            } else {
                dragElement.style = 'position: absolute; left: 0px; top: 0px';
            }

            dragElement.onmousedown = (event) => {
                mouseDownPosition = [event.screenX, event.screenY]; 
                mouseDown = key
            }

            dragboard.rootElement.onmousemove = (event) => {
                if (mouseDown!==false){
                    let x = event.screenX - mouseDownPosition[0]
                    let y = event.screenY - mouseDownPosition[1]
                    

                    

                    mousemove(x, y);
                    mouseDownPosition = [event.screenX, event.screenY];
                }
            }

            dragboard.rootElement.onmouseup = () => { mouseDown = false }
            dragboard.rootElement.onmouseleave = () => { mouseDown = false }

            dragboard.rootElement.appendChild(dragElement)
            elements.push(dragElement)
        })
        // console.log(widget, props)
    }
}
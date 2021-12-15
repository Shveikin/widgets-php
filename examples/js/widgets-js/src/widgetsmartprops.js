
class widgetsmartprops {


    static dragboard(dragboard, props) {
        let mouseDown = false
        let mouseDownPosition = []
        const elements = []
        const boxsizing = {
            x: props.boxsizing?(props.boxsizing.x?props.boxsizing.x:props.boxsizing):0,
            y: props.boxsizing?(props.boxsizing.y?props.boxsizing.y:props.boxsizing):0,
        }

        const width = props.width?props.width:0
        const height = props.height?props.height:0



        dragboard.rootElement.style.position = 'relative'
        dragboard.rootElement.style.userSelect = 'none'
        dragboard.rootElement.style.width = width + 'px'
        dragboard.rootElement.style.height = height + 'px'

        if ('childs' in props) {
            const widgets = widgetconvertor.toArrayOfWidgets(props.childs);
            widgets.forEach(widget => {
                dragboard.rootElement.appendChild(
                    widgetdom.createElement(widget)
                )
            })
        }



        let shift = false;

        function mousemove(x, y){
            let posx, posy = 0
            if (props?.axis != 'y'){
                posx = (parseInt(elements[mouseDown].style.left) + x)
                elements[mouseDown].style.left = posx + 'px'
            }
            if (props?.axis != 'x'){
                posy = (parseInt(elements[mouseDown].style.top) + y)
                elements[mouseDown].style.top = posy + 'px'
            }

            if (typeof props.ondrag == 'function'){
                let valposx = posx
                let valposy = posy

                if (props?.unit == '%'){
                    valposx = posx / ((width - boxsizing.x) / 100)
                    valposy = posy / ((height - boxsizing.y) / 100)
                }
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

        widgets = widgetconvertor.toArrayOfWidgets(widgets)
        widgets.forEach((widget, key) => {
            
            const dragElement = widgetdom.createElement(widget)
            if (shift){
                let left = 0
                let top = 0
                if (props?.axis != 'y')
                    left = shift[key]

                if (props?.axis != 'x')
                    top = shift[key]

                if (props?.unit == '%'){
                    left = ((width - boxsizing.x) / 100) * left
                    top = ((height - boxsizing.y) / 100) * top
                }
                dragElement.style = `position: absolute; left: ${left}px; top: ${top}px`;
            } else {
                dragElement.style = 'position: absolute; left: 0px; top: 0px';
            }
            dragElement.onmousedown = (event) => {
                mouseDownPosition = [event.screenX, event.screenY]; 
                mouseDown = key
            }
            
            

            dragboard.rootElement.onmousemove = (event) => {
                if (mouseDown!==false){
                    mousemove(event.screenX - mouseDownPosition[0], event.screenY - mouseDownPosition[1]);
                    mouseDownPosition = [event.screenX, event.screenY];
                }
            }

            dragboard.rootElement.onmouseup = () => {mouseDown = false}
            dragboard.rootElement.onmouseleave = () => { mouseDown = false }
            

            dragboard.rootElement.appendChild(dragElement)
            elements.push(dragElement)
        })
        // console.log(widget, props)
    }
}
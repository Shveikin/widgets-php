
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



        let shift = false;

        function mousemove(x, y){
            if (props?.axis != 'y')
                elements[mouseDown].style.left = (parseInt(elements[mouseDown].style.left) + x) + 'px'
            if (props?.axis != 'x')
                elements[mouseDown].style.top = (parseInt(elements[mouseDown].style.top) + y) + 'px'
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
// c.js

const c = new Proxy({}, {
	get:(_, _type) => {
        if (typeof widgettools[_type] == 'function')
            return widgettools[_type]
        else
            return (source) => {
                if (_type in widgetdom.widgetStore)
                    return widgetdom.widgetStore[_type](source)
                
                const id = widgetdom.getId()

                const [type, props, childs] = widgetconvertor.distribution(_type, source)
                return {
                    id,
                    type,
                    props,
                    childs,
                }
            }
    },
    set:(_, _type, element) => widgetdom.widgetRegister(_type, element)
})
// widgetconvertor.js
class widgetconvertor {

	static singleElement = {
		area: false,
		base: false,
		br: false,
		col: false,
		embed: false,
		hr: false,
		img: 'src',
		input: 'value',
		textarea: 'innerHTML',
		link: 'href',
		menuitem: false,
		meta: false,
		param: false,
		source: false,
		track: false,
		wbr: false,
	}

	static distribution(type, source = {}){
		let props = {}
		let childs = []
		
		const childElements = ['child', 'childs', 'element']

		const sourceType = widgetconvertor.getType(source)
		switch (sourceType) {
			case 'String':
			case 'Int':
				let property = 'innerHTML';
				if (type in widgetconvertor.singleElement){
					property = widgetconvertor.singleElement[type]
				}
				props[property] = source
			break;
			case 'WidgetTools':
				childs = source
			break;
			case 'Array':
				childs = widgetconvertor.toArrayOfWidgets(source)
			break;
			case 'Element':
				type = source.element
			case 'Object':
				// if ('type' in source){
				// 	type = source['type']
				// }
				Object.keys(source).forEach(prop => {
					if (childElements.includes(prop)){
						if (prop!='element'){

							if (type in widgetconvertor.singleElement){
								const property = widgetconvertor.singleElement[type]
								props[property] = source[prop]
							} else {
								childs = widgetconvertor.toArrayOfWidgets(source[prop])
							}

						}
					} else {
						props[prop] = source[prop]
					}
				})
			break;
			case 'Widget':
			case 'WidgetTools':
			case 'State':
				childs = [source]
			break;
		}

		return [type, props, childs]
	}



    static convert(element, from, to, state = false){
		if (from == to){
			return element
		}
        const func = `${from}To${to}`
		
        if (func in widgetconvertor){
			const result = widgetconvertor[func](element, state)
			const newType = widgetconvertor.getType(result)
			if (newType==to){
				return result;
			} else {
				return widgetconvertor.convert(result, newType, to)
			}
        } else {
            throw new Error(`${func} отсутствует!`);
        }
    }


	static toArrayOfWidgets(element){
		if (!Array.isArray(element))
			element = [element]

		const result = []
		element.forEach(source => {
			const sourceType = widgetconvertor.getType(source)
			switch (sourceType) {
				case 'Widget':
					result.push(source)
				break;
				default:
					result.push(c.div(source))
				break;
			}
		})

		return result
	}


    static getType(element){
		let type = 'Unknown'
        if (Array.isArray(element))
			type = 'Array'
		else
        if (typeof element == 'object'){
			type = 'Object'
			
			if ('type' in element && 'props' in element && 'childs' in element)
				type = 'Widget'
			else
			if ('link' in element)
				type = 'State'
			else
			if ('element' in element)
				type = 'Element'
				if (typeof widgettools[element.element] === 'function'){
					type = 'WidgetTools'
				}
		} else
		if (typeof element=='string')
			type = 'String'
		else
		if (typeof element=='number')
			type = 'Int'
		else
		if (element instanceof HTMLElement || element instanceof Text)
			type = 'HTML'
		else
		if (typeof element == 'function')
			type = 'Function'
		if (typeof element == 'boolean')
			type = 'Bool'
		
		return type;
	}


    static checkState(widget, prop){

        let value = prop!='childs'?widget.props[prop]:widget.childs
		if (prop=='childs' && (!('rootElement' in widget))){
			widget.rootElement = document.createElement(widget.type)
		}

		let change = false;
		if (widgetconvertor.getType(value)=='WidgetTools'){
			value = widgettools.create(value)
			change = true
		}

		if (widgetconvertor.getType(value)=='State'){
			value = widgetstate.inspector(value, widget, prop)
			change = true
			// return [true, false]
		}

		return [change, value]
	}






	static toFunction(element){
		return widgetconvertor.convert(element, widgetconvertor.getType(element), 'Function')
	}

	static WidgetToolsToFunction(WidgetTool){
		return widgettools.create(WidgetTool)
	}

	static StateToFunction(State){
		return State.link
	}
}
// widgetdom.js

class widgetdom {

    static ids = {}
    static idCounter = 0

    static getId(){
        return widgetdom.idCounter++;
    }

    /**
     * CREATE ELEMENT
     */
    static createElement(widget){
        if (widget.type in widgetdom.widgetStore){
            widget = widgetdom.widgetStore[widget.type](widget.props)
        }
        const rootElement = document.createElement(widget.type);
        widget.rootElement = rootElement


        if (widget.props)
        Object.keys(widget.props).forEach(prop => {
            if (prop in widgetsmartprops){
                widgetsmartprops[prop](widget, widget.props[prop])
            } else {
                widgetdom.assignProp(widget, prop)
            }
        });

        if (Array.isArray(widget.childs)){
            widget.childs.forEach(childWidget => {
                const childElement = widgetdom.createElement(childWidget)
                rootElement.appendChild(childElement)
            })
        } else {
            const childType = widgetconvertor.getType(widget.childs)
            let value = ''
            const [change, newValue] = widgetconvertor.checkState(widget, 'childs')
            if (change) value = newValue

            if (!('childs' in widget)) widget.childs = {}
            widget.childs.view = [c.div(value)]
            rootElement.appendChild(
                widgetdom.createElement(widget.childs.view[0])
            )

        }

        return rootElement
    }


    /**
     * UPDATE 
     */
    static update(currNode, nextNode, index = 0){
        if (!nextNode) {
            if (currNode.rootElement.parentElement)
                currNode.rootElement.parentElement.removeChild(currNode.rootElement)
                return false
        } else if (widgetdom.changedType(currNode, nextNode)) {

            nextNode.rootElement = widgetdom.createElement(nextNode)
            widgetdom.nodeReplace(currNode, nextNode)

        } else {
            widgetdom.compareProps(currNode, nextNode)
            widgetdom.compareChilds(currNode, nextNode)
        }
        return true
    }


    /**
     * При изменении типов перерисовываем
     */
    static changedType(currNode, nextNode){
        return currNode.type!==nextNode.type
    }

    /**
     * Сравнить применить свойства с новой ноды
     */
    static compareProps(currNode, nextNode){
        
        const allProps = new Set(Object.keys(currNode.props).concat(Object.keys(nextNode.props)))
        allProps.forEach(prop => {
            if (prop in nextNode.props){
                if (nextNode.props[prop]!=currNode.props[prop]){
                    currNode.props[prop] = nextNode.props[prop]
                    widgetdom.assignProp(currNode, prop)
                }
            } else {
                if (currNode.props[prop]!=''){
                    currNode.props[prop] = ''
                    widgetdom.assignProp(currNode, prop)
                }
            }
        })
    }

    /**
     * СРАВНИТЬ 2 ноды
     * Проверка детей
     */
    static compareChilds(currNode, nextNode){
        const deleteIndexs = []

        let useView = false
        let currChild = []
        if (Array.isArray(currNode.childs)){
            currChild = currNode.childs
        } else {
            if ('view' in currNode.childs){

                const child = currNode.childs.view
                currChild = Array.isArray(child)
                    ?child
                    :[]
                useView = true

            }
        }

        const max = Math.max(currChild.length, nextNode.childs.length)
        for (let i = 0; i < max; i++) {
            if (currChild[i]) {
                if (!widgetdom.update(
                    currChild[i],
                    nextNode.childs[i],
                    i
                )) {
                    deleteIndexs.push(i)
                }
            } else {
                currNode.rootElement.appendChild(
                    widgetdom.createElement(nextNode.childs[i])
                )
                currChild.push(nextNode.childs[i])
            }
        }


        if (deleteIndexs.length!=0){
            console.log('deleteIndexs', deleteIndexs)
            const nw = []
            currChild.forEach((child, key) => {
                if (!deleteIndexs.includes(key)) {
                    nw.push(child)
                }
            })

            if (useView){
                currNode.childs.view = nw
            } else {
                currNode.childs = nw
            }
        }


    }


    static nodeReplace(currNode, nextNode){
        if (nextNode.rootElement!=currNode.rootElement)
            currNode.rootElement.parentElement.replaceChild(
                nextNode.rootElement, 
                currNode.rootElement
            );
        currNode.props = nextNode.props
        currNode.childs = nextNode.childs
        currNode.type = nextNode.type
    }


    /**
     * ASSIGN PROP to dom element
     */
    static assignProp(widget, prop) {
        let value = widget.props[prop]

        const [change, newValue] = widgetconvertor.checkState(widget, prop)
		if (change) {
            value = newValue
            // if (widget.props[prop]==value)
            //     return false
        }

        const type = widgetconvertor.getType(value)

        switch(type){
            case 'Bool':
            case 'String':
            case 'Int':
                widget.rootElement[prop] = value
            break;
            case 'Function':
                if (prop.substr(0,2)=='on'){
                    widget.rootElement[prop] = function(){
                        value.apply(this)

                        if (widget.type in widgetconvertor.singleElement){
                            const defaultProp = widgetconvertor.singleElement[widget.type]
                            if (defaultProp){
                                widget.props[defaultProp] = this[defaultProp]
                            }
                        }

                    }
                } else {
                    widget.rootElement[prop] = value()
                }
            break;
            default:
                console.info('Не применено', prop, value, type)
            break;
        }
        
    }


    /**
     * RENDER
     */
    static render(querySelector, widget){
        if (querySelector in widgetdom.active){
            const currNode = widgetdom.active[querySelector]
            widgetdom.update(currNode, widget)
        } else {
            const rootElement = window.document.querySelector(querySelector);
            if (rootElement){
                widgetdom.firstRender(rootElement, querySelector, widget)
            } else {
                window.addEventListener('load', () => {
                    const rootElement = window.document.querySelector(querySelector);
                    if (rootElement){
                        widgetdom.firstRender(rootElement, querySelector, widget)
                    }
                })
            }
        }
    }

    static active = {}
    static firstRender(rootElement, querySelector, widget){
        const result = widgetdom.createElement(widget)
        widgetdom.active[querySelector] = widget
        rootElement.innerHTML = ''
        rootElement.appendChild(result)
    }


    static widgetStore = {};
    static widgetRegister(name, _widget = () => false) {
		if (name in widgetdom.widgetStore){
			throw 'Компонент ' + name + ' - уже зарегистрирован!';
			return false;
		}
		widgetdom.widgetStore[name] = _widget
        // (prps) => {
		// 	return _widget(prps)
		// }
		// return true;
	}

}
////// файл отсутствует - widgetstate.js
////// файл отсутствует - widgettools.js
// widgetsmartprops.js

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

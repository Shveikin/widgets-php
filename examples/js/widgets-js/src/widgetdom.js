
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
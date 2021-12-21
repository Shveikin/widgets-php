
class widgetdom {

    static ids = {}
    static idCounter = 0

    static getId(){
        const result = widgetdom.idCounter++
        return result
    }

    static makeElement(widget, parent = false){
        const element = document.createElement(widget.type);
        widget.rootElement = element;
        widget.rootElement.setAttribute('key_id', widget.id)
        widget.parent = parent
        if (parent)
            widgetdom.parentLink(widget, parent)
        return element;
    }

    static parentLink(widget, parent){
        const parentType = widgetconvertor.getType(parent)
        switch (parentType) {
            case 'HTML':
                parent.appendChild(widget.rootElement)
            break;
            case 'Widget':
                widgetdom.parentLink(widget, parent.rootElement)
            break;
            default:
                console.log('Не знаю как добавить в этот парент! ', parentType, parent);
            break;
        }
    }

    /**
     * CREATE ELEMENT
     */
    static createElement(widget, parent = false){
        if (widget.type in widgetdom.widgetStore){
            widget = widgetdom.widgetStore[widget.type](widget.props)
        }
        
        const rootElement = widgetdom.makeElement(widget, parent)

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
                const widgetType = widgetconvertor.getType(childWidget)
                switch(widgetType){
                    case 'Widget':
                        widgetdom.createElement(childWidget, widget)
                    break;
                    default: 
                        console.log('Не знаю что делать с этим child - ', widgetType)
                    break;
                }

            })
        } else {
            const childType = widgetconvertor.getType(widget.childs)

            if ('view' in widget.childs) {
                widget.childs.view = []
            }

            let value = ''
            const [change, newValue] = widgetconvertor.checkState(widget, 'childs')

            if (!change){
                // if (!('childs' in widget)) widget.childs = {}

                // const childWidget = c.div(value)

                // widget.childs.view = [childWidget]
                // widgetdom.createElement(childWidget, child)
            }
        }

        return rootElement;
    }


    /**
     * UPDATE 
     */
    static update(currNode, nextNode, index = 0){
        if (!nextNode) {
            console.log('deleteID - ', currNode.id);
            if (currNode.rootElement.parentElement){
                currNode.rootElement.parentElement.removeChild(currNode.rootElement)
                currNode.rootElement = null
            } else {
                alert('Нет парента');
            }

            return true
        } else if (widgetdom.changedType(currNode, nextNode)) {

            widgetdom.createElement(nextNode)
            widgetdom.nodeReplace(currNode, nextNode)

        } else {
            widgetdom.compareProps(currNode, nextNode)
            widgetdom.compareChilds(currNode, nextNode)
        }
        return false
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


    static getChildsFrom(widget){
        let useView = true
        let currChild = []
        if (Array.isArray(widget.childs)){
            currChild = widget.childs
            useView = false
        } else {
            if ('view' in widget.childs){

                const child = widget.childs.view
                currChild = Array.isArray(child)
                    ?child
                    :[]

            }
        }
        return [false, currChild]
    }

    /**
     * СРАВНИТЬ 2 ноды
     * Проверка детей
     */
    static compareChilds(currNode, nextNode){
        const deleteIndexs = []

        let [useViewCurrent, currChildCurrent] = widgetdom.getChildsFrom(currNode)
        let [useViewNext, currChildNext] = widgetdom.getChildsFrom(nextNode)

        
        const max = Math.max(currChildCurrent.length, currChildNext.length)
        for (let i = 0; i < max; i++) {
            if (currChildCurrent[i]) {
                const removeChildElement = widgetdom.update(
                    currChildCurrent[i],
                    currChildNext[i],
                    i
                )

                if (removeChildElement) {
                    deleteIndexs.push(i)
                }

            } else {
                const child = currChildNext[i];
                const element = widgetdom.createElement(child)
                widgetdom.parentLink(child, currNode)

                currChildCurrent.push(currChildNext[i])
            }
        }


        if (deleteIndexs.length!=0){
            console.log('deleteIndexs', deleteIndexs)
            const nw = []
            currChildCurrent.forEach((child, key) => {
                if (!deleteIndexs.includes(key)) {
                    nw.push(child)
                }
            })
            currChildCurrent = nw
        }

        if (useViewCurrent){
            currNode.childs.view = currChildCurrent
        } else {
            currNode.childs = currChildCurrent
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
        rootElement.innerHTML = ''
        widgetdom.createElement(widget, rootElement)
        widgetdom.active[querySelector] = widget
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

class widgetdom {
    static debug = false;
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
                if (widgetdom.debug)
                    console.info('Не знаю как добавить в этот парент! ', parentType, parent);
            break;
        }
    }

    /**
     * CREATE ELEMENT
     */
    static createElement(widget, parent = false){
        if (widget.type in widgetdom.widgetStore){
            const storeElement = widgetdom.widgetStore[widget.type](widget.props)
            const storeElementType = widgetconvertor.getType(storeElement)
            
            switch (storeElementType){
                case 'HTML':
                    widget.rootElement = storeElement
                    return storeElement
                break;
                case 'Widget':
                case 'Bool':
                    widget = storeElement
                break;
                default:
                    if (widgetdom.debug)
                        console.info('Не проработанный тип элемента', storeElementType, storeElement)
                break;
            }
        }
        
        const widgetType = widgetconvertor.getType(widget)
        switch (widgetType){
            case 'Widget':
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
                                if (widgetdom.debug)
                                    console.info('Не знаю что делать с этим child - ', widgetType)
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


                    if (change){
                        const type = widgetconvertor.getType(newValue)
                        switch (type) {
                            case 'String':
                                rootElement.innerHTML = newValue
                            break;
                        }
                    }
                }

                return rootElement;
            
            default:
                if (widgetdom.debug)
                    console.info('Не знаю как создать этот компонент', widgetType, widget);
            break;
        }


    }


    /**
     * UPDATE 
     */
    static update(currNode, nextNode, index = 0){
        if (!nextNode) {
            
            if (currNode.rootElement.parentElement){
                currNode.rootElement.parentElement.removeChild(currNode.rootElement)
                currNode.rootElement = null
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
            const nw = []
            currChildCurrent.forEach((child, key) => {
                if (!deleteIndexs.includes(key)) {
                    nw.push(child)
                } else {
                    widgetdom.deleteChildsFromState(child)
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


    static deleteChildsFromState(child){
        const id = child.id
        Object.values(widgetstate.updates).forEach(stateNames => {
            Object.values(stateNames).forEach(stateProps => {
                if (id in stateProps){
                    delete stateProps[id]
                }
            })
        })
        if (Array.isArray(child.childs)){
            child.childs.forEach(innerChild => {
                widgetdom.deleteChildsFromState(innerChild)
            })
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
        if (newValue==undefined) return false;
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
                const attrList = ['for'];

                if (attrList.includes(prop)){
                    widget.rootElement.setAttribute(prop, value)
                } else {
                    widget.rootElement[prop] = value
                }
            break;
            case 'Function':
                if (prop.substr(0,2)=='on'){

                    const func = function(){
                        value.apply(this)

                        if (widget.type in widgetconvertor.singleElement){
                            const defaultProp = widgetconvertor.singleElement[widget.type]
                            if (defaultProp){
                                widget.props[defaultProp] = this[defaultProp]
                            }
                        }

                    }


                    widgetdom.assignEventListener(widget, prop, func)

                } else {
                    widget.rootElement[prop] = value()
                }
            break;
            default:
                if (widgetdom.debug)
                    console.info('Не применено', prop, value, type)
            break;
        }
        
    }

    static assignEventListener(widget, onprop, func){
        widget.rootElement.addEventListener(onprop.substr(2), func)
    }


    /**
     * RENDER
     */
    static render(querySelector, widget, mode = 'rebuild'){
        if (querySelector in widgetdom.active){
            const currNode = widgetdom.active[querySelector]
            widgetdom.update(currNode, widget)
        } else {
            widgetdom.querySelector(querySelector, mode).then(rootElement => {
                widgetdom.firstRender(rootElement, querySelector, widget)
            }).catch(message => {
                console.error('widget render ', message)
            })
        }
    }

    static querySelector(querySelector, mode = 'rebuild'){
        return new Promise(function(resolve, reject){
            const rootElement = window.document.querySelector(querySelector);
            if (rootElement){
                switch (mode) {
                    case 'rebuild':
                        resolve(rootElement);
                    break;
                    case 'append':
                        const wrapper = document.createElement('div')
                        rootElement.appendChild(wrapper)
                        resolve(wrapper);
                    break;
                }
            } else {
                window.addEventListener('load', () => {
                    const rootElement = widgetdom.querySelector(querySelector, mode);
                    if (rootElement){
                        resolve(rootElement)
                    } else {
                        reject('Элемента нет ' + querySelector)
                    }
                })
            }
        })
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

    static setChange(widget, name, func){
        if (!('eventListeners' in widget)) widget.eventListeners = {}
        if (!(name in widget.eventListeners)){
            widget.rootElement.addEventListener('change', func, false);
            widget.eventListeners[name] = true;
        }
    }

}
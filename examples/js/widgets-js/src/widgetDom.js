
class widgetDom {
    static names = [];
    static active = {};
    static names_length = 0
    static nextName(){
        return 'XE' + (widgetDom.names_length++)
	}

    static pk(path, key){
        return path + '/' + key
    }

    static name(name){
        if (name in widgetDom.names){
            return widgetDom.names[name]
        } else {
            return false;
        }
    }

    static createElement(widget, path, virtualDom = {}){
        const rootElement = document.createElement(widget.type);
        virtualDom.type = widget.type
        if (!('props' in virtualDom)) virtualDom['props'] = {}
        if (!('childs' in virtualDom)) virtualDom['childs'] = []


        const props = widget.props
        Object.keys(props).forEach(key => {
            
            const val = widget.props[key]
            virtualDom.props[key] = val
            widgetDom.__linkToElement(path, widget.name, rootElement, key, val)

        });
        if (Array.isArray(widget.childs)){

            let index = 0
            widget.childs.map(itm => {
                
                virtualDom.childs.push({})
                return widgetDom.createElement(
                    WidgetConvertor.toXElement(path, itm),
                    widgetDom.pk(path, virtualDom.childs.length - 1),
                    virtualDom.childs[virtualDom.childs.length - 1]
                )

            }).forEach((childElement) => {
                rootElement.appendChild(childElement);
            });
        }

        document.getElementById('dom').innerHTML = JSON.stringify(virtualDom, null, '   ')
        console.log('create', virtualDom)

        return rootElement
    }

    static nodeToArray(node){
        switch (WidgetConvertor.getType(node)){
            case 'Array':
                return node
            case 'Widget':
                return node.childs
            default: 
                return [node]
        }
    }

    static getElementByPath(path){
        path = path.split('/')
        let querySelector = path.shift()
        let element = document.querySelector(querySelector)
        while (path.length!=0){
            querySelector = path.shift()
            element.childNodes(querySelector)
        }
        return element
    }

    static updateVirtual(querySelector, nextNode){
        if (querySelector in widgetDom.virtualDom){
            const currNode = widgetDom.virtualDom[querySelector];
            const newVirtualDom = widgetDom.update(
                document.querySelector(querySelector),
                querySelector,
                currNode,
                nextNode
            )
            widgetDom.virtualDom[querySelector] = newVirtualDom
            widgetDom.active[querySelector] = nextNode
        } else {
            widgetDom.renderTo(querySelector, nextNode)
            widgetDom.active[querySelector] = nextNode
        }
    }

    static update(rootElement, path, currNode, nextNode, index = 0, virtualDom = {}){
        if (!nextNode) return false
        virtualDom.type = nextNode && 'type' in nextNode?nextNode.type:'div'
        virtualDom.childs = []
        virtualDom.props = {}
        if (!nextNode) {
            if (rootElement.childNodes[index])
                rootElement.removeChild(rootElement.childNodes[index])
            return false
        } else if (!currNode) {
            virtualDom.childs[index] = {}

            const newElement = widgetDom.createElement(
                WidgetConvertor.toXElement(path, nextNode),
                widgetDom.pk(path, virtualDom.childs.length - 1),
                virtualDom.childs[index]
            )

            rootElement.appendChild(newElement);
        } else if (widgetDom.changed(currNode, nextNode)) {
            virtualDom.childs[index] = {}

            const newElement = widgetDom.createElement(
                WidgetConvertor.toXElement(path, nextNode),
                widgetDom.pk(path, virtualDom.childs.length - 1),
                virtualDom.childs[index]
            )

            rootElement.replaceChild(
                newElement, 
                rootElement.childNodes[index]
            );
        } else if (Array.isArray(nextNode.childs) && nextNode.childs.length!=0) {
            for (let i = 0; i < Math.max(currNode.childs.length, nextNode.childs.length); i++) {

                virtualDom.childs.push(
                    widgetDom.update(
                        rootElement.childNodes[index],
                        widgetDom.pk(path, i),
                        currNode.childs[i], 
                        nextNode.childs[i], 
                        i
                    )
                )
                
            }
        } else {
            console.log('Ничего не изменилось');
            virtualDom = nextNode
        }
        
        document.getElementById('dom').innerHTML = JSON.stringify(virtualDom, null, '   ')
        console.log('ee', virtualDom)
        return virtualDom
    }


	static __linkToElement(path, elementName, element, prop, value){
        const [change, neeValue] = WidgetConvertor.applyState(elementName, prop, value)
		if (change) value = neeValue

		const type = WidgetConvertor.getType(value)
		switch(type){
			case 'String':
			case 'Int':
				element[prop] = value
			break;
			case 'Function':
				if (prop.substr(0,2)=='on'){
					element[prop] = () => {
						value(); 
						console.log('test!111')
					}
				} else {
					element[prop] = value()
				}
			break;
			case 'Element':
				element[prop] = WidgetConvertor.toStr(path, value)
			break;
			default:
				// console.info('Не применено', prop, value, type)
			break;
		}
	}

    static changed(currNode, nextNode){
        const result = (
            currNode.type !== nextNode.type || 
            // !WidgetComparator.compare(currNode.childs, nextNode.childs)
            currNode !== nextNode
        );
        return result
    }

    static virtualDom = {}

    static linkElements(querySelector, element){
        if (!(querySelector in widgetDom.virtualDom)) 
            widgetDom.virtualDom[querySelector] = {}

        const newTree = widgetDom.createElement(element, querySelector, widgetDom.virtualDom[querySelector])
        return newTree
    }

    static renderTo(querySelector, element){
		
		let toElement = window.document.querySelector(querySelector);
		if (toElement){
            const newTree = widgetDom.linkElements(querySelector, element)
			toElement.innerHTML = '';
			toElement.appendChild(newTree)
		} else {
			window.addEventListener('load', () => {
				toElement = window.document.querySelector(querySelector);
                if (toElement){
                    const newTree = widgetDom.linkElements(querySelector, element)
                    toElement.innerHTML = '';
                    toElement.appendChild(newTree)
                }
			});
		}
    }
}

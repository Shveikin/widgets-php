
class widgetDom {
    static createElement(widget) {
        if (WidgetConvertor.getType(widget)=='Widget'){
            const bindElement = WidgetConvertor.getType(widget)=='Widget'?widget.bindElement():false
            if (!bindElement){
                const rootElement = document.createElement(widget.type);
                widget.bindElement(rootElement)
                widget.props && Object.keys(widget.props).forEach((key) => {

                    widgetDom.__linkToElement(widget.name, rootElement, key, widget.props[key])

                    // rootElement[key] = widget.props[key];
                });
                if (Array.isArray(widget.childs)){
                    widget.childs.map(itm => 
                        widgetDom.createElement(
                            WidgetConvertor.toWidget(itm)
                        )
                    ).forEach((childElement) => {
                        rootElement.appendChild(childElement);
                    });
                } else {
                    rootElement.innerHTML = widget.childs
                }
                return rootElement
            } else {
                return bindElement
            }
        } else {
            console.log(widget)
            throw new Error('not widget')
        }
    }

    static nodeToArray(node){
        switch (WidgetConvertor.getType(node)) {
            case 'Array':
                return node
            case 'Widget':
                return node.childs
            default: 
                return [node]
        }
    }

    static update(rootElement, currNode, nextNode, index = 0) {
        if (!nextNode) {
            rootElement.removeChild(rootElement.childNodes[index]);
        } else if (!currNode) {
            const newElement = WidgetConvertor.toHTML(nextNode)
            rootElement.appendChild(newElement);
        } else if (widgetDom.changed(currNode, nextNode)) {
            const newElement = WidgetConvertor.toHTML(nextNode)
            rootElement.replaceChild(
                newElement, 
                rootElement.childNodes[index]
            );
        } else if (Array.isArray(nextNode.childs)) {
            for (let i = 0; i < Math.max(currNode.childs.length, nextNode.childs.length); i++) {
                widgetDom.update(rootElement.childNodes[index], currNode.childs[i], nextNode.childs[i], i);
            }
        }
        // else {
        //     rootElement.innerHTML = nextNode.childs
        // }
    }


	static __linkToElement(elementName, element, prop, value){
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
				element[prop] = WidgetConvertor.toStr(value)
			break;
			default:
				// console.info('Не применено', prop, value, type)
			break;
		}
	}

    static changed(nodeA, nodeB) {
        return (
            typeof nodeA.childs !== typeof nodeB.childs ||
            typeof nodeA.childs === 'string' && nodeA.childs !== nodeB.childs || 
            nodeA.type !== nodeB.type
        );
    }
}


class widgetDom {
    static createElement(widget) {
        const bindElement = WidgetConvertor.getType(widget)=='Widget'?widget.bindElement():false
        if (!bindElement){
            const rootElement = document.createElement(widget.type);
            widget.props && Object.keys(widget.props).forEach((key) => {
                rootElement[key] = widget.props[key];
            });
            if (Array.isArray(widget.childs)){
                widget.childs.map(widgetDom.createElement).forEach((childElement) => {
                    rootElement.appendChild(childElement);
                });
            } else {
                rootElement.innerHTML = widget.childs
            }
            widget.bindElement(rootElement)
            return rootElement
        } else {
            return bindElement
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
            rootElement.appendChild(createElement(nextNode));
        } else if (widgetDom.changed(currNode, nextNode)) {
            rootElement.replaceChild(widgetDom.createElement(nextNode), rootElement.childNodes[index]);
        } else if (typeof nextNode.childs !== 'string') {
            for (let i = 0; i < Math.max(currNode.childs.length, nextNode.childs.length); i++) {
                widgetDom.update(rootElement.childNodes[index], currNode.childs[i], nextNode.childs[i], i);
            }
        } else {
            rootElement.innerHTML = nextNode.childs
        }
    }

    static changed(nodeA, nodeB) {
        return (
            typeof nodeA !== typeof nodeB ||
            typeof nodeA === 'string' && nodeA !== nodeB || 
            nodeA.type !== nodeB.type
        );
    }
}

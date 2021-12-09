/** @jsx h */

function h(type, props, ...children) {
    return {type, props, children};
}

function createElement(virtualNode) {
    if (typeof virtualNode === 'string') {
        return document.createTextNode(virtualNode);
    }
    const rootElement = document.createElement(virtualNode.type);
    virtualNode.props && Object.keys(virtualNode.props).forEach((key) => {
        rootElement.setAttribute(key, virtualNode.props[key]);
    });
    virtualNode.children.map(createElement).forEach((childElement) => {
        rootElement.appendChild(childElement);
    });
    return rootElement;
}

function update(rootElement, currNode, nextNode, index = 0) {
    if (!nextNode) {
        rootElement.removeChild(rootElement.childNodes[index]);
    } else if (!currNode) {
        rootElement.appendChild(createElement(nextNode));
    } else if (changed(currNode, nextNode)) {
        rootElement.replaceChild(createElement(nextNode), rootElement.childNodes[index]);
    } else if (typeof nextNode !== 'string') {
        for (let i = 0; i < Math.max(currNode.children.length, nextNode.children.length); i++) {
            update(rootElement.childNodes[index], currNode.children[i], nextNode.children[i], i);
        }
    }
}

function changed(nodeA, nodeB) {
    return (
        typeof nodeA !== typeof nodeB ||
        typeof nodeA === 'string' && nodeA !== nodeB ||
        nodeA.type !== nodeB.type
    );
}

function render(virtualRoot, domRoot) {
    domRoot.appendChild(createElement(virtualRoot));
}

const root = document.getElementById('app');
const app = <div><span>hello, world!</span><div>hello</div></div>;
const nextApp = <div><span>hello, world!</span><div>hello</div></div>;

render(app, root);

let counter = 0;
setInterval(() => {
    if (counter++ % 2 == 0) {
        update(root, app, nextApp);
    } else {
        update(root, nextApp, app);
    }
}, 1000);
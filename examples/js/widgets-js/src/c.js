
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
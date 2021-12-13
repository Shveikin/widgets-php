
const c = new Proxy({}, {
	get:(_, _type) => {
        return (source) => {
            const id = widgetdom.getId()

            const [type, props, childs] = widgetconvertor.distribution(_type, source)
            return {
                id,
                type,
                props,
                childs,
            }
        }
    }
})
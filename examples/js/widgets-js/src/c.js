
const c = new Proxy({}, {
	get:(_, tag) => {
		if (typeof widget[tag] === 'function'){
            // c.app(sett)
			return widget[tag]
		} else {
            // c.div(props) -> return proxi with class

            return (property = {}) => {
				const _name = widget.nextName(property)
				const [props, childs] = WidgetConvertor.propsCorrector(tag, property);

				return {
					type: tag,
					props,
					childs,
				}

				// const _widget = {
				// 	widget: new widget(tag, currProps, child)
				// }
                // const proxyProps = new Proxy(
                //     _widget, 
				// 	{
                //         get: (el, prop) => {
				// 			// if (['props', 'type', 'name', 'childs'].includes(prop)){
				// 			// 	return _widget.widget[prop]
				// 			// }
				// 			if (typeof _widget.widget[prop] != 'undefined'){
				// 				return _widget.widget[prop]
				// 			} else
				// 			if (prop!='setName' && prop.substr(0,3)=='set'){
				// 				return function(value){
				// 					el.widget.assignProp(prop.substr(3).toLowerCase(), value)
				// 					return proxyProps;
				// 				}
				// 			} else {
				// 				return (value, dopvalue = false) => {
				// 					return el.widget.setProp(proxyProps, prop, value, dopvalue)
				// 				}
				// 			} 
                //         },
                //         set: (el, prop, value) => {
				// 			el.widget.assignProp(prop, value)
                //             return true;
                //         }
                //     }
                // )

                // return proxyProps
            }
		}
	},
	set:(el, tag, props) => widget.widgetRegister(tag, props)
})

const w = (element, params = false, state = false) => widget.createElement(element, params, state);



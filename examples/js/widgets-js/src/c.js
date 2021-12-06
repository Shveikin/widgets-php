
const c = new Proxy({}, {
	get:(_, tag) => {
		if (typeof widget[tag] === 'function'){
            // c.app(sett)
			return widget[tag]
		} else {
            // c.div(props) -> return proxi with class

            return (property = {}, state = false) => {
				property = WidgetConvertor.propsCorrector(property);
				const lite = {_name: property._name}
				if ('element' in property){
					tag = property.element
				}

				const _widget = {
					widget: new widget(tag, lite)
				}
                const proxyProps = new Proxy(
                    _widget, 
					{
                        get: (el, prop) => {
							if (typeof _widget.widget[prop] == 'function'){
								return _widget.widget[prop]()
							} else
							if (prop!='setName' && prop.substr(0,3)=='set'){
								return function(value){
									el.widget.assignProp(prop.substr(3).toLowerCase(), value)
									return proxyProps;
								}
							} else {
								return (value, dopvalue = false) => {
									return el.widget.setProp(proxyProps, prop, value, dopvalue)
								}
							} 
                        },
                        set: (el, prop, value) => {
							el.widget.assignProp(prop, value)
                            return true;
                        }
                    }
                )

				widget.proxys[property._name] = proxyProps
				_widget.widget.assignProps(property)
                return proxyProps
            }
		}
	},
	set:(el, tag, props) => widget.widgetRegister(tag, props)
})

const w = (element, params = false, state = false) => widget.createElement(element, params, state);



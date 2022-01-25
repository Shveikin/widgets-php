
class widgettools {
    static create(element){
		if (element.element=='WidgetTools'){
			const __fw = element.tool.endsWith("__fw");
			if (__fw){
				element.tool = element.tool.substr(0, element.tool.length -4)
			}
			const callback = () => widgetstate.name(element.state)[element.tool].apply(element, element.prop)
			if (__fw){
				return callback
			} else {
				return callback()//(...element.prop)
			}
		} else {
			return widgettools[element.element](element)
		}
	}

	static app(props){
		widgetdom.render('#app', c.div(props))
	}

	static render(querySelector, props){
		widgetdom.render(querySelector, c.div(props))
	}

	static getStateFromPath(state, path){
		let key
		if (path.length!=0){
			key = path.shift();
		}
        if (path.length!=0){
            if (!(key in state)){
                state[key] = widgetstate.use({});
            }
			return widgettools.getStateFromPath(state[key], path)
        } else {
			return state;
        }
	}

	static state_watcher(props){
		let callback = props.watch;
		if ('callback' in props && props.callback){
			eval(`
				callback = (${props.watch}) => {
					${props.callback}
				}
			`)
		}
		return widgetstate.name(props.state).watch(callback);
	}

	static state_check(props){
		const array_props = props.prop.split('.')
		const state = widgettools.getStateFromPath(
			widgetstate.name(props.state),
			[...array_props]
		)
		const prop = array_props.slice(-1).join('.')

		return state.check(prop,
			props.value, 
			props._true, 
			props._false
		)
	}

	static state_check_in(props){
		const array_props = props.prop.split('.')
		const state = widgettools.getStateFromPath(
			widgetstate.name(props.state),
			[...array_props]
		)
		const prop = array_props.slice(-1).join('.')

		return state.checkIn(prop,
			props.value, 
			props._true, 
			props._false
		)
	}

	static state_check_if(props){
		const array_props = props.prop.split('.')
		const state = widgettools.getStateFromPath(
			widgetstate.name(props.state),
			[...array_props]
		)
		const prop = array_props.slice(-1).join('.')

		return state.watch(prop).link(function(value){
			if (value==props.value)
				widgetconvertor.toFunction(props._do)()
		})

		// return state.check(prop,
		// 	props.value, 
		// 	props._true
		// )
	}



	static state_set_default(props){
		return widgetstate.name(props.state).setDefault(props.prop)
	}



	static state_model(props){
		return widgetstate.name(props.state).model(props.prop)
	}

	static state_modelIn(props){
		return widgetstate.name(props.state).modelIn(props.prop, props.value)
	}



	static func(props){
		return Function(props.function);
	}

	static current_request = false
	static widget_request(props){
		return {
			link: function(widget = false, prop = false){

				const state = {}
				props.useState.map(stateName => {
					if (stateName in widgetstate.names)
					state[stateName] = {
						data: widgetstate.name(stateName).data(),
						source: widgetstate.props[stateName].sourceClass,
					}
				})


				widgetstate.current_request = Math.random()
				fetch(props.url, {
					method: 'POST',
					body: JSON.stringify({
						state,
						// this: widget.props
						executor: {
							class: props.class,
							function: props.function,
							props: props.props,
							bind: props.bind,
						},
						request_id: widgetstate.current_request,
					})
				})
				.then(res => res.json())
				.then(res => {
					if (res.request_id==widgetstate.current_request){
						// Применение стейта
						if ('state' in res){
							Object.keys(res.state).forEach(stateName => {
								Object.keys(res.state[stateName]).forEach(propName => {
									widgetstate.name(stateName)[propName] = res.state[stateName][propName]
								})
							})
						}

						if ('then' in props.extra){
							const func = window[props.extra.then].bind({
								bind: props.bind
							})
							func(res.result)
						}

					}
				})

			}
		}
	}

	static state_map({state, prop, refernce = false, useColls = false}){
		const clearItm = itm => 
			itm.replaceAll('"', '\\\"').replaceAll('\n', '').replaceAll('\r', '')

		let insert = itm => clearItm(itm)
		if (refernce){
			let reference = JSON.stringify(refernce)
			if (useColls){
				insert = itm => {

					let result = reference
					useColls.forEach(replace => {
						result = result.replaceAll(`**${replace}**`, clearItm(replace=='_'?itm:itm[replace]))
					})
					return JSON.parse(result)
				}
			} else {
				insert = itm => {
					let result = reference
					result = result.replaceAll('**val**', clearItm(itm))
					return JSON.parse(result)
				}
			}
		}

		const state_map = widgetstate.name(state).map(prop, itm => {
			return insert(itm)
		})

		return state_map
	}

	static state_update(props){
		return () => {

			Object.keys(props.stateProps).forEach(prop => {
				widgetstate.name(props.state)[prop] = props.stateProps[prop]
			})
		}
	}

	static state_update_group(props){
		return () => {

			Object.values(props.list).forEach(prop => {
				const func = widgetconvertor.toFunction(prop)
				func()
			})

		}
	}
}
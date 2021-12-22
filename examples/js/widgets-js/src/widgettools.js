
class widgettools {
    static create(element){
		return widgettools[element.element](element)
	}

	static app(props){
		widgetdom.render('#app', c.div(props))
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

	static state_model(props){
		return widgetstate.name(props.state).model(props.prop)
	}

	static state_modelIn(props){
		return widgetstate.name(props.state).modelIn(props.prop, props.value)
	}



	static func(props){
		return Function(props.function);
	}

	static widget_request(props){
		return {
			link: function(widget, prop){

				const state = {}
				props.useState.map(stateName => (
					state[stateName] = widgetstate.name(stateName).data()
				))

				return function(){
					fetch(props.url, {
						method: 'POST',
						body: JSON.stringify({
							state
							// this: widget.props
						})
					})
					.then(res => res.json())
					.then(res => {
						console.log('>>>>>', res)
					})
				}

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
						result = result.replaceAll(`**${replace}**`, clearItm(itm[replace]))
					})
					console.log('JSON', result)
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
			// if (refernce){
			// 	let reference = JSON.stringify(refernce)
			// 	if (useColls){
			// 		useColls.forEach(replace => {
			// 			reference = reference.replaceAll(`**${replace}**`, itm[replace])
			// 		})
			// 	} else {
			// 		reference = reference.replaceAll('**val**', itm)
			// 	}
			// 	const myProps = JSON.parse(reference)
			// 	return myProps
			// 	const newElement = c.div({child: myProps})

			// 	return newElement
			// } else {
			// 	return itm
			// }
			
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
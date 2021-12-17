
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
		return widgetstate.name(props.state).model(props.prop, 
			{
				htmlelementValue(value){
					if (value==false){
						const newStateValue = widgetstate.name(props.state)[props.prop].filter(val => 
							val!=props.value
						)
						widgetstate.name(props.state)[props.prop] = newStateValue
					} else {
						let newStateValue = widgetstate.name(props.state)[props.prop]
						if (Array.isArray(newStateValue)){
							newStateValue.push(props.value)
						} else {
							newStateValue = [props.value]
						}
						widgetstate.name(props.state)[props.prop] = newStateValue
					}
					return value;
				},
				widgetstateValue(value){
					if (value.includes(props.value)){
						return props.result?props.result:true;
					} else {
						return false;
					}
				}
			}
			// function(value){
			// 	if (Array.isArray(value)){
			// 		if (value.includes(props.value)){
			// 			return props.result?props.result:true;
			// 		} else {
			// 			return false;
			// 		}
			// 	} else {
			// 		if (value==false){
			// 			const newStateValue = widgetstate.name(props.state)[props.prop].filter(val => 
			// 				val!=props.value
			// 			)
			// 			widgetstate.name(props.state)[props.prop] = newStateValue
			// 		} else {
			// 			const newStateValue = widgetstate.name(props.state)[props.prop]
			// 			newStateValue.push(props.value)
			// 			widgetstate.name(props.state)[props.prop] = newStateValue
			// 		}
			// 		return value;
			// 	}
			// }
		)
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

	static state_map(props){
		const state_map = //widgetstate.name(props.state).watch(props.prop, function(array){
			//return 
			// array
			widgetstate.name(props.state)._list
			.map(itm => {
				let reference = JSON.stringify(props.refernce)
				props.useColls.map(replace => {
					reference = reference.replaceAll(`**${replace}**`, itm[replace])
				})
				const myProps = JSON.parse(reference)
				if ('_name' in myProps) delete myProps['_name']
				const newElement = c.div(myProps)

				return newElement
			})
		//})

		const element = c.div(state_map)
		return element
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
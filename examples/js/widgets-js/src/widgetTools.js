
class WidgetTools{
	static create(element){
		return WidgetTools[element.element](element)
	}

	// static register = {}
	// static createElement(widget){
	// 	let element = false;
	// 	if (!name){
	// 		name =  'auto_' + Object.keys(WidgetTools.register).length;
	// 		element = document.createElement(tag);
	// 	} else {
	// 		if (name in WidgetTools.register){
	// 			element = WidgetTools.register[name]
	// 		} else {
	// 			element = document.createElement(tag);
	// 		}
	// 	}
	// 	WidgetTools.register[name] = element;
	// 	return element;
	// }

	static getStateFromPath(state, path){
		let key
		if (path.length!=0){
			key = path.shift();
		}
        if (path.length!=0){
            if (!(key in state)){
                state[key] = WidgetState.use({});
            }
			return WidgetTools.getStateFromPath(state[key], path)
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
		return WidgetState.name(props.state).watch(callback);
	}

	static state_check(props){
		const array_props = props.prop.split('.')
		const state = WidgetTools.getStateFromPath(
			WidgetState.name(props.state),
			[...array_props]
		)
		const prop = array_props.slice(-1).join('.')

		return state.check(prop,
			props.value, 
			props._true, 
			props._false
		)
	}

	static func(props){
		return Function(props.function);
	}

	static widget_request(props){
		return {
			link: function([element, prop]){
				return function(){
					fetch(props.url, {
						method: 'POST',
						body: JSON.stringify({
							state: props.useState.map(stateName => {
								return WidgetState.name(stateName).data()
							}),
							this: widget.name(element).toArray,
							props
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
		const state_map = WidgetState.name(props.state).watch(props.prop, function(array){
			return array.map(itm => {
				let reference = JSON.stringify(props.refernce)
				props.useColls.map(replace => {
					reference = reference.replaceAll(`**${replace}**`, itm[replace])
				})
				const myProps = JSON.parse(reference)
				if ('_name' in myProps) delete myProps['_name']
				const newElement = c.div(myProps)

				return newElement
			})
		})

		return c.div({child: state_map})
	}

	static state_update(props){
		return () => {
			WidgetState.name(props.state)[props.prop] = props.value
		}
	}

}
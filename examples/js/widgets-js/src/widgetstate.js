

class widgetstate {
    static state_length = 0;
	static names = {};
	static props = {};

	static name(name){
		if (!(name in widgetstate.names)){
			console.info(`state ${name} отсутствует! Используется пустой state`)
			widgetstate.names[name] = widgetstate.use({_name: name})
		}
		return widgetstate.names[name]
	}

	static update(globalState){
		const _name = globalState._name;
		Object.keys(globalState).map(itm => {
			if (itm!='_name')
				widgetstate.name(_name)[itm] = globalState[itm]
		})
	}

    static use(obj, props = false){
		widgetstate.state_length++;
		const setParents = []

		if (obj==null | obj==false)
			obj = {}

		let stateName = '';
		if (props && 'name' in props){
			stateName = props.name
			obj['_name'] = stateName
		} else
		if ('_name' in obj){
			stateName = obj['_name'];
			// delete obj['_name'];
		} else {
			stateName = 'state_' + widgetstate.state_length;
			obj['_name'] = stateName
		}




		Object.keys(obj).map(i => {
			if (obj && typeof obj[i]=='object' && i.substr(0,1)!='_'){
				
				if (Array.isArray(obj[i])){
					const array = {}
					obj[i].map((val, key) => {
						array[''+key] = val
					})
					obj[i] = array
				}
				
				if (obj[i]){
					obj[i] = widgetstate.use(obj[i])
					setParents.push(i)
				}
			}
		})

		obj['___parent'] = false;

        const state = new Proxy(obj, {
            get(object, prop){
                if (widgetstate[prop]){
                    return function(){
						const result = widgetstate[prop].apply(this, [object, ...arguments])
						if (typeof result == 'function'){
							return result.apply(this, arguments)
						} else {
							return result
						}
					}
                } else {
                    // return widgetstate.modefiersCheck(stateName, prop, object[prop])
					return object[prop]
                }
            },
            set(object, prop, value){
				if (object[prop]!=value){

					if (prop.substr(0, 1)=='_' || !Array.isArray(value)){
						object[prop] = value
					} else {
						object[prop] = widgetstate.use(value)
					}
					widgetstate.updateAll(object._name, prop)
					widgetstate.setAlias(stateName, prop, value)
				}
				return true
            }
        })

		setParents.map(i => {
			state[i].set('___parent', state)
		})

		widgetstate.useName(stateName, state)
		if (props){
			widgetstate.setupProps(stateName, props)
		}
        return state;
    }

	// static modefiersCheck(stateName, key){
	// 	if (stateName in widgetstate.props)
	// 	if ('modifiers' in widgetstate.props[stateName])
	// 	if (key in widgetstate.props[stateName]['modifiers'])
			
	// 		return widgetstate.props[stateName]['modifiers'][key]


	// 	return false
	// }

	/** 
	 * Установка значений в widgetstate.url
	*/
	static setupProps(stateName, props){
		widgetstate.props[stateName] = props

		if ('alias' in props){
			Object.keys(props.alias).forEach(prop => {

				const currentValue = widgetstate.name(stateName)[prop]
				if (currentValue && currentValue?.length!=0)
				if (!('default' in props) || props.default[prop]!=currentValue){
					widgetstate.url[props.alias[prop]] = currentValue
				}
			})
		}
	}

	

	static url = {}
	static urlshadow = {}
	static setAlias(stateName, prop, value){
		if (stateName in widgetstate.props)
		if ('alias' in widgetstate.props[stateName])
		if (prop in widgetstate.props[stateName].alias){
			const alias = widgetstate.props[stateName].alias[prop]
			let defaultValue = widgetstate.props[stateName]?.default
			if (defaultValue && prop in defaultValue) defaultValue = defaultValue[prop]

			if (widgetstate.valueCompare(defaultValue, value)){
				delete widgetstate.url[alias]
			} else {
				const url = alias in widgetstate.url?widgetstate.url[alias]:false
				if (!widgetstate.valueCompare(url, value)){
					widgetstate.url[alias] = value
				}
			}

			const urlcurrent = widgetstate.getStrUrl();
			setTimeout(() => {
				const url = widgetstate.getStrUrl();
				if (urlcurrent==url && widgetstate.currentUrl!=url){
					widgetstate.updateHistory(url)
					if (widgetstate.props[stateName]?.onchange){
						widgetstate.runOnChange(widgetstate.props[stateName].onchange)
					}
				}
			}, 100)
		}
	}

	static runOnChange(onchange){
		const func = widgetconvertor.toFunction(onchange)
		func();
	}

	static getStrUrl(){
		let url = '';
		Object.keys(widgetstate.url).forEach(key => {
			url += '&' + key
			if (Array.isArray(widgetstate.url[key])){
				url += `=${widgetstate.url[key].join(',')}`
			} else {
				url += `=${widgetstate.url[key]}`
			}
		})
		url = url.substring(1)
		return url
	}

	static currentUrl = ''
	static updateHistory(url){
		window.history.replaceState(0, "", location.origin + location.pathname + '?' + url);
		widgetstate.currentUrl = url
	}

	static valueCompare(a, b){
		if (Array.isArray(a) && Array.isArray(b))
			return widgetstate.arrayCompare(a, b)
		else
			return (a == b)
	}

	static arrayCompare(a, b){
		if (a.length!=b.length) return false
		const bb = new Set(b)
		for (const i of new Set(a)) {
			if (!bb.has(i)) return false;
		}
		return true
	}

	static useName(name, state){
		widgetstate.names[name] = state;
	}

	static set(self, key, value){
		self[key] = value
		widgetstate.updateAll(self._name)
	}

	static setDefault(self, key){
		if ('_name' in self){
			if (key in widgetstate.props[self._name]?.default){
				widgetstate.name(self._name)[key] = widgetstate.props[self._name].default[key]
			}
		}
	}

	static watchDefault(self, key, _true, _false){
		return widgetstate.name(self._name).watch(key, function(value){
			if (widgetstate.props[self._name]?.default == value){
				return _true
			} else {
				return _false
			}
		})
	}

	static push(self, prop){
		const count = widgetstate.keys(self).length 
		self['' + count] = prop

		widgetstate.updateAll(this._name)
	}

	static inside(self, prop, value){
		if (!self[prop].includes(value)){
			const temp = self[prop]
			temp.push(value)
			self[prop] = temp

			widgetstate.updateAll(this._name)
		}
	}

	static inc(self, prop){
		widgetstate.name(self._name)[prop]++ 
	}

	static dec(self, prop){
		widgetstate.name(self._name)[prop]--
	}

	static valueFrom(self, ...path){
		let value = self;
		path.forEach(key => {
			value = value[key]
		})
		return value
	}


	/** EMPTY */
	static checkNotEmpty(self, prop, value){
		const array = self[prop]
		const result = (Array.isArray(array)?array:Object.keys(array)).length!=0?value:false
		return result
	}

	static watchNotEmpty(self, prop, value){
		return widgetstate.name(self._name).watch(prop, function(array){
			array = Array.isArray(array)?array:Object.keys(array)
			const result = array.length!=0?value:false
			return result
		})
	}





	/** 
	 * DEFAULT 
	 */

	static getDefaultPropFromState(statename, prop) {
		if (
			statename in widgetstate.props && 
			'default' in widgetstate.props[statename] && 
			prop in widgetstate.props[statename]['default']
		){
			const isDefault = widgetstate.name(statename)[prop]==widgetstate.props[statename]['default'][prop]
			return isDefault
		} else {
			return false;
		}
	}

	/**
	 * Проверка на значение по умолчанию
	 */
	static checkDefault(self, prop, _true = false, _false = false){
		const returnValue = (_true == false) == _false
		const isDefault = widgetstate.getDefaultPropFromState(self._name, prop)
		
		if (!returnValue) 
			return isDefault
		else 
			return isDefault?_true:_false
		
	}



	/** 
	 * IF
	*/

	static runIf(self, prop, value, _true = false, _false = false){
		// const array_props = props.prop.split('.')
		// const state = widgettools.getStateFromPath(
		// 	widgetstate.name(props.state),
		// 	prop
		// )
		// const propx = array_props.slice(-1).join('.')

		// return state.watch(prop).link(function(value){
		// 	if (value==props.value)
		// 		widgetconvertor.toFunction(props._true)()
		// 	else
		// 		if (_false)
		// 			widgetconvertor.toFunction(props._false)()
		// })


		if (widgetstate.name(self._name)[prop]==value){
			widgetconvertor.toFunction(_true)()
		} else {
			widgetconvertor.toFunction(_false)()
		}
	}




	/**
	 * При изенении проверить знаниение по умолчанию
	 */
	static watchDefault(self, prop, _true, _false){
		return widgetstate.name(self._name).watch(prop, function(currentValue){
			return widgetstate.name(self._name).checkDefault(prop)?_true:_false
		})
	}

	static request(self, requestName, bindData = false){
		if ('_name' in self){
			if ('request' in widgetstate.props[self._name]){
				if (requestName in widgetstate.props[self._name]['request']){

					let request = widgetstate.props[self._name]['request'][requestName]
					request.bind = bindData
					request = widgetconvertor.toFunction(request)

					request()

				} else console.error('requestName не определен!', requestName);
			} else console.error('request отсутствует');
		}
	}

	static filterSystemVars(array){
		const exception = ['___updates', '___parent'] 
		return array.filter(itm => {
			return exception.indexOf(itm)==-1
		})
	}

	static keys(self){
		return widgetstate.filterSystemVars(Object.keys(self))
	}

	static data(self){
		const data = { ...self }
		delete data['___parent']
		delete data['___updates']
		delete data['_name']

		// Object.keys(data).forEach(key => {
		// 	if (widgetconvertor.getType(data[key])=='Object'){
		// 		if ('data' in data[key])
		// 			data[key] = data[key].data()
		// 	}
		// })

		return data
	}

	static values(self){
		return widgetstate.keys(self).map(itm => self[itm])
	}

	static mapArray(self, func){
		return widgetstate.values(self).map(func)
	}

	static length(self){
		return widgetstate.keys(self).length
	}


	static watchEmpty(self, prop, _true, _false){
		return widgetstate.name(self._name).watch(prop, function(array){
			array = Array.isArray(array)?array:Object.keys(array)
			return array.length==0
				?_true
				:_false
		})
	}


	static inspector(state, widget, changeWidgetProp) {
		if ('link' in state)
			return state.link(widget, changeWidgetProp)
	}

    static watch(self){
        return ( stateProps, callback = false) => {
            let updateStateFunction = false;
			if (typeof stateProps == 'function'){
                updateStateFunction = stateProps
                const [_, fprops] = /\(?(.{0,}?)[\)|=]/m.exec(stateProps.toString())
                stateProps = fprops.split(',').map(i => i.trim())
            } else if (typeof stateProps == 'string'){
                stateProps = stateProps.split(',').map(i => i.trim())
				if (callback){
					updateStateFunction = callback
				}
            }

            return {
                link(widget, changeWidgetProp = false){
                    // if (!('___updates' in self)) self.___updates = {}
					
					const stateName = self._name
					
					if (!(stateName in widgetstate.updates)) widgetstate.updates[stateName] = {}
					const ___updates = widgetstate.updates[stateName]
					
					const widgetType = widgetconvertor.getType(widget)
					const id = widgetType=='Widget'?widget.id:Math.floor(Math.random() * 6)


                    const state = {
                        widget,
                        changeWidgetProp,
                        updateStateFunction,
                        stateProps
                    }


					if (!Array.isArray(stateProps)){
						if (widgetdom.debug)
							console.error('stateProps must to be array type: ', stateProps)
					}

					const key = stateProps.join(',')

					

					// if (widgetType=='Widget'){
					// 	if (!(state in widget)) widget.state = {}
					// 	if (!(changeWidgetProp in widget.state)) widget.state[changeWidgetProp] = {
					// 		link: ___updates,
					// 		key,
					// 		stateProps
					// 	}
					// }

                    stateProps.map(stateProp => {
                        if (!(stateProp in ___updates)) ___updates[stateProp] = {}
                        if (!(id in ___updates[stateProp])) ___updates[stateProp][id] = {}

                        ___updates[stateProp][id][key] = state

                        // widgetstate.updateAll(stateName, stateProp)
                    })

					widgetstate.updateAll(stateName, stateProps)

                }
            }
        }
    }


	static updates = {}

    static updateAll(stateName, stateProps = []){ //_stateProp = false) {
		// let stateProps = [_stateProp]
		
		if (!Array.isArray(stateProps))
			stateProps = [stateProps]

		stateProps.forEach(stateProp => {

			// if ('___updates' in self && stateProp in self.___updates){
			// 	Object.values(self.___updates[stateProp]).forEach(stateData => {
			
			if (stateName in widgetstate.updates && stateProp in widgetstate.updates[stateName]){
				const ___updates = widgetstate.updates[stateName][stateProp]

				Object.values(___updates).forEach(propsList => {
					Object.values(propsList).forEach(stateData => {
						const properties = []
						stateData.stateProps.forEach(i => {
							properties.push(widgetstate.name(stateName)[i])
						})

						let value = false

						if (typeof stateData.updateStateFunction == 'function'){
							value = stateData.updateStateFunction.apply(this, properties)
						} else {
							value = properties
						}


						const widgetType = widgetconvertor.getType(stateData.widget);
						switch (widgetType) {
							case 'Widget':
								if (stateData.changeWidgetProp == 'childs'){
									const child = c.div(value)
									widgetdom.update(stateData.widget, child)
								} else {
									stateData.widget.props[stateData.changeWidgetProp] = value
									widgetdom.assignProp(stateData.widget, stateData.changeWidgetProp)
								}
							break;
							case 'Function':
								const func = stateData.widget;
								if (typeof stateData.updateStateFunction == 'function'){
									func(value);
								} else {
									func.apply(this, value);
								}
							break;
							default:
								console.log('Не знаю как применить изменения ', widgetType);
							break;
						}

					})
				})



			}
		})

		// if (self.___parent) 
		// 	widgetstate.updateAll(self.___parent)
    }

    static props(self) {
		const props = {}
		Object.entries(self).map(([key, value]) => {
			if (['___updates', '___parent'].indexOf(key)==-1){
				props[key] = value;
			}
		})
        return props;
    }

	static check(self){
		const state = this;
		return (prop, val, _true, _false = false) => {
			return state.watch(prop, function(prop){
					return prop==val
						?_true
						:_false
				})
		}
	}

	static checkIn(self){
		const state = this;
		return (prop, val, _true, _false = false) => {
			return state.watch(prop, function(prop){
				const result = prop.includes(val)
						?_true
						:_false

				return result
			})
		}
	}

	static checkTurn(self){
		const state = this;
		return (prop) => {
			state[prop] = !state[prop]
		}
	}

	static map(self){
		const state = this;
		return (prop, callback = false) => {
			return state.watch(prop, function(prop){
				if (callback==false){
					return prop
				}
				const type = widgetconvertor.getType(callback)
				const array = Array.isArray(prop)?prop:Object.values(prop)
				const list = array.map(itm => {
					switch(type){
						case 'Function':
							const result = callback(itm)
							return result
						break;
					}
				})

				return list
			})
		}
	}

	static model(self){
		const state = this;
		return (prop, callback = false) => {
			return {
				link(widget, argument){
					// widget.rootElement.onchange = 
					const func = function(){
						const modelValue = this[argument]
						let value = modelValue
						if (callback){
							value = callback(value)
							if (modelValue!=value){
								widget.rootElement[argument] = value
							}
						}
						state[prop] = value;
					}

                    widgetdom.assignEventListener(widget, 'onchange', func)

					
					state.watch(prop, value => {
						if (callback){
							return callback(value)
						} else {
							return value
						}
					}).link(widget, argument)
				}
			}
		}
	}

	static modelIn(self){
		const state = this;
		return (prop, value) => {
			return {
				link(widget, argument){

					widgetdom.setChange(widget, 'modelIn' + prop, function() {
						const checkboxValue = this[argument]
						const unique = new Set(state[prop])
						if (checkboxValue){
							unique.add(value)
						} else {
							unique.delete(value)
						}
						state[prop] = Array.from(unique)
					})

					// widget.rootElement.onchange = function(){
					// 	const checkboxValue = this[argument]
					// 	const unique = new Set(state[prop])
					// 	if (checkboxValue){
					// 		unique.add(value)
					// 	} else {
					// 		unique.delete(value)
					// 	}
					// 	state[prop] = Array.from(unique)
					// }

					state.watch(prop, array => {
						return array.includes(value)
					}).link(widget, argument)
				}
			}
		}
	}







	static applyTo(self, prop, value){
		return () => widgetstate.name(self._name)[prop] = value
	}

}
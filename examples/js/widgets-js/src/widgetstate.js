

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


/* 

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
 */
		obj['___parent'] = false;

		let state = false;
		if (stateName in widgetstate.names){
			state = widgetstate.names[stateName]
		} else {
			state = new Proxy({}, {
				get(object, prop){
					if (widgetstate[prop]){

						return function(){
							const result = widgetstate[prop].apply(this, [object, ...arguments])
							if (typeof result == 'function'){
								const funcres = result.apply(this, arguments)
								return funcres
							} else {
								return result
							}
						}
					} else {
						if (prop in object)
							return object[prop]
						else
							return false
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

			widgetstate.useName(stateName, state)
		}


		if (props){
			widgetstate.setupProps(stateName, props)
		}

		Object.keys(obj).forEach(i => {
			if (obj && typeof obj[i]=='object' && i.substr(0,1)!='_'){
				let compStateValue = obj[i]
				if (Array.isArray(compStateValue)){
					const array = {}
					compStateValue.map((val, key) => {
						array[''+key] = val
					})
					compStateValue = array
				}
				
				state[i] = widgetstate.use(compStateValue)
				setParents.push(i)
			} else {
				state[i] = obj[i]
			}
		})

		setParents.forEach(i => {
			state[i].set('___parent', state)
		})


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
		if (widgetstate.props[stateName].alias==true || prop in widgetstate.props[stateName].alias){

			const aliasProp = widgetstate.getAlias(stateName, prop)
			const defaultValue = widgetstate.getDefaultValue(stateName, prop, aliasProp)

			if (defaultValue)
			if (widgetstate.valueCompare(defaultValue[0], value)){
				delete widgetstate.url[aliasProp.title]
			} else {
				const url = aliasProp.title in widgetstate.url?widgetstate.url[aliasProp.title]:false
				if (!widgetstate.valueCompare(url, value)){
					widgetstate.url[aliasProp.title] = value
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
			}, 300)
		}
	}

	static getDefaultValue(stateName, prop, aliasProp = false){
		if (aliasProp && aliasProp.generate){
			return prop.startsWith('_')
				?[[]]
				:[false]
		} else {
			let defaultValue = widgetstate.props[stateName]?.default
			if (defaultValue && prop in defaultValue) 
				return [defaultValue[prop]]
			else
				return false
		}
	}

	static getAlias(stateName, prop){
		const generate = widgetstate.props[stateName].alias==true
		const title = generate
			?prop.startsWith('_')
				?prop.substr(1)
				:prop
			:widgetstate.props[stateName].alias[prop]
		return {generate, title}
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
			(Array.isArray(key)?key:[key]).forEach(stateKey => {

				if (stateKey in widgetstate.props[self._name]?.default){
					widgetstate.name(self._name)[stateKey] = widgetstate.props[self._name].default[stateKey]
				}
			})
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
		if (prop in self && !self[prop].includes(value)){
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
			if (self._name in widgetstate.props)
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
		const data = {};
		for (const key of Object.keys(self)){
			if (key!='_name' && !key.startsWith('__')){
				data[key] = self[key]
			}
		}
		
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



    static watch(self, stateProps, callback = false) {
		const watcher = new widgetwatcher().state(self._name);

		let updateStateFunction = false;
		if (typeof stateProps == 'function'){
			updateStateFunction = stateProps
			const [_, fprops] = /\(?(.{0,}?)[\)|=]/m.exec(stateProps.toString())
			stateProps = fprops.split(',').map(i => i.trim())
		} else if (typeof stateProps == 'string'){
			stateProps = stateProps.split(',').map(i => i.trim())
		}

		if (updateStateFunction)
			callback = updateStateFunction
		
		if (Array.isArray(stateProps)){
			watcher.keys(stateProps)
		} else {
			watcher.set_props(stateProps)
		}

		if (callback)
			watcher.callback(callback)

		return watcher
    }


	static updates = {}

    static updateAll(stateName, stateProps = []){
		if (!Array.isArray(stateProps))
			stateProps = [stateProps]

		stateProps.forEach(stateProp => {
			if (stateName in widgetstate.updates && stateProp in widgetstate.updates[stateName]){
				const ___updates = widgetstate.updates[stateName][stateProp]

				Object.values(___updates).forEach(propsList => {
					Object.values(propsList).forEach(stateData => {
						stateData.refrash()
					})
				})
			}
		})
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
						const statevalue = state[prop] 
						const unique = new Set(Array.isArray(statevalue)?statevalue:[])
						if (checkboxValue){
							unique.add(value)
						} else {
							unique.delete(value)
						}
						state[prop] = Array.from(unique)
					})

					state.watch(prop, array => {
						return Array.isArray(array)?array.includes(value):false
					}).link(widget, argument)
				}
			}
		}
	}







	static applyTo(self, prop, value){
		return () => widgetstate.name(self._name)[prop] = value
	}

	static pushTo(self, prop, value){
		let temp = widgetstate.name(self._name)[prop]
		if (!Array.isArray(temp)) temp = [temp]
		temp.push(value)
		widgetstate.name(self._name)[prop] = false
		widgetstate.name(self._name)[prop] = temp
	}

}


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
		if ('_name' in obj){
			stateName = obj['_name'];
			delete obj['_name'];
		} else {
			stateName = 'state_' + widgetstate.state_length;
		}

		if (props && 'name' in props)
			stateName = props.name

		if (props){
			widgetstate.props[stateName] = props
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
                    return object[prop]
                }
            },
            set(object, prop, value){
                object[prop] = value
                widgetstate.updateAll(object, prop)
				return true
            }
        })

		setParents.map(i => {
			state[i].set('___parent', state)
		})

		widgetstate.useName(stateName, state)
        return state;
    }

	static useName(name, state){
		widgetstate.names[name] = state;
	}

	static set(self, key, value){
		self[key] = value
		widgetstate.updateAll(self)
	}

	static push(self, prop){
		const count = widgetstate.keys(self).length 
		self['' + count] = prop

		widgetstate.updateAll(this)
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
		return data
	}

	static values(self){
		return widgetstate.keys(self).map(itm => self[itm])
	}

	static map(self, func){
		return widgetstate.values(self).map(func)
	}

	static length(self){
		return widgetstate.keys(self).length
	}




	static inspector(state, widget, changeWidgetProp) {
		if ('link' in state)
			return state.link(widget, changeWidgetProp)
	}

    static watch(self){
        return ( stateProps, callback = false) => {
            let updateStateFunction = _vars => _vars;
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
                link(widget, changeWidgetProp){
                    if (!('___updates' in self)) self.___updates = {}

                    const state = {
                        widget,
                        changeWidgetProp,
                        updateStateFunction,
                        stateProps
                    }
					const key = widget.id + '-' + stateProps.join(',')

					if (!(state in widget)) widget.state = {}
					if (!(changeWidgetProp in widget.state)) widget.state[changeWidgetProp] = {
						link: self.___updates,
						key,
						stateProps
					}

                    stateProps.map(stateProp => {
                        if (!(stateProp in self.___updates)) self.___updates[stateProp] = {}
                        // self.___updates[stateProp].push(state)
                        self.___updates[stateProp][key] = state



                        widgetstate.updateAll(self, stateProp)
                    })

                }
            }
        }
    }

    static updateAll(self, _stateProp = false) {
		let stateProps = [] 
		if (_stateProp==false)
			stateProps = widgetstate.keys(self)
		else 
			stateProps = [_stateProp]
		
		stateProps.forEach(stateProp => {

			if ('___updates' in self && stateProp in self.___updates){
				Object.values(self.___updates[stateProp]).forEach(stateData => {

                    const properties = []
					stateData.stateProps.forEach(i => {
						properties.push(self[i])
					})

                    const value = stateData.updateStateFunction.apply(this, properties)
                    
                    if (stateData.changeWidgetProp == 'childs'){
						widgetdom.update(stateData.widget, c.div(value))
                    } else {
                        stateData.widget.props[stateData.changeWidgetProp] = value
                        widgetdom.assignProp(stateData.widget, stateData.changeWidgetProp)
                    }
				})
			}
		})

		if (self.___parent) 
			widgetstate.updateAll(self.___parent)
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


	static checkTurn(self){
		const state = this;
		return (prop) => {
			state[prop] = !state[prop]
		}
	}


	static model(self){
		const state = this;
		return (prop, callback = false) => {
			return {
				link(widget, argument){
					widget.rootElement.onchange = function(){
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
}
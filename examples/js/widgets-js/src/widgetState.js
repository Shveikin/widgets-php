
class WidgetState {
	// static names = {}; 
	static state_length = 0;
	static names = {};

	static name(name){
		if (!(name in WidgetState.names)){
			console.info(`state ${name} отсутствует! Используется пустой state`)
			WidgetState.names[name] = WidgetState.use({_name: name})
		}
		return WidgetState.names[name]
	}

	static update(globalState){
		const _name = globalState._name;
		Object.keys(globalState).map(itm => {
			if (itm!='_name')
				WidgetState.name(_name)[itm] = globalState[itm]
		})
	}

    static use(obj){
		WidgetState.state_length++;
		const setParents = []

		if (obj==null | obj==false)
			obj = {}

		let stateName = '';
		if ('_name' in obj){
			stateName = obj['_name'];
			delete obj['_name'];
		} else {
			stateName = 'state_' + WidgetState.state_length;
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
					obj[i] = WidgetState.use(obj[i])
					setParents.push(i)
				}
			}
		})

		obj['___parent'] = false;

        const state = new Proxy(obj, {
            get(object, prop){
                if (WidgetState[prop]){
                    return function(){
						const result = WidgetState[prop].apply(this, [object, ...arguments])
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
                WidgetState.updateAll(object, prop)
				return true
            }
        })

		setParents.map(i => {
			state[i].set('___parent', state)
		})

		WidgetState.useName(stateName, state)
        return state;
    }

	static useName(name, state){
		WidgetState.names[name] = state;
	}

	static set(self, key, value){
		self[key] = value
		WidgetState.updateAll(self)
	}

	static push(self, prop){
		const count = WidgetState.keys(self).length 
		self['' + count] = prop

		WidgetState.updateAll(this)
	}

	static filterSystemVars(array){
		const exception = ['___updates', '___parent'] 
		return array.filter(itm => {
			return exception.indexOf(itm)==-1
		})
	}

	static keys(self){
		return WidgetState.filterSystemVars(Object.keys(self))
	}

	static data(self){
		const data = { ...self }
		delete data['___parent']
		delete data['___updates']
		return data
	}

	static values(self){
		return WidgetState.keys(self).map(itm => self[itm])
	}

	static map(self, func){
		return WidgetState.values(self).map(func)
	}

	static length(self){
		return WidgetState.keys(self).length
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
		return (prop) => {
			return {
				link([element, argument]){
					element.oninput = function(){
						state[prop] = element[argument];
					}
					element[argument] = state[prop]
				}
			}
		}
	}

    static watch(self){
        return (props, callback = false) => {
            let updateFunction = _vars => _vars;
            if (typeof props == 'function'){
                // try {
                    updateFunction = props
                    const [_, fprops] = /\(?(.{0,}?)[\)|=]/m.exec(props.toString())
                    props = fprops.split(',').map(i => i.trim())
                // } catch (e) {
                    // props = Object.keys(self.props)
                // }
            } else if (typeof props == 'string'){
                props = props.split(',').map(i => i.trim())
				if (callback){
					updateFunction = callback
				}
            }

            return {
                link(path, property){
                    if (!('___updates' in self)) self['___updates'] = {}
                    
                    props.map(prop => {
                        // if (!(prop in self['___updates'])) self['___updates'][prop] = []
                        // self['___updates'][prop].push({
                        //     path: Array.isArray(arguments[0])?arguments[0]:arguments,
                        //     update: updateFunction,
                        //     props: props
                        // })

						if (!(prop in self['___updates'])) self['___updates'][prop] = {}
                        self['___updates'][prop][path] = {
                            // path: Array.isArray(arguments[0])?arguments[0]:arguments,
                            update: updateFunction,
                            props: property//props
                        }

                        return WidgetState.updateAll(self, prop)
                    })

					return false;
                }
            }
        }
    }


	static inspector(func, path, property) {
		if ('link' in func)
			return func.link(path, property)
	}




	/**
	 * Установить значение по пути до элемента
	 * 
	 * @param {array} elementProps 
	 * @param {*} value 
	 */
	static elementPropsArraySetValue(elementProps, value){
		let element = elementProps.shift();
		let elementPropperty = 'child'
		while (elementProps.length!=0){
			elementPropperty = elementProps.shift();
			if (elementProps.length==0)
				break
			
			element = element[elementPropperty]
		}

		if (elementPropperty.substr(0,1)=='on' && typeof value == 'function'){
			el.addEventListener(elementPropperty, value, false);
		} else {
			element[elementPropperty] = value
		}
	}

    static updateAll(self, _prop = false) {
		let props = [] 
		if (_prop==false)
			props = WidgetState.keys(self)
		else 
			props = [_prop]
		
		props.map(prop => {

			if ('___updates' in self && prop in self['___updates']){
				// self['___updates'][prop].map(updateList => {
				Object.keys(self['___updates'][prop]).map(path => {
					const updateList = self['___updates'][prop][path];
					
					const update = updateList.update
					const mp = updateList.props

					// let element = widgetDom.name(path)
					
					
					
					let elementPropperty = 'childs'
					while (mp.length!=0){
						elementPropperty = mp.shift();
						if (mp.length==0)
						break
						
						element = element[elementPropperty]
					}


					const properties = []
					props.map(i => {
						properties.push(self[i])
					})
					
					const value = update.apply(this, properties)
					WidgetState.apply(path, elementPropperty, value)
					// if (element){
					// 	if (elementPropperty=='childs'){
					// 		element[elementPropperty] = [WidgetConvertor.toXElement(widgetDom.pk(path, 0), value)]
					// 	} else {
					// 		element[elementPropperty] = value
					// 	}
					// 	// element.assignProp(elementPropperty, value)



					// 	if (querySelector in widgetDom.virtualDom){
					// 		const DOM = widgetDom.virtualDom[querySelector]
					// 		document.getElementById('dom').innerHTML = JSON.stringify(DOM, null, '   ')
					// 		console.log('DOM', DOM)
					// 	}


					// } else {
					// 	return value;
					// }


				})
			}
		})

		if (self.___parent) 
			WidgetState.updateAll(self.___parent)
    }





	static apply(path, prop, value){
		const element = widgetDom.name(path)
		const querySelector = path.split('/')[0]

		// widgetDom.name(path)
		if (element){
			if (prop=='childs'){
				element[prop] = [WidgetConvertor.toXElement(widgetDom.pk(path, 0), value)]
			} else {
				element[prop] = value
			}
		}
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
}
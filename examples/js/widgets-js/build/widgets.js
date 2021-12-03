// convertor.js

class WidgetConvertor {

    static convert(element, from, to, state = false){
        const func = `${from}To${to}`
		console.log(func, element)
        if (func in WidgetConvertor){
			const result = WidgetConvertor[func](element, state)
			const newType = WidgetConvertor.getType(result)
			if (newType==to){
				return result;
			} else {
				return WidgetConvertor.convert(result, newType, to)
			}
        } else {
            throw new Error(`${func} отсутствует!`);
        }
    }

	static toHTML(element, state = false){
        return WidgetConvertor.convert(element, WidgetConvertor.getType(element), 'HTML', state)
    }

    static StringToHTML(element){
        const wrapper = document.createElement('div')
        wrapper.innerHTML = element
        return wrapper
    }

	static WidgetToHTML(element){
        return element.element()
    }

	static FunctionToHTML(func, state = false){
		if (state && typeof state=='object' && WidgetConvertor.getType(state)!='State'){
			state = WidgetState.use(state)
		}
        return func(state)
    }

	static StateToHTML(state){
		return c.div({innerHTML: state})
	}

	static ArrayToHTML(array){
		const wrapper = document.createElement('div')
		array.map(element => {
			wrapper.appendChild(WidgetConvertor.toHTML(element))
		})
		return wrapper
	}

	static propsCorrector(props){
		const type = WidgetConvertor.getType(props)
		switch (type){
			case 'State':
			case 'Element':
			case 'WidgetTools':
            case 'String':
				props = {child: props}
			break;
		}

		props._name = widget.nextName(props)

		return props;
	}

    /**
     * Якляется ли элементе одним из указанных типов
     * @param {*} element 
     * @param {*} to 
     * @returns 
     */
    static checkType(element, to){
		return to.includes(WidgetConvertor.getType(element))
	}

    /**
     * Получить тип элемента
     * @param {*} element 
     * @returns type
     */
    static getType(element){
		let type = 'Unknown'
		if (typeof element=='number')
			type = 'Int'
		if (typeof element=='string')
			type = 'String'
		if (element instanceof HTMLElement)
			type = 'HTML'
		else
		if (typeof element == 'object' && 'widget' in element)
			type = 'Widget'
		else
		if (typeof element == 'object' && 'link' in element)
			type = 'State'
		else
		if (element && typeof element == 'object' && 'element' in element){
			type = 'Element'
			if (typeof WidgetTools[element.element] === 'function'){
				type = 'WidgetTools'
			}
		}
		else
		if (typeof element == 'function')
			type = 'Function'
		else
		if (Array.isArray(element))
			type = 'Array'
		
		return type;
	}


    // static convertor({element, state = false,  to}) {
	// 	// console.log(element, ' >> ', WidgetConvertor.getType(element), '>>>>', to)
	// 	if (WidgetConvertor.checkType(element, to)) {
	// 		// console.log('_____exit________')
	// 		return element
	// 	}

	// 	switch(WidgetConvertor.getType(element)){
	// 		case 'Widget':
	// 			return widget.convertor({
	// 				element: element.element(),
	// 				state,
	// 				to
	// 			})
	// 		case 'WidgetTools':
	// 			return widget.convertor({
	// 				element: WidgetTools[element.element](element),
	// 				state,
	// 				to
	// 			})
	// 		case 'Element':
	// 			const tag = element.element
	// 			return widget.convertor({
	// 				element: c[tag](element),
	// 				state,
	// 				to
	// 			})
	// 		case 'State':
	// 			const stateWrapper = c.div()
	// 			WidgetState.inspector(element, [stateWrapper.name, 'child'])
	// 			return widget.convertor({
	// 				element: stateWrapper,
	// 				state,
	// 				to
	// 			})
	// 		case 'Function':
	// 			return widget.convertor({
	// 				element: element(WidgetState.use(state)),
	// 				state,
	// 				to
	// 			})
	// 		case 'String':
	// 			return widget.convertor({
	// 				element: c[widget.defaultTag]({innerHTML: element}),
	// 				state,
	// 				to
	// 			})
	// 		case 'Array':
	// 			const wrapper = document.createElement('div')
	// 			element.map(itm => {
	// 				wrapper.appendChild(
	// 					widget.convertor({
	// 						element: itm,
	// 						to: ['HTML']
	// 					})
	// 				)
	// 			})
	// 			return widget.convertor({
	// 				element: wrapper,
	// 				to
	// 			})
	// 	}

	// 	return false;
	// }

}
// widgets.js


class widget {
	static defaultTag = 'div'
	static lastDialog = null
	static dialogHeight = {}
	static widgetStore = {}
    static names = {}
    static names_length = 0
	
    static proxys = {}
	static name(name){
		if ('widget' in widget.proxys[name]){
			return widget.proxys[name];
		} else {
			const props = widget.proxys[name];
			const element = c[props.element](props)
			widget.proxys[name] = element;
			return element;
		}
    }



	static createElement(tag = false, props = false, state = false) {
		return c[tag](props, state)
	}

    static widgetRegister(name, _widget = () => false) {
		if (name in widget.widgetStore){
			throw 'Компонент ' + name + ' - уже зарегистрирован!';
			return false;
		}
		widget.widgetStore[name] = (prps) => {
			return _widget(prps)
		}
		return true;
	}

	static nextName(props){
		let _name = 'element_';
		if (typeof props == 'object' && '_name' in props){
			_name = props._name;
		} else {
			widget.names_length++
			_name += widget.names_length;
		}
		return _name;
	}

	static indexName(index, name){
        return widget.name(name + '_' + index)
    }

	static singleElement = {
		area: false,
		base: false,
		br: false,
		col: false,
		embed: false,
		hr: false,
		img: 'src',
		input: 'value',
		textarea: 'value',
		link: 'href',
		menuitem: false,
		meta: false,
		param: false,
		source: false,
		track: false,
		wbr: false,
	}

    constructor(tag, props = {}, state = false) {
		const _name = widget.nextName(props)

        this.childs = []
        this.props = {
            element: tag,
            _name
        }

		this.element = document.createElement(tag);
		widget.names[_name] = this.element

        if (typeof props == 'function' && state){
            props = props(WidgetState.use(state))
        }

		this.assignProps(props)
    }

	assignProps(props){
		if (Array.isArray(props)){
			// this.assignProp('child', props)
			this.setChild(props)
		} else {
			if (typeof props == 'object' && !('widget' in props)){
				Object.keys(props).map(prop => {
					this.assignProp(prop, props[prop])
				})
			} else {
				// this.assignProp('child', props)
				this.setChild(props)
			}
		}
	}

	setChild(child){
		this.childs = child
		this.renderChilds()
	}
	
	renderChilds(){
		this.element.innerHTML = '';
		let _chils = this.childs

		switch(WidgetConvertor.getType(this.childs)){
			case "String":
				this.element.innerHTML = _chils;
			break;
			case "Widget":
			case "State":
			case "Function":
			case "Array":
				_chils = WidgetConvertor.toHTML(this.childs)
			default:

				this.element.appendChild(_chils)
			break;
		}
		
	}

    assignProp(prop, value){ // prop = value
		if (prop=='child' && this.props.element in widget.singleElement){
			const setChildToProp = widget.singleElement[this.props.element]
			if (setChildToProp){
				this.__link(setChildToProp, value)
			}
		} else 
        if (prop=='child'){
			this.setChild(value)
        } else {
			let update = true;
			if (WidgetConvertor.getType(this.props[prop])=='WidgetTools'){
				update = this.props[prop]['view'] != value
				if (update)
					this.props[prop]['view'] = value
			} else {
				update = this.props[prop] != value
				if (update)
					this.props[prop] = value
			}
			if (update){
				this.assignPropToElement(prop, value);
			}
        }
    }

	
	assignPropToElement(prop, value){
		switch (prop) {
			case '_name':
			
			break;
			case 'child':
				this.setChild(value)
			break;
			case 'style':
				
			break;
			default:
				this.__link(prop, value)
			break;
		}
	}

	__link(prop, value){
		if (!Array.isArray(prop)){
			if (WidgetConvertor.getType(value)=='State') {
				WidgetState.inspector(value, [this.props._name, prop])
			} else {
				this.element[prop] = value
			}
		} else {
			console.info('__link','Применение массива не поддурживается', props, value);
		}
	}

    static pushChilds(array, childs){
        if (Array.isArray(childs)) {
            childs.map(itm => {
                widget.pushChilds(array, itm)
            })
        } else if (typeof childs == 'object' && 'widget' in childs) {
            array.push(childs.toArray())
        } else {
            array.push(childs)
        }
    }

    toArray(){
        const childs = []
        widget.pushChilds(childs, this.childs);

        const element = this.props;
        if (childs.length!=0) {
            element['child'] = childs;
        }

        return element;
    }

    toElement(){
		return this.element
		// const name = this.props._name;
		// if (name in widget.names){
		// 	return widget.names[name]
		// } else {
		// 	// return widget.createElement('__', this.toArray())
		// }
    }

	name(){
		return this.props._name;
	}

	setName(self, name){
		const _last_name = this.props._name
		if (_last_name in widget.names){
			const domElement = widget.names[_last_name]
			delete widget.names[_last_name]
			widget.names[name] = domElement
		}
		this.props._name = name
		widget.proxys[name] = self
	}

    setProp(self, prop, value, dopvalue){ // prop.(val)
        switch(prop){
			case 'indexName':
				this.setName(self, dopvalue + '_' + value)
                return self
			break;
            case 'name': 
                this.setName(self, value)
                return self
            case 'toArray':
                return this.toArray();
            case 'element':
                return this.toElement();
            default: // add child to self
                const child = c[prop](value)
                self.child = child
                return child
        }
    }


    static renderTo(querySelector, element, state = false){
		element = WidgetConvertor.toHTML(element, state)
		let toElement = window.document.querySelector(querySelector);
		if (toElement){
			toElement.innerHTML = '';
			toElement.appendChild(element)
		} else {
			window.addEventListener('load', () => {
				toElement = window.document.querySelector(querySelector);
				toElement.innerHTML = '';
				toElement.appendChild(element)
			});
		}
    }

    static app(render, state = {}){
        c.renderTo('#app', render, state)
    }

    static body(element, state){
        widget.renderTo('body', element, state)
    }
}

// childController.js

// widgetTools.js

class WidgetTools{
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
			props._true, 
			props._false
		)
	}

	static func(props){
		let func = Function(props.function);
		// eval(`
		// 	func = async function(){
		// 		${}
		// 	}
		// `)
		return func
	}

}
// widgetState.js

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
		return (prop, _true, _false = false) => {
			return state.watch(prop, function(prop){
				return prop
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
                link(){
                    if (!('___updates' in self)) self['___updates'] = {}
                    
                    props.map(prop => {
                        if (!(prop in self['___updates'])) self['___updates'][prop] = []
                        self['___updates'][prop].push({
                            path: Array.isArray(arguments[0])?arguments[0]:arguments,
                            update: updateFunction,
                            props: props
                        })
                        WidgetState.updateAll(self, prop)
                    })
                }
            }
        }
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
				self['___updates'][prop].map(updateList => {
					const props = updateList.props
					const update = updateList.update
					const mp = [...updateList.path]

					let element = mp.shift();
					if (typeof element == 'string'){
						element = widget.name(element)
					}

					let elementPropperty = 'child'
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
					
					const value = update.apply(this, properties);
					element[elementPropperty] = value
				})
			}
		})

		if (self.___parent) 
			WidgetState.updateAll(self.___parent)
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


    static inspector(func, to) {
		if ('link' in func)
			func.link(to)
		else
			console.log('Find State');
	}
}
// c.js

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

				const _widget = {
					widget: new widget(tag, lite)
				}
                const proxyProps = new Proxy(
                    _widget, 
					{
                        get: (el, prop) => {
							if (typeof _widget.widget[prop] == 'function'){
								return _widget.widget[prop]()
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




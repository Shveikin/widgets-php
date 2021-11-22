

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
			return c[props.element](props)
		}
    }

	static convertor(element, state = false) {
		if (element===false || element===undefined)
			return false;
		if (element instanceof HTMLElement) {
			return element
		}

		if (element && typeof element == 'object' && 'widget' in element){
			return widget.convertor(element.element())
		} else
		if (element && typeof element == 'object' && 'element' in element){
			const tag = element.element
			// delete element.element

			if (typeof WidgetTools[tag] === 'function'){
				return widget.convertor(WidgetTools[tag](element));
			} else {
				return widget.convertor(widget.createElement(tag, element, state))
			}
		} else 
		if (WidgetState.canBind(element)){ // попытка отобразить watcher
			const temp_child = document.createElement(widget.defaultTag)
			element.link(temp_child, 'child')
			return temp_child
		} else
		if (typeof element == 'function'){
			if (state){ // layout function
				const layout = c.div();
				layout.element = 'div';

				element(layout, WidgetState.use(state))

				return widget.convertor(layout)
			} else {
				return widget.convertor(element())
			}
		} else {
			const temp_child = document.createElement(widget.defaultTag)
			temp_child.innerHTML = element
			return temp_child
		}
	}

    static* childToHTMLElement(child, state = false) {
		if (Array.isArray(child)){
			for(const _child of child){
				const cheldGenerator = widget.childToHTMLElement(_child)
				for(const __child of cheldGenerator){
					yield widget.convertor(__child)
				}
			}
		} else {
			yield widget.convertor(child, state)
		}

	}

	static createElement(element, props = false, state = false) {
        let tag = 'div'

		if (typeof props == 'object' && 'element' in props){
			if (!(element instanceof HTMLElement)){
				element = props.element
			}
		}

		if (state){
			state = WidgetState.use(state)
		}

		// Оброботка state
		if (typeof props == 'function'){
			props = props(state==false?WidgetState.use({}):state)
		}

		const true_elements = [
			"area", "base", "br", 
			"col", "embed", "hr", 
			"img", "input", "link", 
			"menuitem", "meta", "param", 
			"source", "track", "wbr"
		]

		function isEmpty(obj) { 
			for (var x in obj) { return false; }
			return true;
		}

		// Оброботка props
		if (props 
			&& true_elements.indexOf(element)==-1 
			&& !isEmpty(props)
			&& (
			Array.isArray(props)
			|typeof props == 'string'
			|(typeof props == 'function' && state==false)
			|(typeof props == 'object' && 
				((
					!('_name' in props) && 
					!('child' in props) && 
					!('innerHTML' in props) && 
					!('value' in props) && 
					!(element in widget.widgetStore)
				) 
				// | (('element' in props))
				)
			) 
			|props instanceof HTMLElement
		)) {
			props = {child: props}
		}


		// Оброботка element
		if (element in widget.widgetStore){
			return widget.widgetStore[element](props, state)
		} else 
		if (typeof element == 'string'){


			// быстрые классы
			if (element.indexOf("__")!=-1){
				const classes = element.split('__')
				element = classes[0]
				let classList = ''
				classes[1]
					.replaceAll('$$', '-')
					.replaceAll('$', ' ')
					.split('')
					.map(char => {
					if (char!=char.toLowerCase(char)){
						classList += '-' + char.toLowerCase(char)
					} else {
						classList += char
					}
				})

				if (!props)
					props = {}

				props['className'] = classList
			}


			if (element!='') tag = element
			element = document.createElement(tag)
		}

		let oncreate = false;

        const childAsValue = ['textarea', 'input']

		// Применение свойств
		if (props) 
		for (let i of Object.keys(props)) { 
			let prop = props[i];

            if (i=='child' && childAsValue.includes(tag)) {
                i = 'value'
            }

			if (prop && typeof prop == 'object' && 'element' in prop && prop.element == 'function'){
				eval(`prop = function(){
					${prop?.function}
				}`)
			}

			if (prop && typeof prop == 'object' && 'element' in prop){
				if (typeof WidgetTools[prop.element]=='function'){
					const new_prop = WidgetTools[prop.element](prop); 
					prop = new_prop;
				}
			}


			switch (i) {
				case 'element':

				break;
                case '_name':
                    widget.names[prop] = element
					if (!(prop in widget.proxys)) {
						widget.proxys[prop] = props
						widget.proxys[prop]['element'] = tag;
					}
                break;
				case 'oncreate':
					oncreate = prop.bind(element)
				break;
				case 'style':
					if (typeof prop == 'string')
						element.style = prop
					else
						for (let j of Object.keys(prop)) {
							const styleElement = prop[j]
							if (Array.isArray(styleElement)){
								element.style[j] = styleElement[0]
								setTimeout(() => 
									element.style[j] = styleElement[1]
								, 10)
							} else {
								if ((typeof styleElement == 'object' && 'link' in styleElement) | typeof styleElement == 'function') {
									WidgetState.inspector(styleElement, [element, i, j])
								} else {
									element.style[j] = styleElement
								}
							}
						}
				break;
				case 'child':
					while (element.firstChild)
						element.removeChild(element.firstChild);

					const cheldGenerator = widget.childToHTMLElement(prop)
					for(const _child of cheldGenerator){
						if (_child)
							element.appendChild(_child)
					}

				break;
				default:
					if (WidgetState.canBind(prop) || (typeof value == 'function' && i.substr(0, 2) != 'on')) {
						WidgetState.inspector(prop, [element, i])
					} else {
						element[i] = prop
					}
				break;
			}
		} 
		if (oncreate && typeof oncreate == 'function') oncreate();


		props
		state

		return element
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

    constructor(tag, props = {}, state = false){
		let _name = 'element_';
		if (typeof props == 'object' && '_name' in props){
			let _name = props._name;
		} else {
			widget.names_length++
			_name += widget.names_length;
		}
        this.childs = []
        this.props = {
            element: tag,
            _name
        }

        if (typeof props == 'function' && state){
            props = props(WidgetState.use(state))
        }

		if (Array.isArray(props)){
			props.map(child => {
				// this.assignProp('child', props)
				this.childs.push(child)
			})
		} else
        if (typeof props == 'object' && !('widget' in props)){
            Object.keys(props).map(prop => {
                this.assignProp(prop, props[prop])
            })
        } else {
            this.assignProp('child', props)
        }
    }

	static indexName(index, name){
        return widget.name(name + '_' + index)
    }

    assignProp(prop, value){ // prop = value
        if (prop=='child'){
            this.childs.push(value)
			// if (this.props._name in widget.names){
			// 	delete widget.names[this.props._name]
			// }
        } else {
            this.props[prop] = value
        }

        if (this.props._name in widget.names){
            const elenemt = widget.names[this.props._name]
            widget.createElement(elenemt, this.toArray())
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
		const name = this.props._name;
		if (name in widget.names){
			return widget.names[name]
		} else {
			return widget.createElement('__', this.toArray())
		}
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
		element = widget.convertor(element, state)
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

	static watcher(props){
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

		// return WidgetState.name(props.state)
		// 	.check(
		// 		WidgetTools.getStatePropFromPath(
		// 			WidgetState.name(props.state),
		// 			props.prop.split('.')
		// 		), 
		// 		props._true, 
		// 		props._false
		// 	);
	}
}

const w = (element, params = false, state = false) => widget.createElement(element, params, state);
const c = new Proxy({}, {
	get:(_, tag) => {
		if (typeof widget[tag] === 'function'){
            // c.app(sett)
			return widget[tag]
		} else {
            // c.div(props) -> return proxi with class
            return (property) => {
                const proxyProps = new Proxy(
                    {
                        widget: new widget(tag, property)
                    }, {
                        get: (el, prop) => {
                            return (value, dopvalue = false) => {
                                return el.widget.setProp(proxyProps, prop, value, dopvalue)
                            }
                        },
                        set: (el, prop, value) => {
                            el.widget.assignProp(prop, value)
                            return true;
                        }
                    }
                )
                return proxyProps
            }
		}
	},
	set:(el, tag, props) => widget.widgetRegister(tag, props)
})


class WidgetState {
	static names = {}; 
	static state_length = 0;

	static name(name){
		return WidgetState.names[name]
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

		WidgetState.names[stateName] = state;
        return state;
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

	static values(self){
		return WidgetState.keys(self).map(itm => self[itm])
	}

	static map(self, func){
		return WidgetState.values(self).map(func)
	}

	static length(self){
		return WidgetState.keys(self).length
	}

	static canBind(value){
		const res = (typeof value == 'object' && value!=null && 'link' in value)
		return res
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
					w(element, {
						[elementPropperty]: value
					})
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
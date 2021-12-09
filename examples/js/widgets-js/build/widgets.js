// convertor.js

class WidgetConvertor {

    static convert(element, from, to, state = false){
        const func = `${from}To${to}`
		// console.log(func, element)
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

	static toStr(element){
		return WidgetConvertor.convert(element, WidgetConvertor.getType(element), 'String')
	}

	static toHTML(element, state = false){
        return WidgetConvertor.convert(element, WidgetConvertor.getType(element), 'HTML', state)
    }

	static toState(element){
        return WidgetConvertor.convert(element, WidgetConvertor.getType(element), 'State')
    }

    static StringToHTML(element){
        const wrapper = WidgetTools.createElement('div')
        wrapper.innerHTML = element
        return wrapper
    }

	static WidgetToHTML(element){
        return element.element
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
		const wrapper = WidgetTools.createElement('div')
		array.map(element => {
			wrapper.appendChild(WidgetConvertor.toHTML(element))
		})
		return wrapper
	}

	static ElementToHTML(element){
		return c.div(element)
	}

	static ElementToString(element){
		return c.div(element).element.outerHTML;
	}

	static WidgetToolsToState(element){
		return WidgetTools.create(element)
	}

	static WidgetToolsToHTML(element){
		const element2 = WidgetTools.create(element)
		return WidgetConvertor.toHTML(element2);
	}

	static propsCorrector(props){
		const type = WidgetConvertor.getType(props)
		switch (type){
			case 'State':
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



	static applyState(name, prop, value){
		let change = false;
		if (WidgetConvertor.getType(value)=='WidgetTools'){
			value = WidgetTools.create(value)
			change = true
		}

		if (WidgetConvertor.getType(value)=='State'){
			value = WidgetState.inspector(value, [name, prop])
			change = true
		}

		return change?value:false
	}


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

		this.element = tag instanceof HTMLElement?tag:WidgetTools.createElement(tag, _name);
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

		const neeChils = WidgetConvertor.applyState(this.props._name, 'child',  _chils)
		if (neeChils) _chils = neeChils

		switch(WidgetConvertor.getType(_chils)){
			case "String":
				this.element.innerHTML = _chils;
			break;
			case "Array":
				_chils.map(chl => {
					chl = WidgetConvertor.toHTML(chl)
					if (chl === this.element){
						console.log(this.props._name)
					}
					try {
						this.element.appendChild(chl)
					} catch(e){
						console.log(chl) 
						console.log(this.element)
						console.log(this.props._name)
						console.log(e)
					}
				})
			break;
			case "Element":
			case "Widget":
			case "State":
			case "Function":
				_chils = WidgetConvertor.toHTML(_chils)
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
			// case 'style':
				
			// break;
			default:
				this.__link(prop, value)
			break;
		}
	}

	/**
	 * Установка свойства
	 * @param {*} prop 
	 * @param {*} value 
	 * 
	 * Свойство может быть следующих типо
	 * String
	 * State
	 * Array - анимация
	 * WidgetTools - проверить на widgettools
	 */
	__link(prop, value){
		if (!Array.isArray(prop)){
			const neeValue = WidgetConvertor.applyState(this.props._name, prop, value)
			if (neeValue) value = neeValue
			

			const type = WidgetConvertor.getType(value)

			switch(type){
				case 'String':
				case 'Int':
					this.element[prop] = value
				break;
				case 'Function':
					if (prop.substr(0,2)=='on'){
						this.element[prop] = () => {
							value(); 
							console.log('test!111')
						}
					} else {
						this.element[prop] = value()
					}
				break;
				case 'Element':
					this.element[prop] = WidgetConvertor.toStr(value)
				break;
				default:
					// console.info('Не применено', prop, value, type)
				break;
			}
		} else {
			console.info('__link','Применение массива не поддурживается', props, value);
		}
	}

	static AppyState


    static pushChilds(array, childs){
		if (this.tag == '')
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
		if ('value' in element) {
			element.value = widget.name(element._name).value 
		}

		if (this.props.element in widget.singleElement && widget.singleElement[this.props.element]){
			const child = widget.singleElement[this.props.element]
			element[child] = widget.name(element._name).element[child] 
		}

        if (childs.length!=0) {
            element['child'] = childs;
        }

        return element;
    }

	element(){
		return () => this.element
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

	setMyName(self, name){
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
				this.setMyName(self, dopvalue + '_' + value)
                return self
			break;
			case 'setName': 
            case 'name': 
                this.setMyName(self, value)
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

// widgetDom.js
/** @jsx h */

function h(type, props, ...children) {
    return {type, props, children};
}

function createElement(virtualNode) {
    if (typeof virtualNode === 'string') {
        return document.createTextNode(virtualNode);
    }
    const rootElement = document.createElement(virtualNode.type);
    virtualNode.props && Object.keys(virtualNode.props).forEach((key) => {
        rootElement.setAttribute(key, virtualNode.props[key]);
    });
    virtualNode.children.map(createElement).forEach((childElement) => {
        rootElement.appendChild(childElement);
    });
    return rootElement;
}

function update(rootElement, currNode, nextNode, index = 0) {
    if (!nextNode) {
        rootElement.removeChild(rootElement.childNodes[index]);
    } else if (!currNode) {
        rootElement.appendChild(createElement(nextNode));
    } else if (changed(currNode, nextNode)) {
        rootElement.replaceChild(createElement(nextNode), rootElement.childNodes[index]);
    } else if (typeof nextNode !== 'string') {
        for (let i = 0; i < Math.max(currNode.children.length, nextNode.children.length); i++) {
            update(rootElement.childNodes[index], currNode.children[i], nextNode.children[i], i);
        }
    }
}

function changed(nodeA, nodeB) {
    return (
        typeof nodeA !== typeof nodeB ||
        typeof nodeA === 'string' && nodeA !== nodeB ||
        nodeA.type !== nodeB.type
    );
}

function render(virtualRoot, domRoot) {
    domRoot.appendChild(createElement(virtualRoot));
}

const root = document.getElementById('app');
const app = <div><span>hello, world!</span><div>hello</div></div>;
const nextApp = <div><span>hello, world!</span><div>hello</div></div>;

render(app, root);

let counter = 0;
setInterval(() => {
    if (counter++ % 2 == 0) {
        update(root, app, nextApp);
    } else {
        update(root, nextApp, app);
    }
}, 1000);
// widgetTools.js

class WidgetTools{
	static create(element){
		return WidgetTools[element.element](element)
	}

	static register = {}
	static createElement(tag, name = false){
		let element = false;
		if (!name){
			name =  'auto_' + Object.keys(WidgetTools.register).length;
			element = document.createElement(tag);
		} else {
			if (name in WidgetTools.register){
				element = WidgetTools.register[name]
			} else {
				element = document.createElement(tag);
			}
		}
		WidgetTools.register[name] = element;
		return element;
	}

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

					return false;
                }
            }
        }
    }


	static inspector(func, to) {
		if ('link' in func)
			return func.link(to)
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
				if ('element' in property){
					tag = property.element
				}

				const _widget = {
					widget: new widget(tag, lite)
				}
                const proxyProps = new Proxy(
                    _widget, 
					{
                        get: (el, prop) => {
							if (typeof _widget.widget[prop] != 'undefined'){
								return _widget.widget[prop]
							} else
							if (prop!='setName' && prop.substr(0,3)=='set'){
								return function(value){
									el.widget.assignProp(prop.substr(3).toLowerCase(), value)
									return proxyProps;
								}
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




// convertor.js

class WidgetConvertor {

    static convert(path, element, from, to, state = false){
		if (from == to){
			return element
		}
        const func = `${from}To${to}`
		
        if (func in WidgetConvertor){
			const result = WidgetConvertor[func](path, element, state)
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






	static ArrayToXElement(path, array){
		const object = {
			type: 'div',
			props: {},
			childs: array.map((itm, key) => WidgetConvertor.toXElement(widgetDom.pk(path, key), array))
		}
		return object
	}

	static StringToXElement(path, string){
		const object = {
			type: 'div',
			props: {
				innerHTML: string
			},
			childs: []
		}
		return object
	}

	static ArrayToXElementArray(path, array){
		const result = array.map((element, key) => {
			const result = WidgetConvertor.toXElement(widgetDom.pk(path, key), element)
			return result
		})

		return result
	}

	static StateToXElement(path, state){
		const object = {
			type: 'div',
			props:  {},
			childs: []
		}
		
		widgetDom.names[path] = object
		WidgetState.inspector(state, path, ['childs'])

		// throw new Error(`${func} отсутствует!`);

		return object
	}













	// static ArrayToWidgetsArray(array){
	// 	const result = array.map(element => {
	// 		const result = WidgetConvertor.toXElement(element)
	// 		return result
	// 	})

	// 	return result
	// }

	// static ArrayToWidget(array){
	// 	const element = new widget('div', {}, WidgetConvertor.ArrayToWidgetsArray(array))
	// 	return element
	// }

	// static ArrayToElement(array){
	// 	const object = {
	// 		element: 'div',
	// 		props: {},
	// 		childs: array.map(WidgetConvertor.toElement)
	// 	}
	// 	return object
	// }

	// static WidgetToElement(widget){
	// 	const element = {
	// 		element: widget.type,
	// 		props: widget.props,
	// 		childs: WidgetConvertor.toElement(widget.childs)['childs'],
	// 	}
	// 	return element
	// }



	// static ObjectToElement(element){
	// 	const object = {
	// 		element: 'div',
	// 		props: {},
	// 		child: [element]
	// 	}
	// 	return object
	// }


	static toXElement(path, element){
		return WidgetConvertor.convert(path, element, WidgetConvertor.getType(element), 'XElement')
	}

	static toStr(path, element){
		return WidgetConvertor.convert(path, element, WidgetConvertor.getType(element), 'String')
	}

	static toElement(path, element){
		return WidgetConvertor.convert(path, element, WidgetConvertor.getType(element), 'Element')
	}

	static toHTML(path, element, state = false){
        return WidgetConvertor.convert(path, element, WidgetConvertor.getType(element), 'HTML', state)
    }

	static toState(path, element){
        return WidgetConvertor.convert(path, element, WidgetConvertor.getType(element), 'State')
    }

	// static toWidget(element){
	// 	return WidgetConvertor.convert(element, WidgetConvertor.getType(element), 'Widget')
	// }

	static IntToString(path, int){
		return int + ''
	}

	// static IntToWidget(int){
	// 	const element = new widget('div', {}, int + '')
	// 	return element
	// }

	// static StringToWidget(str){
	// 	const element = new widget('div', {innerHTML: str})
	// 	return element
	// }

	// static ElementToWidget(element){
	// 	const tag = element.element
	// 	delete element.element
	// 	const [property, childs] = WidgetConvertor.propsCorrector(tag, element)
	// 	const result = new widget(tag, property, childs)
	// 	return result
	// }
/*
    static StringToHTML(path, element){
        const wrapper = widgetDom.createElement(element)
        return wrapper
    }

	// static WidgetToHTML(element){
	// 	const result = widgetDom.createElement(element)
    //     return result
    // }

	static FunctionToHTML(func, state = false){
		if (state && typeof state=='object' && WidgetConvertor.getType(state)!='State'){
			state = WidgetState.use(state)
		}
        return func(state)
    }

	static StateToHTML(state){
		return c.div({innerHTML: state})
	}
*/
	// static StateToWidget(state){
	// 	return new widget('div', {}, state)
	// }
/*
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
*/
	// static WidgetToolsToWidget(widgetTool){
	// 	return WidgetTools.create(widgetTool)
	// }



	static singleElement = {
		area: false,
		base: false,
		br: false,
		col: false,
		embed: false,
		hr: false,
		img: 'src',
		input: 'value',
		textarea: 'innerHTML',
		link: 'href',
		menuitem: false,
		meta: false,
		param: false,
		source: false,
		track: false,
		wbr: false,
	}

	static childExport(tag, props){
		let newChilds = [];
		let newProps = {};
		if (tag in WidgetConvertor.singleElement){
			const reChild = WidgetConvertor.singleElement[tag]
			if (reChild)
			if (WidgetConvertor.getType(props)=='Object'){
				if (reChild in props){
					newProps = props
				}
			} else {
				newProps[reChild] = WidgetConvertor.toStr('', props)
			}
		} else {
			const propType = WidgetConvertor.getType(props)
			switch (propType){
				case 'Int':
				case 'String':
					// newChilds = props
					newProps['innerHTML'] = props
				break;
				case 'State':
				case 'Widget':
				case 'WidgetTools':
					newChilds = [props]
				break;
				case 'Array':
					// newChilds = WidgetConvertor.ArrayToXElementArray(props)
					newChilds = props
					// console.log('childs', newChilds)
				break;
				case 'Object':
					if ('child' in props){
						newChilds = props['child']
						delete props['child']
					}
					newProps = props
				break;
				case "Element":
					newChilds = [WidgetConvertor.toXElement('', props)]
				break;
				default:
					console.log('Что с этим делать не знаю... ', propType);
				break;
			}
		}

		return [newProps, newChilds]
	}

	static propsCorrector(tag, props){

		const [property, childs] = WidgetConvertor.childExport(tag, props)
		return [property, childs];
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
		if (typeof element=='string')
			type = 'String'
		else
		if (Array.isArray(element))
			type = 'Array'
		else
		if (typeof element=='number')
			type = 'Int'
		else
		if (element instanceof HTMLElement || element instanceof Text)
			type = 'HTML'
		else
		if (typeof element == 'object'){
			type = 'Object'
			
			if ('type' in element && 'props' in element && 'childs' in element)
				type = 'XElement'
			else
			if ('widget' in element)
				type = 'Widget'
			else
			if ('link' in element)
				type = 'State'
			else
			if ('element' in element)
				type = 'Element'
				if (typeof WidgetTools[element.element] === 'function'){
					type = 'WidgetTools'
				}


		} else
		if (typeof element == 'function')
			type = 'Function'
		
		
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

		return [change, value]
	}


}
// widgets.js


class widget {
	static defaultTag = 'div'
	static lastDialog = null
	static dialogHeight = {}
	static widgetStore = {}
    static names_length = 0
	
    static names = {}
    static proxys = {}
	static widgets = {}
	static name(name){
		if (name in widget.proxys){
			return widget.proxys[name];
		} else {
			return false;
			// const props = widget.proxys[name];
			// const element = c[props.element](props)
			// widget.proxys[name] = element;
			// return element;
		}
    }






	constructor(tag, props = {}, child = []){
		this.type = tag
		this.name = widget.nextName(props)
		widget.widgets[this.name] = this
        this.childs = child
		this.props = {}
		this.assignProps(props)
		// this.setChild(child)
    }

	bindElement(element = false){
		if (!element){
			if (this.name in widget.names){
				return widget.names[this.name]
			} else {
				return false
			}
		} else {
			widget.names[this.name] = element
		}
	}

	static getWidget(name){
		if (name in widget.widgets){
			return widget.widgets[name]
		} else {
			return false
		}
	}
	

	static createElement(tag = false, props = {}){
		return c[tag](props)
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
		let childElement = new widget(this.type, this.props, child)
		
		const element = this.bindElement()
		if (element){
			widgetDom.update(element, this, childElement)
		}
		this.childs = childElement.childs


		widget.delete(childElement)
		childElement = null
	}
	
	static delete(element){
		element = null
	}

    assignProp(prop, value){ // prop = value
		if (prop=='child' && this.props.element in WidgetConvertor.singleElement){
			const setChildToProp = WidgetConvertor.singleElement[this.props.element]
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

			const element = this.bindElement()
			if (element){
				widgetDom.__linkToElement(this.name, element, prop, value)
			} else {
				console.log('Элемент не создан, не обновляю dom')
			}
		} else {
			console.info('__link','Применение массива не поддурживается', props, value);
		}
	}



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

		if (this.props.element in WidgetConvertor.singleElement && WidgetConvertor.singleElement[this.props.element]){
			const child = widget.singleElement[this.props.element]
			element[child] = widget.name(element._name).element[child] 
		}

        if (childs.length!=0) {
            element['child'] = childs;
        }

        return element;
    }



	widget(){
		return () => this
	}

	props(){
		return () => this.props
	}

	childs(){
		return () => this.childs
	}

	type(){
		return () => this.type
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

		console.log('На объект', this, 'Установить свойство ', prop, value, dopvalue);
        // switch(prop){
		// 	case 'indexName':
		// 		this.setMyName(self, dopvalue + '_' + value)
        //         return self
		// 	break;
		// 	case 'setName': 
        //     case 'name': 
        //         this.setMyName(self, value)
        //         return self
        //     case 'toArray':
        //         return this.toArray();
        //     case 'element':
        //         return this.toElement();



			
		// 	default: // add child to self
        //         const child = c[prop](value)
        //         self.child = child
        //         return child
        // }
    }




    static app(render){
        widgetDom.renderTo('#app', render)
    }

    static body(element){
        widgetDom.renderTo('body', element)
    }
}

// widgetDom.js

class widgetDom {
    static names = [];
    static active = {};
    static names_length = 0
    static nextName(){
        return 'XE' + (widgetDom.names_length++)
	}

    static pk(path, key){
        return path + '/' + key
    }

    static name(name){
        if (name in widgetDom.names){
            return widgetDom.names[name]
        } else {
            return false;
        }
    }

    static createElement(widget, path, virtualDom = {}){
        const rootElement = document.createElement(widget.type);
        virtualDom.type = widget.type
        if (!('props' in virtualDom)) virtualDom['props'] = {}
        if (!('childs' in virtualDom)) virtualDom['childs'] = []


        const props = widget.props
        Object.keys(props).forEach(key => {
            
            const val = widget.props[key]
            virtualDom.props[key] = val
            widgetDom.__linkToElement(path, widget.name, rootElement, key, val)

        });
        if (Array.isArray(widget.childs)){

            let index = 0
            widget.childs.map(itm => {
                
                virtualDom.childs.push({})
                return widgetDom.createElement(
                    WidgetConvertor.toXElement(path, itm),
                    widgetDom.pk(path, virtualDom.childs.length - 1),
                    virtualDom.childs[virtualDom.childs.length - 1]
                )

            }).forEach((childElement) => {
                rootElement.appendChild(childElement);
            });
        }

        document.getElementById('dom').innerHTML = JSON.stringify(virtualDom, null, '   ')
        console.log('create', virtualDom)

        return rootElement
    }

    static nodeToArray(node){
        switch (WidgetConvertor.getType(node)){
            case 'Array':
                return node
            case 'Widget':
                return node.childs
            default: 
                return [node]
        }
    }

    static getElementByPath(path){
        path = path.split('/')
        let querySelector = path.shift()
        let element = document.querySelector(querySelector)
        while (path.length!=0){
            querySelector = path.shift()
            element.childNodes(querySelector)
        }
        return element
    }

    static updateVirtual(querySelector, nextNode){
        if (querySelector in widgetDom.virtualDom){
            const currNode = widgetDom.virtualDom[querySelector];
            const newVirtualDom = widgetDom.update(
                document.querySelector(querySelector),
                querySelector,
                currNode,
                nextNode
            )
            widgetDom.virtualDom[querySelector] = newVirtualDom
            widgetDom.active[querySelector] = nextNode
        } else {
            widgetDom.renderTo(querySelector, nextNode)
            widgetDom.active[querySelector] = nextNode
        }
    }

    static update(rootElement, path, currNode, nextNode, index = 0, virtualDom = {}){
        if (!nextNode) return false
        virtualDom.type = nextNode && 'type' in nextNode?nextNode.type:'div'
        virtualDom.childs = []
        virtualDom.props = {}
        if (!nextNode) {
            if (rootElement.childNodes[index])
                rootElement.removeChild(rootElement.childNodes[index])
            return false
        } else if (!currNode) {
            virtualDom.childs[index] = {}

            const newElement = widgetDom.createElement(
                WidgetConvertor.toXElement(path, nextNode),
                widgetDom.pk(path, virtualDom.childs.length - 1),
                virtualDom.childs[index]
            )

            rootElement.appendChild(newElement);
        } else if (widgetDom.changed(currNode, nextNode)) {
            virtualDom.childs[index] = {}

            const newElement = widgetDom.createElement(
                WidgetConvertor.toXElement(path, nextNode),
                widgetDom.pk(path, virtualDom.childs.length - 1),
                virtualDom.childs[index]
            )

            rootElement.replaceChild(
                newElement, 
                rootElement.childNodes[index]
            );
        } else if (Array.isArray(nextNode.childs) && nextNode.childs.length!=0) {
            for (let i = 0; i < Math.max(currNode.childs.length, nextNode.childs.length); i++) {

                virtualDom.childs.push(
                    widgetDom.update(
                        rootElement.childNodes[index],
                        widgetDom.pk(path, i),
                        currNode.childs[i], 
                        nextNode.childs[i], 
                        i
                    )
                )
                
            }
        } else {
            console.log('Ничего не изменилось');
            virtualDom = nextNode
        }
        
        document.getElementById('dom').innerHTML = JSON.stringify(virtualDom, null, '   ')
        console.log('ee', virtualDom)
        return virtualDom
    }


	static __linkToElement(path, elementName, element, prop, value){
        const [change, neeValue] = WidgetConvertor.applyState(elementName, prop, value)
		if (change) value = neeValue

		const type = WidgetConvertor.getType(value)
		switch(type){
			case 'String':
			case 'Int':
				element[prop] = value
			break;
			case 'Function':
				if (prop.substr(0,2)=='on'){
					element[prop] = () => {
						value(); 
						console.log('test!111')
					}
				} else {
					element[prop] = value()
				}
			break;
			case 'Element':
				element[prop] = WidgetConvertor.toStr(path, value)
			break;
			default:
				// console.info('Не применено', prop, value, type)
			break;
		}
	}

    static changed(currNode, nextNode){
        const result = (
            currNode.type !== nextNode.type || 
            // !WidgetComparator.compare(currNode.childs, nextNode.childs)
            currNode !== nextNode
        );
        return result
    }

    static virtualDom = {}

    static linkElements(querySelector, element){
        if (!(querySelector in widgetDom.virtualDom)) 
            widgetDom.virtualDom[querySelector] = {}

        const newTree = widgetDom.createElement(element, querySelector, widgetDom.virtualDom[querySelector])
        return newTree
    }

    static renderTo(querySelector, element){
		
		let toElement = window.document.querySelector(querySelector);
		if (toElement){
            const newTree = widgetDom.linkElements(querySelector, element)
			toElement.innerHTML = '';
			toElement.appendChild(newTree)
		} else {
			window.addEventListener('load', () => {
				toElement = window.document.querySelector(querySelector);
                if (toElement){
                    const newTree = widgetDom.linkElements(querySelector, element)
                    toElement.innerHTML = '';
                    toElement.appendChild(newTree)
                }
			});
		}
    }
}

// widgetTools.js

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
// c.js

const c = new Proxy({}, {
	get:(_, tag) => {
		if (typeof widget[tag] === 'function'){
            // c.app(sett)
			return widget[tag]
		} else {
            // c.div(props) -> return proxi with class

            return (property = {}) => {
				const _name = widget.nextName(property)
				const [props, childs] = WidgetConvertor.propsCorrector(tag, property);

				return {
					type: tag,
					props,
					childs,
				}

				// const _widget = {
				// 	widget: new widget(tag, currProps, child)
				// }
                // const proxyProps = new Proxy(
                //     _widget, 
				// 	{
                //         get: (el, prop) => {
				// 			// if (['props', 'type', 'name', 'childs'].includes(prop)){
				// 			// 	return _widget.widget[prop]
				// 			// }
				// 			if (typeof _widget.widget[prop] != 'undefined'){
				// 				return _widget.widget[prop]
				// 			} else
				// 			if (prop!='setName' && prop.substr(0,3)=='set'){
				// 				return function(value){
				// 					el.widget.assignProp(prop.substr(3).toLowerCase(), value)
				// 					return proxyProps;
				// 				}
				// 			} else {
				// 				return (value, dopvalue = false) => {
				// 					return el.widget.setProp(proxyProps, prop, value, dopvalue)
				// 				}
				// 			} 
                //         },
                //         set: (el, prop, value) => {
				// 			el.widget.assignProp(prop, value)
                //             return true;
                //         }
                //     }
                // )

                // return proxyProps
            }
		}
	},
	set:(el, tag, props) => widget.widgetRegister(tag, props)
})

const w = (element, params = false, state = false) => widget.createElement(element, params, state);




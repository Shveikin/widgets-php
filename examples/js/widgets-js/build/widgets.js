// c.js

const c = new Proxy({}, {
	get:(_, _type) => {
        if (typeof widgettools[_type] == 'function')
            return widgettools[_type]
        else
            return (source) => {
                if (_type in widgetdom.widgetStore)
                    return widgetdom.widgetStore[_type](source)
                
                const id = widgetdom.getId()

                const [type, props, childs] = widgetconvertor.distribution(_type, source)
                return {
                    id,
                    type,
                    props,
                    childs,
                }
            }
    },
    set:(_, _type, element) => widgetdom.widgetRegister(_type, element)
})
// watcher.js

class widgetwatcher {
    constructor(props = false){
        if (props)
            this.set_props(props);
        
        // this._is = false
    }

    arr(val){
        return Array.isArray(val)?val:[val]
    }

    set_props(props){
        Object.keys(props).forEach(itm => {
            if (typeof this[itm] == 'function'){
                const prop = this.arr(props[itm])
                this[itm].apply(this, prop)
            } else {
                this['_'+itm] = props[itm]
            }
        })
    }

    keys(array){
        this._keys = this.arr(array)
    }

    state(stateName){
        this._stateName = stateName
        this._state = widgetstate.name(stateName)
        return this
    }

    _callback = {}
    _callbackautokey = 1
    callback(_callback, callbackkey = false){
        if (!callbackkey) callbackkey = this._callbackautokey++
        this._callback[callbackkey] = _callback
    }

    _current_value = false 
    check_current_value(){
        return typeof this._current_value == 'object' && 'currentValue' in this._current_value
    }

    get_current_value(){
        return this._current_value.currentValue
    }

    set_current_value(value){
        this._current_value = {currentValue: value}
        return value
    }

    
    current_value(callback){
        if (this.check_current_value()){
            return this.set_current_value(
                callback(this.get_current_value())
            );
        } else {
            for (const key of this._keys){
                return this.set_current_value(
                    callback(this._state[key])
                );
            }
        }
    }

    current_value_init(){
        const cvs = []

        for (const key of this._keys){
            cvs.push(this._state[key])
        }

        this.set_current_value(cvs)
        return cvs
    }



    // ------------------------- Модификаторы



    is(etalon, _true, _false = false){

        this.callback(keys => {
            return keys==etalon?_true:_false
        }, `is_${etalon}`)

        return this
    }

    is_default(_true, _false){
        
        this.callback(keys => {
            let _bind = false
            let _all_default = true
            if (this._stateName in widgetstate.props){
                if ('default' in widgetstate.props[this._stateName]){
                    _bind = true
                    for (const key of this._keys) {
                        const currentVal = this._state[key]
                        const defaultval = widgetstate.props[this._stateName]['default'][key]
                        
                        if (typeof currentVal != typeof defaultval){
                            console.info('----default TYPE NORM')
                            _all_default = false;
                            break;
                        } else
                        if (Array.isArray(currentVal)){
                            if (currentVal.join(',')!=defaultval.join(',')) {
                                _all_default = false;
                                break;
                            }
                        } else {
                            if (currentVal!=defaultval){
                                _all_default = false;
                                break;
                            }
                        }
                        
                    }
                }
            }
            

            if (_bind){
                return _all_default?_true:_false
            } else {
                return _false
            }
        }, 'is_default_')


        return this
    }

    is_empty(_true, _false){
        this.callback(keys => {
            let _all_empty = true

            for (const key of this._keys){
                const val = this._state[key]
                const type = widgetconvertor.getType(val)
                switch (type) {
                    case 'Array':
                        if (val.length != 0) {
                            _all_empty = false
                            break;
                        }
                    break;
                    case 'Int':
                        if (val != 0) {
                            _all_empty = false
                            break;
                        }
                    break;
                    case 'String':
                        if (val != '') {
                            _all_empty = false
                            break;
                        }
                    break;
                    default:
                        _all_empty = false
                        console.info('Не знаю как проверить на EMPTY', type, '|', val)
                        break;
                    break;
                }
            }

            return _all_empty?_true:_false
        }, 'is_default_')


        return this
    }

    in(arrayProp, _true, _false){
        arrayProp = Array.isArray(arrayProp)?arrayProp:this._state[arrayProp]

        this.callback(currentValue => {
            return arrayProp.includes(currentValue)?_true:_false
        })

        return this
    }

    in_state(state, arrayProp, _true, _false){
        const update = function(currentValue){
            return widgetstate.name(this.state)[this.arrayProp].includes(currentValue)
                ?_true
                :_false
        }.bind({state, arrayProp})

        this.callback(update)

        widgetstate.name(state).watch(arrayProp).link(array => {
            this.refrash()
        })

        return this
    }



    // ------------------------- LINK





    link(widget, widgetProp = false){
        this._widget = widget
        this._widgetProp = widgetProp

        if (!(this._stateName in widgetstate.updates)) 
            widgetstate.updates[this._stateName] = {}
        const ___updates = widgetstate.updates[this._stateName]
        
        this._widgetType = widgetconvertor.getType(widget)
        const id = this._widgetType=='Widget'?widget.id:Math.floor(Math.random() * 6)

        if (!Array.isArray(this._keys)){
            if (widgetdom.debug)
                console.error('this.keys must to be array type: ', this._keys)
        }

        const key = this._keys.join(',')

        for (const stateProp of this._keys){
            if (!(stateProp in ___updates)) ___updates[stateProp] = {}
            if (!(id in ___updates[stateProp])) ___updates[stateProp][id] = {}
            ___updates[stateProp][id][key] = this
        }

        this.refrash()
        return this
    }

    refrash(current_value_init = true){
        let value = false

        if (current_value_init)
            value = this.current_value_init()

        if (this._callback)
        for (const callback of Object.values(this._callback)){
            this.current_value(ArrayFromState => {
                if (typeof callback == 'function'){

                    return callback.apply(this, this.arr(ArrayFromState))
                    
                } else {
                    return ArrayFromState
                }
            })
        }

        value = this.get_current_value()
        this.applyToWidget(this.arr(value)[0])
    }

    applyToWidget(value){
        switch (this._widgetType) {
            case 'Widget':
                if (this._widgetProp == 'childs'){
                    const child = c.div(value)
                    widgetdom.update(this._widget, child)
                } else {
                    this._widget.props[this._widgetProp] = value
                    widgetdom.assignProp(this._widget, this._widgetProp)
                }
            break;
            case 'Function':
                this._widget.apply(this, this.arr(value));
            break;
            default:
                console.info('Не знаю как применить изменения ', this._widgetType);
            break;
        }
    }

}
// widgetconvertor.js
class widgetconvertor {

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

	static map(value, [from, to], [from2, to2]) {
		return (((to2 - from2) / 100) * ((value - from) / ((to - from) / 100))) + from2
	}

	static roundValue(value, type){
        switch (type) {
            case 'int': return parseInt(value)
            case 'float': return Math.round(value * 10) / 10
            case 'float2': return Math.round(value * 100) / 100
            case 'float3': return Math.round(value * 1000) / 1000
        }
    }

	static distribution(type, source = {}){
		let props = {}
		let childs = []
		
		const childElements = ['child', 'childs', 'element']

		const sourceType = widgetconvertor.getType(source)
		switch (sourceType) {
			case 'String':
			case 'Int':
				let property = 'innerHTML';
				if (type in widgetconvertor.singleElement){
					property = widgetconvertor.singleElement[type]
				}
				props[property] = source
			break;
			case 'WidgetTools':
				childs = source
			break;
			case 'Array':
				childs = widgetconvertor.toArrayOfWidgets(source)
			break;
			case 'Element':
				type = source.element
			case 'Object':
				Object.keys(source).forEach(prop => {
					if (childElements.includes(prop)){
						if (prop!='element'){

							if (type in widgetconvertor.singleElement){
								const property = widgetconvertor.singleElement[type]
								props[property] = source[prop]
							} else {
								childs = widgetconvertor.toArrayOfWidgets(source[prop])
							}

						}
					} else {
						props[prop] = source[prop]
					}
				})
			break;
			case 'Widget':
				childs = [source]
			break;
			case 'WidgetTools':
			case 'State':
				if (type in widgetconvertor.singleElement){
					props[widgetconvertor.singleElement[type]] = source
				} else {
					childs = source
				}
			break;
		}

		return [type, props, childs]
	}



    static convert(element, from, to, state = false){
		if (from == to){
			return element
		}
        const func = `${from}To${to}`
		
        if (func in widgetconvertor){
			const result = widgetconvertor[func](element, state)
			const newType = widgetconvertor.getType(result)
			if (newType==to){
				return result;
			} else {
				return widgetconvertor.convert(result, newType, to)
			}
        } else {
            throw new Error(`${func} отсутствует!`);
        }
    }

	static UnknownToFunction(){
		return () => {}
	}

	static BoolToFunction(bool){
		return () => bool
	}

	static toWidget(element){
		return widgetconvertor.convert(element, widgetconvertor.getType(element), 'Widget')
	}

	static BoolToWidget(element){
		return c.div()
	}

	static StateToWidget(state){
		return c.div({child: state})
	}

	static toArrayOfWidgets(element){
		if (!Array.isArray(element))
			element = [element]

		const result = []
		element.forEach(source => {
			const sourceType = widgetconvertor.getType(source)
			switch (sourceType) {
				case 'Widget':
					result.push(source)
				break;
				default:
					const wrapper = c.div(source)
					result.push(wrapper)
				break;
			}
		})

		return result
	}

	static IntToFunction(int){
		return () => int
	}


    static getType(element){
		let type = 'Unknown'
        if (Array.isArray(element))
			type = 'Array'
		else
        if (element && typeof element == 'object'){
			type = 'Object'
			if (element instanceof HTMLElement || element instanceof Text)
				type = 'HTML'
			else
			if ('type' in element && 'props' in element && 'childs' in element)
				type = 'Widget'
			else
			if ('link' in element)
				type = 'State'
			else
			if ('element' in element)
				type = 'Element'
				if (element.element == 'WidgetTools' || typeof widgettools[element.element] === 'function'){
					type = 'WidgetTools'
				}
		} else
		if (typeof element=='string')
			type = 'String'
		else
		if (typeof element=='number')
			type = 'Int'
		else
		if (typeof element == 'function')
			type = 'Function'
		else
		if (typeof element == 'boolean')
			type = 'Bool'
		
		return type;
	}

    static checkState(widget, prop){

        let value = prop!='childs'?widget.props[prop]:widget.childs
		if (prop=='childs' && (!('rootElement' in widget))){
			widget.rootElement = document.createElement(widget.type)
		}

		let change = false;
		if (widgetconvertor.getType(value)=='WidgetTools'){
			value = widgettools.create(value)
			change = 'WidgetTools'
		}

		if (widgetconvertor.getType(value)=='State'){
			value = widgetstate.inspector(value, widget, prop)
			change = 'State'
			// return [true, false]
		}

		return [change, value]
	}






	static toFunction(element){
		return widgetconvertor.convert(element, widgetconvertor.getType(element), 'Function')
	}

	static WidgetToolsToFunction(WidgetTool){
		return widgettools.create(WidgetTool)
	}

	static StateToFunction(State){
		return State.link
	}

	static StringToFunction(str){
		return () => str
	}

	static ArrayToFunction(array){
		return () => array
	}
}
// widgetdom.js

class widgetdom {
    static debug = true;
    static ids = {}
    static idCounter = 0

    static getId(){
        const result = widgetdom.idCounter++
        return result
    }

    static makeElement(widget, parent = false){
        const element = document.createElement(widget.type);
        widget.rootElement = element;
        widget.rootElement.setAttribute('key_id', widget.id)
        widget.parent = parent
        if (parent)
            widgetdom.parentLink(widget, parent)
        return element;
    }

    static parentLink(widget, parent){
        const parentType = widgetconvertor.getType(parent)
        switch (parentType) {
            case 'HTML':
                parent.appendChild(widget.rootElement)
            break;
            case 'Widget':
                widgetdom.parentLink(widget, parent.rootElement)
            break;
            default:
                if (widgetdom.debug)
                    console.info('Не знаю как добавить в этот парент! ', parentType, parent);
            break;
        }
    }

    /**
     * CREATE ELEMENT
     */
    static createElement(widget, parent = false){
        if (widget.type in widgetdom.widgetStore){
            const storeElement = widgetdom.widgetStore[widget.type](widget.props)
            const storeElementType = widgetconvertor.getType(storeElement)
            
            switch (storeElementType){
                case 'HTML':
                    widget.rootElement = storeElement
                    return storeElement
                break;
                case 'Widget':
                case 'Bool':
                    widget = storeElement
                break;
                default:
                    if (widgetdom.debug)
                        console.info('Не проработанный тип элемента', storeElementType, storeElement)
                break;
            }
        }
        
        const widgetType = widgetconvertor.getType(widget)
        switch (widgetType){
            case 'Widget':
                const rootElement = widgetdom.makeElement(widget, parent)

                if (widget.props)
                Object.keys(widget.props).forEach(prop => {
                    if (prop in widgetsmartprops){
                        widgetsmartprops[prop](widget, widget.props[prop])
                    } else {
                        widgetdom.assignProp(widget, prop)
                    }
                });

                if (Array.isArray(widget.childs)){
                    widget.childs.forEach(childWidget => {
                        const widgetType = widgetconvertor.getType(childWidget)
                        switch(widgetType){
                            case 'Widget':
                                widgetdom.createElement(childWidget, widget)
                            break;
                            default: 
                                if (widgetdom.debug)
                                    console.info('Не знаю что делать с этим child - ', widgetType)
                            break;
                        }

                    })
                } else {
                    const childType = widgetconvertor.getType(widget.childs)

                    if ('view' in widget.childs) {
                        widget.childs.view = []
                    }

                    let value = ''
                    const [change, newValue] = widgetconvertor.checkState(widget, 'childs')


                    if (change){
                        const type = widgetconvertor.getType(newValue)
                        switch (type) {
                            case 'String':
                                rootElement.innerHTML = newValue
                            break;
                        }
                    }
                }

                return rootElement;
            
            default:
                if (widgetdom.debug)
                    console.info('Не знаю как создать этот компонент', widgetType, widget);
            break;
        }


    }


    /**
     * UPDATE 
     */
    static update(currNode, nextNode, index = 0){
        if (!nextNode) {
            
            if (currNode.rootElement.parentElement){
                currNode.rootElement.parentElement.removeChild(currNode.rootElement)
                currNode.rootElement = null
            }

            return true
        } else if (widgetdom.changedType(currNode, nextNode)) {

            widgetdom.createElement(nextNode)
            widgetdom.nodeReplace(currNode, nextNode)

        } else {
            widgetdom.compareProps(currNode, nextNode)
            widgetdom.compareChilds(currNode, nextNode)
        }
        return false
    }


    /**
     * При изменении типов перерисовываем
     */
    static changedType(currNode, nextNode){
        return currNode.type!==nextNode.type
    }

    /**
     * Сравнить применить свойства с новой ноды
     */
    static compareProps(currNode, nextNode){
        
        const allProps = new Set(Object.keys(currNode.props).concat(Object.keys(nextNode.props)))
        allProps.forEach(prop => {
            if (prop in nextNode.props){
                if (nextNode.props[prop]!=currNode.props[prop]){
                    currNode.props[prop] = nextNode.props[prop]
                    widgetdom.assignProp(currNode, prop)
                }
            } else {
                if (currNode.props[prop]!=''){
                    currNode.props[prop] = ''
                    widgetdom.assignProp(currNode, prop)
                }
            }
        })
    }


    static getChildsFrom(widget){
        let useView = true
        let currChild = []
        if (Array.isArray(widget.childs)){
            currChild = widget.childs
            useView = false
        } else {
            if ('view' in widget.childs){

                const child = widget.childs.view
                currChild = Array.isArray(child)
                    ?child
                    :[]

            }
        }
        return [false, currChild]
    }

    /**
     * СРАВНИТЬ 2 ноды
     * Проверка детей
     */
    static compareChilds(currNode, nextNode){
        const deleteIndexs = []

        let [useViewCurrent, currChildCurrent] = widgetdom.getChildsFrom(currNode)
        let [useViewNext, currChildNext] = widgetdom.getChildsFrom(nextNode)

        
        const max = Math.max(currChildCurrent.length, currChildNext.length)
        for (let i = 0; i < max; i++) {
            if (currChildCurrent[i]) {
                const removeChildElement = widgetdom.update(
                    currChildCurrent[i],
                    currChildNext[i],
                    i
                )

                if (removeChildElement) {
                    deleteIndexs.push(i)
                }

            } else {
                const child = currChildNext[i];
                const element = widgetdom.createElement(child)
                widgetdom.parentLink(child, currNode)

                currChildCurrent.push(currChildNext[i])
            }
        }


        if (deleteIndexs.length!=0){
            const nw = []
            currChildCurrent.forEach((child, key) => {
                if (!deleteIndexs.includes(key)) {
                    nw.push(child)
                } else {
                    widgetdom.deleteChildsFromState(child)
                }
            })
            currChildCurrent = nw
        }

        if (useViewCurrent){
            currNode.childs.view = currChildCurrent
        } else {
            currNode.childs = currChildCurrent
        }


    }


    static deleteChildsFromState(child){
        const id = child.id
        Object.values(widgetstate.updates).forEach(stateNames => {
            Object.values(stateNames).forEach(stateProps => {
                if (id in stateProps){
                    delete stateProps[id]
                }
            })
        })
        if (Array.isArray(child.childs)){
            child.childs.forEach(innerChild => {
                widgetdom.deleteChildsFromState(innerChild)
            })
        }
    }

    static nodeReplace(currNode, nextNode){
        if (nextNode.rootElement!=currNode.rootElement)
            currNode.rootElement.parentElement.replaceChild(
                nextNode.rootElement, 
                currNode.rootElement
            );
        currNode.props = nextNode.props
        currNode.childs = nextNode.childs
        currNode.type = nextNode.type
    }


    /**
     * ASSIGN PROP to dom element
     */
    static assignProp(widget, prop) {
        let value = widget.props[prop]

        const [change, newValue] = widgetconvertor.checkState(widget, prop)
        if (newValue==undefined) return false;
		if (change) {
            value = newValue
            // if (widget.props[prop]==value)
            //     return false
        }


        const type = widgetconvertor.getType(value)
        



        switch(type){
            case 'Bool':
            case 'String':
            case 'Int':
                const attrList = ['for'];

                if (attrList.includes(prop)){
                    widget.rootElement.setAttribute(prop, value)
                } else {
                    widget.rootElement[prop] = value
                }
            break;
            case 'Function':
                if (prop.substr(0,2)=='on'){

                    const func = function(){
                        value.apply(this)

                        if (widget.type in widgetconvertor.singleElement){
                            const defaultProp = widgetconvertor.singleElement[widget.type]
                            if (defaultProp){
                                widget.props[defaultProp] = this[defaultProp]
                            }
                        }

                    }


                    widgetdom.assignEventListener(widget, prop, func)

                } else {
                    widget.rootElement[prop] = value()
                }
            break;
            default:
                if (widgetdom.debug)
                    console.info('Не применено', prop, value, type)
            break;
        }
        
    }

    static assignEventListener(widget, onprop, func){
        widget.rootElement.addEventListener(onprop.substr(2), func)
    }


    /**
     * RENDER
     */
    static render(querySelector, widget, mode = 'rebuild'){
        if (querySelector in widgetdom.active){
            const currNode = widgetdom.active[querySelector]
            widgetdom.update(currNode, widget)
        } else {
            widgetdom.querySelector(querySelector, mode).then(rootElement => {
                widgetdom.firstRender(rootElement, querySelector, widget)
            }).catch(message => {
                console.error('widget render ', message)
            })
        }
    }

    static querySelector(querySelector, mode = 'rebuild'){
        return new Promise(function(resolve, reject){
            const rootElement = window.document.querySelector(querySelector);
            if (rootElement){
                switch (mode) {
                    case 'rebuild':
                        resolve(rootElement);
                    break;
                    case 'append':
                        const wrapper = document.createElement('div')
                        rootElement.appendChild(wrapper)
                        resolve(wrapper);
                    break;
                }
            } else {
                window.addEventListener('load', () => {
                    const rootElement = widgetdom.querySelector(querySelector, mode);
                    if (rootElement){
                        resolve(rootElement)
                    } else {
                        reject('Элемента нет ' + querySelector)
                    }
                })
            }
        })
    }

    static active = {}
    static firstRender(rootElement, querySelector, widget){
        rootElement.innerHTML = ''
        widgetdom.createElement(widget, rootElement)
        widgetdom.active[querySelector] = widget
    }


    static widgetStore = {};
    static widgetRegister(name, _widget = () => false) {
		if (name in widgetdom.widgetStore){
			throw 'Компонент ' + name + ' - уже зарегистрирован!';
			return false;
		}
		widgetdom.widgetStore[name] = _widget
        // (prps) => {
		// 	return _widget(prps)
		// }
		// return true;
	}

    static setChange(widget, name, func){
        if (!('eventListeners' in widget)) widget.eventListeners = {}
        if (!(name in widget.eventListeners)){
            widget.rootElement.addEventListener('change', func, false);
            widget.eventListeners[name] = true;
        }
    }

}
// widgetstate.js


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
		if (prop!='_name')
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
// widgettools.js

class widgettools {
    static create(element){
		if (element.element=='WidgetTools'){
			const __fw = element.tool.endsWith("__fw");
			if (__fw){
				element.tool = element.tool.substr(0, element.tool.length -4)
			}
			const callback = () => {
				return widgetstate.name(element.state)[element.tool].apply(element, element.prop)
			}

			if (__fw){
				return callback
			} else {
				return callback()
			}
		} else {
			return widgettools[element.element](element)
		}
	}

	static app(props){
		widgetdom.render('#app', c.div(props))
	}

	static render(querySelector, props, mode = 'rebuild'){
		widgetdom.render(querySelector, c.div(props), mode)
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

	static state_check_in(props){
		const array_props = props.prop.split('.')
		const state = widgettools.getStateFromPath(
			widgetstate.name(props.state),
			[...array_props]
		)
		const prop = array_props.slice(-1).join('.')

		return state.checkIn(prop,
			props.value, 
			props._true, 
			props._false
		)
	}





	static state_set_default(props){
		return widgetstate.name(props.state).setDefault(props.prop)
	}



	static state_model(props){
		return widgetstate.name(props.state).model(props.prop)
	}

	static state_modelIn(props){
		return widgetstate.name(props.state).modelIn(props.prop, props.value)
	}



	static func(props){
		return Function(props.function);
	}

	static current_request = false
	static request_catcher = false

	static abort_controllers_by_url = {};
	static current_request_url = false;

	static get_abort_signal(url){
		const abort_controllers_by_url = widgettools.abort_controllers_by_url

		if (url in abort_controllers_by_url){
			abort_controllers_by_url[url].forEach(ac => {
				ac.abort();
				ac = null
			})
		}

		abort_controllers_by_url[url] = [];
		const controller = new AbortController();
		abort_controllers_by_url[url].push(
			controller
		)
		return controller.signal
	}

	static widget_request(props){ 
		return {
			link: function(widget = false, prop = false){

				if (this && this.tagName=='BUTTON'){
					this.classList.add('waiting')
				}

				const state = {}
				props.useState.map(stateName => {
					if (stateName in widgetstate.names)
					state[stateName] = {
						data: widgetstate.name(stateName).data(),
						source: widgetstate.props[stateName].sourceClass,
					}
				})

				const req_catcher = (result) => {
					if (this && this.tagName=='BUTTON'){
						this.classList.remove('waiting')
					}
					if (typeof widgettools.request_catcher == 'function'){
						widgettools.request_catcher(result)
						widgettools.request_catcher = false
					}
				}

				const request_id = Math.random()
				widgetstate.current_request = request_id


				// abort_controller.signal.addEventListener('abort', () => alert("отмена!"));

				fetch(props.url, {
					method: 'POST',
					body: JSON.stringify({
						state,
						// this: widget.props
						executor: {
							class: props.class,
							function: props.function,
							props: props.props,
							bind: props.bind,
						},
						request_id: widgetstate.current_request,
					}),
					signal: widgettools.get_abort_signal(props.url)
				})
				.then(res => res.json())
				.then(res => {
					
					// if (res.request_id==widgetstate.current_request){
						// Применение стейта
						if ('state' in res){
							Object.keys(res.state).forEach(stateName => {
								if ('data' in res.state[stateName])
									Object.keys(res.state[stateName].data).forEach(propName => {
										widgetstate.name(stateName)[propName] = res.state[stateName].data[propName]
									})

								if ('runOnFrontend' in res.state[stateName]){
									console.log('runOnFrontend', res.state[stateName].runOnFrontend)

									res.state[stateName].runOnFrontend.forEach(func => {
										const func2 = widgetconvertor.toFunction(func)
										func2()
									})
								}
							})
						}

						if ('then' in props.extra){
							const func = window[props.extra.then].bind({
								bind: props.bind
							})
							func(res.result)
						}

						req_catcher(res)

					// }
				})
				.catch((error) => {
					req_catcher(error)
				});

			}
		}
	}

	static catch_request(func){
		return new Promise((resolve) => {
			widgettools.request_catcher = (result) => resolve(result)
		});
	}

	static state_map({state, prop, refernce = false, useColls = false}){
		const clearItm = itm => 
			itm.replaceAll('"', '\\\"').replaceAll('\n', '').replaceAll('\r', '')

		let insert = itm => clearItm(itm)
		if (refernce){
			let reference = JSON.stringify(refernce)
			if (useColls){
				insert = itm => {

					let result = reference
					useColls.forEach(replace => {
						result = result.replaceAll(`**${replace}**`, clearItm(replace=='_'?itm:itm[replace]))
					})
					return JSON.parse(result)
				}
			} else {
				insert = itm => {
					let result = reference
					result = result.replaceAll('**val**', clearItm(itm))
					return JSON.parse(result)
				}
			}
		}

		const state_map = widgetstate.name(state).map(prop, itm => {
			return insert(itm)
		})

		return state_map
	}

	static state_update(props){
		return () => {

			Object.keys(props.stateProps).forEach(prop => {
				widgetstate.name(props.state)[prop] = props.stateProps[prop]
			})
		}
	}

	static state_update_group(props){
		return function(){

			Object.values(props.list).forEach(prop => {
				if ('bind' in props)
					prop.bind = props['bind']
				const func = widgetconvertor.toFunction(prop)
				func.apply(this)
			})

		}
	}
}
// widgetsmartprops.js

class widgetsmartprops {


    static dragboard(dragboard, props) {
        let mouseDown = false
        let mouseDownPosition = []
        const elements = []
        const boxsizing = {
            x: props.boxsizing?(props.boxsizing.x?props.boxsizing.x:props.boxsizing):0,
            y: props.boxsizing?(props.boxsizing.y?props.boxsizing.y:props.boxsizing):0,
        }

        const width = props.width
        const height = props.height


        dragboard.rootElement.style.position = 'relative'
        dragboard.rootElement.style.userSelect = 'none'
        dragboard.rootElement.style.width = width + boxsizing.x + 'px'
        dragboard.rootElement.style.height = props.height + 'px'

        if ('childs' in props) {
            const widgets = widgetconvertor.toArrayOfWidgets(props.childs);
            widgets.forEach(widget => {
                dragboard.rootElement.appendChild(
                    widgetdom.createElement(widget)
                )
            })
        }

        function rangeArray(){
            return [props.state.range_min, props.state.range_max]
        }

        let shift = false;

        let sliderMoveRange = {
            x: {min: 0, max: props.width },
            y: {min: 0, max: props.height},
        }

        if (props.useSlide){
            props.state.watch(['slide_min_start', 'slide_min_finish', 'slide_max_start', 'slide_max_finish']).link(
            function(slide_min_start, slide_min_finish, slide_max_start, slide_max_finish){

                if (slide_min_start=="rangeMin")
                    slide_min_start = props.state.range_min

                if (slide_max_finish=="rangeMax")
                    slide_max_finish = props.state.range_max


                sliderMoveRange = [
                    {
                        x: {
                            min: widgetconvertor.map(slide_min_start, rangeArray(), [0, props.width]),
                            max: widgetconvertor.map(slide_min_finish, rangeArray(), [0, props.width]),
                        }
                    },
                    {
                        x: {
                            min: widgetconvertor.map(slide_max_start, rangeArray(), [0, props.width]),
                            max: widgetconvertor.map(slide_max_finish, rangeArray(), [0, props.width]),
                        }
                    }
                ]
                
            })
        }


        function mousemove(x, y){
            let posx, posy = 0

            const range = Array.isArray(sliderMoveRange)?sliderMoveRange[mouseDown]:sliderMoveRange

            if (props?.axis != 'y'){
                posx = (parseInt(elements[mouseDown].style.left) + x)
                if (posx>range.x.max)
                    posx = range.x.max
                if (posx < range.x.min)
                    posx = range.x.min
                elements[mouseDown].style.left = posx + 'px'
            }
            if (props?.axis != 'x'){
                posy = (parseInt(elements[mouseDown].style.top) + y)
                if (posy>range.y.max)
                    posy = range.y.max
                if (posy < range.y.min)
                    posy = range.y.min
                elements[mouseDown].style.top = posy + 'px'
            }

            if (typeof props.ondrag == 'function'){
                let valposx = posx
                let valposy = posy

                valposx = widgetconvertor.map(posx, [0, width],  [0, 100])
                valposy = widgetconvertor.map(posy, [0, height], [0, 100])
                props.ondrag(mouseDown, valposx, valposy, posx, posy)
            }
        }

        const dragType = widgetconvertor.getType(props.drag)
        let widgets = []
        switch (dragType){
            case 'Object': 
                widgets = Object.values(props.drag)
                shift = Object.keys(props.drag)
            break;
            default: 
                widgets = props.drag
            break;  
        }

        function shiftXY(shiftVal){
            let left = 0
            let top = 0
            if (props?.axis != 'y')
                left = shiftVal

            if (props?.axis != 'x')
                top = shiftVal

            left = widgetconvertor.map(left, rangeArray(), [0, width])
            top =  widgetconvertor.map(top, rangeArray(), [0, height])

            return [left, top]
        }

        widgets = widgetconvertor.toArrayOfWidgets(widgets)
        widgets.forEach((widget, key) => {
            const dragElement = widgetdom.createElement(widget)
            dragElement.style.position = 'absolute'
            if (shift){
                if ('state' in props) {
                    props.state.watch([shift[key], 'range_' + shift[key]]).link(function(newValue){
                        if (mouseDown===false){
                            // #left
                            const left = widgetconvertor.map(newValue, rangeArray(), [0, props.width])
                            dragElement.style.left = left + 'px';
                        }
                    })
                } else {
                    const [left, top] = shiftXY(shift[key])
                    dragElement.style = `position: absolute; left: ${left}px; top: ${top}px`;
                }
            } else {
                dragElement.style = 'position: absolute; left: 0px; top: 0px';
            }

            dragElement.onmousedown = (event) => {
                mouseDownPosition = [event.screenX, event.screenY]; 
                mouseDown = key
            }

            dragboard.rootElement.onmousemove = (event) => {
                if (mouseDown!==false){
                    let x = event.screenX - mouseDownPosition[0]
                    let y = event.screenY - mouseDownPosition[1]

                    mousemove(x, y);
                    mouseDownPosition = [event.screenX, event.screenY];
                }
            }

            dragboard.rootElement.onmouseup = () => { mouseDown = false }
            dragboard.rootElement.onmouseleave = () => { mouseDown = false }

            dragboard.rootElement.appendChild(dragElement)
            elements.push(dragElement)
        })
    }
}
// widgetdialog.js

class widgetdialog {
    static show(props, title = false){
        const proptype = widgetconvertor.getType(props)
        const state = widgetstate.name('dialogstate')

        switch (proptype) {
            case 'String':
                state.__message = props
                if (title)
                    state.title = title
            break;
            case 'Object':
                if ('message' in props)
                    state.__message = props['message']

                if ('title' in props)
                    state.title = props['title']
            break;
            case 'Bool':
                state.__message = false
            break;
        }
        
    }

    static __init__(){
        const $state = widgetstate.name('dialogstate')
        const window = c.div({
            child: c.div({
                child: [
                    $state.check('hidetitle', false,
                        c.div({
                            child: [
                                '',
                                c.div({
                                    child: $state.watch('title'),
                                    className: 'dialogTitle_h12nbsx9dk23m32ui4948382'
                                }),
                                c.button({
                                    child: '✖',
                                    onclick(){
                                        $state.__message = false
                                    }
                                })
                            ],
                            className: 'close_panel_h12nbsx9dk23m32ui4948382'
                        }),
                        false
                    ),
                    c.div({
                        child: c.form({
                            child: c.fieldset({
                                child: $state.watch('__message')
                            }),
                            className: '_form_h12nbsx9dk23m32ui4948382'
                        }),
                        className: 'form_panel_h12nbsx9dk23m32ui4948382',
                    }),
                    c.div({
                        child: ['', $state.watch('__buttons')],
                        className: 'buttons_panel_h12nbsx9dk23m32ui4948382'
                    })
                ],
                className: 'window_h12nbsx9dk23m32ui4948382'
            }),
            className: 'black_h12nbsx9dk23m32ui4948382',
            style: $state.watch('__style')
        })

        $state.watch('__message')
            .is(false, 'opacity: 0; visibility: hidden;', '')
            .link(style => { 
                widgetdom.querySelector('body').then(body => {
                    if (style)
                        body.style.overflow = 'auto'
                    else
                        body.style.overflow = 'hidden'
                })
                
                $state.__style = style 
            }
        )

        c.render('body', window, 'append')
        $state.__buttons = c.button('Далее')
    }
}

widgetdialog.__init__();

function showDialog(props, title = false){
    widgetdialog.show(props, title)
}

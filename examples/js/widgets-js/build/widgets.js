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
				// if ('type' in source){
				// 	type = source['type']
				// }
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
			case 'WidgetTools':
			case 'State':
				childs = [source]
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
					result.push(c.div(source))
				break;
			}
		})

		return result
	}


    static getType(element){
		let type = 'Unknown'
        if (Array.isArray(element))
			type = 'Array'
		else
        if (typeof element == 'object'){
			type = 'Object'
			
			if ('type' in element && 'props' in element && 'childs' in element)
				type = 'Widget'
			else
			if ('link' in element)
				type = 'State'
			else
			if ('element' in element)
				type = 'Element'
				if (typeof widgettools[element.element] === 'function'){
					type = 'WidgetTools'
				}
		} else
		if (typeof element=='string')
			type = 'String'
		else
		if (typeof element=='number')
			type = 'Int'
		else
		if (element instanceof HTMLElement || element instanceof Text)
			type = 'HTML'
		else
		if (typeof element == 'function')
			type = 'Function'
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
			change = true
		}

		if (widgetconvertor.getType(value)=='State'){
			value = widgetstate.inspector(value, widget, prop)
			change = true
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
}
// widgetdom.js

class widgetdom {

    static ids = {}
    static idCounter = 0

    static getId(){
        return widgetdom.idCounter++;
    }

    /**
     * CREATE ELEMENT
     */
    static createElement(widget){
        if (widget.type in widgetdom.widgetStore){
            widget = widgetdom.widgetStore[widget.type](widget.props)
        }
        const rootElement = document.createElement(widget.type);
        widget.rootElement = rootElement


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
                const childElement = widgetdom.createElement(childWidget)
                rootElement.appendChild(childElement)
            })
        } else {
            const childType = widgetconvertor.getType(widget.childs)
            let value = ''
            const [change, newValue] = widgetconvertor.checkState(widget, 'childs')
            if (change) value = newValue

            if (!('childs' in widget)) widget.childs = {}
            widget.childs.view = [c.div(value)]
            rootElement.appendChild(
                widgetdom.createElement(widget.childs.view[0])
            )

        }

        return rootElement
    }


    /**
     * UPDATE 
     */
    static update(currNode, nextNode, index = 0){
        if (!nextNode) {
            if (currNode.rootElement.parentElement)
                currNode.rootElement.parentElement.removeChild(currNode.rootElement)
                return false
        } else if (widgetdom.changedType(currNode, nextNode)) {

            nextNode.rootElement = widgetdom.createElement(nextNode)
            widgetdom.nodeReplace(currNode, nextNode)

        } else {
            widgetdom.compareProps(currNode, nextNode)
            widgetdom.compareChilds(currNode, nextNode)
        }
        return true
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

    /**
     * СРАВНИТЬ 2 ноды
     * Проверка детей
     */
    static compareChilds(currNode, nextNode){
        const deleteIndexs = []

        let useView = false
        let currChild = []
        if (Array.isArray(currNode.childs)){
            currChild = currNode.childs
        } else {
            if ('view' in currNode.childs){

                const child = currNode.childs.view
                currChild = Array.isArray(child)
                    ?child
                    :[]
                useView = true

            }
        }

        const max = Math.max(currChild.length, nextNode.childs.length)
        for (let i = 0; i < max; i++) {
            if (currChild[i]) {
                if (!widgetdom.update(
                    currChild[i],
                    nextNode.childs[i],
                    i
                )) {
                    deleteIndexs.push(i)
                }
            } else {
                currNode.rootElement.appendChild(
                    widgetdom.createElement(nextNode.childs[i])
                )
                currChild.push(nextNode.childs[i])
            }
        }


        if (deleteIndexs.length!=0){
            console.log('deleteIndexs', deleteIndexs)
            const nw = []
            currChild.forEach((child, key) => {
                if (!deleteIndexs.includes(key)) {
                    nw.push(child)
                }
            })

            if (useView){
                currNode.childs.view = nw
            } else {
                currNode.childs = nw
            }
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
                widget.rootElement[prop] = value
            break;
            case 'Function':
                if (prop.substr(0,2)=='on'){
                    widget.rootElement[prop] = function(){
                        value.apply(this)

                        if (widget.type in widgetconvertor.singleElement){
                            const defaultProp = widgetconvertor.singleElement[widget.type]
                            if (defaultProp){
                                widget.props[defaultProp] = this[defaultProp]
                            }
                        }

                    }
                } else {
                    widget.rootElement[prop] = value()
                }
            break;
            default:
                console.info('Не применено', prop, value, type)
            break;
        }
        
    }


    /**
     * RENDER
     */
    static render(querySelector, widget){
        if (querySelector in widgetdom.active){
            const currNode = widgetdom.active[querySelector]
            widgetdom.update(currNode, widget)
        } else {
            const rootElement = window.document.querySelector(querySelector);
            if (rootElement){
                widgetdom.firstRender(rootElement, querySelector, widget)
            } else {
                window.addEventListener('load', () => {
                    const rootElement = window.document.querySelector(querySelector);
                    if (rootElement){
                        widgetdom.firstRender(rootElement, querySelector, widget)
                    }
                })
            }
        }
    }

    static active = {}
    static firstRender(rootElement, querySelector, widget){
        const result = widgetdom.createElement(widget)
        widgetdom.active[querySelector] = widget
        rootElement.innerHTML = ''
        rootElement.appendChild(result)
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
		if ('_name' in obj){
			stateName = obj['_name'];
			delete obj['_name'];
		} else {
			stateName = 'state_' + widgetstate.state_length;
		}

		if (props && 'name' in props)
			stateName = props.name



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
				widgetstate.setAlias(stateName, prop, value)
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

	/** 
	 * Установка значений в widgetstate.url
	*/
	static setupProps(stateName, props){
		widgetstate.props[stateName] = props

		if ('alias' in props){
			Object.keys(props.alias).forEach(prop => {

				if (!('default' in props) || props.default[prop]!=widgetstate.name(stateName)[prop]){
					widgetstate.url[props.alias[prop]] = widgetstate.name(stateName)[prop]
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
			const defaultValue = widgetstate.props[stateName]?.default
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
				}
			}, 100)
		}
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

	static checkIn(self){
		const state = this;
		return (prop, val, _true, _false = false) => {
			return state.watch(prop, function(prop){
				return prop.includes(val)
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

	static modelIn(self){
		const state = this;
		return (prop, value) => {
			return {
				link(widget, argument){

					widget.rootElement.onchange = function(){
						const checkboxValue = this[argument]
						const unique = new Set(state[prop])
						if (checkboxValue){
							unique.add(value)
						} else {
							unique.delete(value)
						}
						state[prop] = Array.from(unique)
					}

					state.watch(prop, array => {
						return array.includes(value)
					}).link(widget, argument)
				}
			}
		}
	}
}
// widgettools.js

class widgettools {
    static create(element){
		return widgettools[element.element](element)
	}

	static app(props){
		widgetdom.render('#app', c.div(props))
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

	static state_model(props){
		return widgetstate.name(props.state).model(props.prop)
	}

	static state_modelIn(props){
		return widgetstate.name(props.state).modelIn(props.prop, props.value)
	}



	static func(props){
		return Function(props.function);
	}

	static widget_request(props){
		return {
			link: function(widget, prop){

				const state = {}
				props.useState.map(stateName => (
					state[stateName] = widgetstate.name(stateName).data()
				))

				return function(){
					fetch(props.url, {
						method: 'POST',
						body: JSON.stringify({
							state
							// this: widget.props
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
		const state_map = //widgetstate.name(props.state).watch(props.prop, function(array){
			//return 
			// array
			widgetstate.name(props.state)._list
			.map(itm => {
				let reference = JSON.stringify(props.refernce)
				props.useColls.map(replace => {
					reference = reference.replaceAll(`**${replace}**`, itm[replace])
				})
				const myProps = JSON.parse(reference)
				if ('_name' in myProps) delete myProps['_name']
				const newElement = c.div(myProps)

				return newElement
			})
		//})

		const element = c.div(state_map)
		return element
	}

	static state_update(props){
		return () => {

			Object.keys(props.stateProps).forEach(prop => {
				widgetstate.name(props.state)[prop] = props.stateProps[prop]
			})
		}
	}

	static state_update_group(props){
		return () => {

			Object.values(props.list).forEach(prop => {
				
				const func = widgetconvertor.toFunction(prop)
				func()
				
				
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

        const width = props.width?props.width:0
        const height = props.height?props.height:0



        dragboard.rootElement.style.position = 'relative'
        dragboard.rootElement.style.userSelect = 'none'
        dragboard.rootElement.style.width = width + 'px'
        dragboard.rootElement.style.height = height + 'px'

        if ('childs' in props) {
            const widgets = widgetconvertor.toArrayOfWidgets(props.childs);
            widgets.forEach(widget => {
                dragboard.rootElement.appendChild(
                    widgetdom.createElement(widget)
                )
            })
        }



        let shift = false;

        function mousemove(x, y){
            let posx, posy = 0
            if (props?.axis != 'y'){
                posx = (parseInt(elements[mouseDown].style.left) + x)
                elements[mouseDown].style.left = posx + 'px'
            }
            if (props?.axis != 'x'){
                posy = (parseInt(elements[mouseDown].style.top) + y)
                elements[mouseDown].style.top = posy + 'px'
            }

            if (typeof props.ondrag == 'function'){
                let valposx = posx
                let valposy = posy

                if (props?.unit == '%'){
                    valposx = posx / ((width - boxsizing.x) / 100)
                    valposy = posy / ((height - boxsizing.y) / 100)
                }
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

        widgets = widgetconvertor.toArrayOfWidgets(widgets)
        widgets.forEach((widget, key) => {
            
            const dragElement = widgetdom.createElement(widget)
            if (shift){
                let left = 0
                let top = 0
                if (props?.axis != 'y')
                    left = shift[key]

                if (props?.axis != 'x')
                    top = shift[key]

                if (props?.unit == '%'){
                    left = ((width - boxsizing.x) / 100) * left
                    top = ((height - boxsizing.y) / 100) * top
                }
                dragElement.style = `position: absolute; left: ${left}px; top: ${top}px`;
            } else {
                dragElement.style = 'position: absolute; left: 0px; top: 0px';
            }
            dragElement.onmousedown = (event) => {
                mouseDownPosition = [event.screenX, event.screenY]; 
                mouseDown = key
            }
            
            

            dragboard.rootElement.onmousemove = (event) => {
                if (mouseDown!==false){
                    mousemove(event.screenX - mouseDownPosition[0], event.screenY - mouseDownPosition[1]);
                    mouseDownPosition = [event.screenX, event.screenY];
                }
            }

            dragboard.rootElement.onmouseup = () => {mouseDown = false}
            dragboard.rootElement.onmouseleave = () => { mouseDown = false }
            

            dragboard.rootElement.appendChild(dragElement)
            elements.push(dragElement)
        })
        // console.log(widget, props)
    }
}

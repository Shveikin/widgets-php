// c.js

const c = new Proxy({}, {
	get:(_, _type) => {
        return (source) => {
            const id = widgetdom.getId()

            const [type, props, childs] = widgetconvertor.distribution(_type, source)
            return {
                id,
                type,
                props,
                childs,
            }
        }
    }
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

		const childElements = ['child', 'childs', 'type']

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
			case 'Array':
				childs = widgetconvertor.toArrayOfWidgets(source)
			break;
			case 'Element':
				type = source.element
			case 'Object':
				if ('type' in source){
					type = source['type']
				}
				Object.keys(source).forEach(prop => {
					if (childElements.includes(prop)){
						if (prop!='type'){

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



    static convert(path, element, from, to, state = false){
		if (from == to){
			return element
		}
        const func = `${from}To${to}`
		
        if (func in widgetconvertor){
			const result = widgetconvertor[func](path, element, state)
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
		
		return type;
	}


    static checkState(widget, prop){
        const value = widget.props[prop]

		let change = false;
		if (widgetconvertor.getType(value)=='WidgetTools'){
			value = widgettools.create(value)
			change = true
		}

		if (widgetconvertor.getType(value)=='State'){
			widgetstate.inspector(value, widget, prop)
			return [true, false]
		}

		return [change, value]
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
        const rootElement = document.createElement(widget.type);
        widget.rootElement = rootElement

        Object.keys(widget.props).forEach(prop => {
            widgetdom.assignProp(widget, prop)
        });

        widget.childs.forEach(childWidget => {
            const childElement = widgetdom.createElement(childWidget)
            rootElement.appendChild(childElement)
        })

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
        const max = Math.max(currNode.childs.length, nextNode.childs.length)
        for (let i = 0; i < max; i++) {
            if (currNode.childs[i]) {
                if (!widgetdom.update(
                    currNode.childs[i],
                    nextNode.childs[i],
                    i
                )) {
                    deleteIndexs.push(i)
                }
            } else {
                currNode.rootElement.appendChild(
                    widgetdom.createElement(nextNode.childs[i])
                )
                currNode.childs.push(nextNode.childs[i])
            }
        }
        if (deleteIndexs.length!=0){
            console.log('deleteIndexs', deleteIndexs)
            const nw = []
            currNode.childs.forEach((child, key) => {
                if (!deleteIndexs.includes(key)) {
                    nw.push(child)
                }
            })
            currNode.childs = nw
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
            case 'String':
            case 'Int':
                widget.rootElement[prop] = value
            break;
            case 'Function':
                if (prop.substr(0,2)=='on'){
                    widget.rootElement[prop] = function(){
                        value.apply(this)
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



}
// widgetstate.js


class widgetstate {
    static state_length = 0;
	static names = {};

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

    static use(obj){
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
			state.link(widget, changeWidgetProp)
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
}
// widgettools.js

class widgettools {
    static create(element){
		return WidgetTools[element.element](element)
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

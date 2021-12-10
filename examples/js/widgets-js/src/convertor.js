
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
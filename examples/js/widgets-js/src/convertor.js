
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
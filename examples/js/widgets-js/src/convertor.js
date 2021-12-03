
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